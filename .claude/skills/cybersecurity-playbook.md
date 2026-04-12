# Cybersecurity Playbook — サイバーセキュリティ標準

## 概要
全エージェント・全プロジェクトに適用されるサイバーセキュリティの標準手法。
「セキュリティは専門部署の仕事」ではなく「全員の責任」として設計に組み込む。

---

## 1. シフトレフト原則 — 設計段階でセキュリティを組み込む

> **バグを本番で見つけるコストは、設計段階の100倍。セキュリティも同じ。**

### 各フェーズのセキュリティ責務
| フェーズ | 担当 | やること |
|---|---|---|
| 要件定義 | strategy-lead / product-manager | 脅威モデリング。「誰が・何を・どう攻撃するか」を事前定義 |
| 設計 | tech-lead | 認証・認可・データフロー・暗号化方針の決定 |
| 実装 | fullstack-dev / ai-engineer | OWASP Top 10準拠。入力バリデーション。シークレット管理 |
| テスト | /security-scan | 自動スキャン。CI/CDに組み込み |
| デプロイ | infra-devops | TLS強制・ヘッダー設定・WAF・ネットワークポリシー |
| 運用 | infra-devops / tech-lead | ログ監視・インシデント対応・パッチ管理 |

---

## 2. OWASP Top 10（2025年版準拠）

### チェックリスト（全プロジェクト必須）

```
□ A01 アクセス制御の不備
  - 全エンドポイントに認証・認可チェックがあるか
  - IDOR（他ユーザーのリソースへの直接アクセス）が防がれているか
  - 管理者機能に適切なロールチェックがあるか

□ A02 暗号化の失敗
  - パスワードはbcrypt/argon2でハッシュ化されているか
  - 通信はTLS 1.2以上か
  - 機密データがログに出力されていないか

□ A03 インジェクション
  - SQLインジェクション: パラメータ化クエリ/ORMを使用しているか
  - XSS: ユーザー入力をサニタイズしているか。dangerouslySetInnerHTML禁止
  - コマンドインジェクション: シェルコマンドにユーザー入力を直接渡していないか

□ A04 安全でない設計
  - 脅威モデリングを実施したか
  - ビジネスロジックの悪用パターンを検討したか
  - レート制限があるか

□ A05 セキュリティ設定ミス
  - CORS: ワイルドカード（*）を使っていないか
  - デバッグモードが本番で無効か
  - デフォルトパスワード/アカウントが残っていないか
  - 不要なHTTPメソッドが無効化されているか

□ A06 脆弱なコンポーネント
  - npm audit / pip audit で既知CVEがないか
  - ロックファイル（package-lock.json / poetry.lock）がコミットされているか
  - 依存パッケージの最終更新日が2年以内か

□ A07 認証の不備
  - 多要素認証（MFA）が利用可能か
  - セッション管理: 適切な有効期限・無効化処理があるか
  - パスワードポリシー: 最低8文字・ブルートフォース対策

□ A08 ソフトウェアとデータの整合性
  - CI/CDパイプラインが改ざんされていないか
  - SRI（Subresource Integrity）ハッシュがCDNリソースに付与されているか
  - 署名検証: パッケージ・コンテナイメージの署名確認

□ A09 ログとモニタリングの不備
  - 認証失敗・認可エラー・入力バリデーション失敗をログに記録しているか
  - ログに機密情報（パスワード・トークン・PII）が含まれていないか
  - アラート: 異常なパターン（大量ログイン失敗等）で通知が飛ぶか

□ A10 SSRF（サーバーサイドリクエストフォージェリ）
  - ユーザー入力のURLを内部ネットワークに転送していないか
  - URLのホワイトリスト/ブラックリストが設定されているか
```

---

## 3. シークレット管理

### 鉄則
- **ハードコード絶対禁止**: APIキー・トークン・パスワードをコードに書かない
- **環境変数で管理**: `.env`ファイルは`.gitignore`に必ず追加
- **ローテーション**: シークレットは90日ごとにローテーション
- **最小権限**: APIキーは必要最小限のスコープで発行

### 検知パターン（/security-scan用）
```bash
# 以下のパターンがコードに含まれていたらCritical
sk-[a-zA-Z0-9]{32,}          # OpenAI/Anthropic APIキー
AKIA[A-Z0-9]{16}              # AWS Access Key
ghp_[a-zA-Z0-9]{36}           # GitHub Personal Access Token
xoxb-[0-9]{10,13}-[a-zA-Z0-9] # Slack Bot Token
-----BEGIN.*PRIVATE KEY-----   # 秘密鍵
password\s*[:=]\s*['"][^'"]{8,}  # ハードコードパスワード
```

---

## 4. 認証・認可設計パターン

### 認証
| 方式 | 用途 | セキュリティレベル |
|---|---|---|
| OAuth 2.0 + PKCE | Webアプリ・SPA | 高 |
| JWT + Refresh Token | API認証 | 高（Refresh Tokenの管理が鍵） |
| Magic Link | メール認証 | 中（メールセキュリティに依存） |
| パスワード + MFA | 従来型 | MFAありなら高 |
| API Key | サーバー間通信 | 中（スコープ制限必須） |

### 認可
- **RBAC**（Role-Based Access Control）: ユーザー → ロール → 権限
- **ABAC**（Attribute-Based Access Control）: 属性ベース（時間・場所・デバイス）
- **全エンドポイントに認可チェック**: デフォルト拒否。明示的に許可する

---

## 5. データ保護

### 分類
| レベル | 例 | 保護要件 |
|---|---|---|
| 極秘 | 決済情報・パスワード | 暗号化必須。アクセスログ。最小権限 |
| 機密 | PII（氏名・メール・電話） | 暗号化推奨。同意取得。削除対応 |
| 社内 | 売上データ・戦略文書 | アクセス制限。外部共有禁止 |
| 公開 | マーケ資料・ブログ | 制限なし |

### PII（個人識別情報）の取り扱い
- 収集は必要最小限（データミニマイゼーション）
- 利用目的を明示（プライバシーポリシー）
- 削除リクエストに対応（GDPR/個人情報保護法）
- ログにPIIを含めない

---

## 6. インフラセキュリティ

### ネットワーク
- TLS 1.2以上を強制（HTTP→HTTPSリダイレクト）
- セキュリティヘッダー: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- WAF（Web Application Firewall）の導入検討
- DDoS対策（Cloudflare / AWS Shield）

### コンテナ
- ベースイメージは最小構成（Alpine/Distroless）
- rootユーザーで実行しない
- イメージスキャン（Trivy/Snyk）をCI/CDに組み込み
- シークレットをDockerfile/docker-compose.ymlに書かない

### CI/CD
- パイプラインの改ざん防止（署名付きコミット）
- 依存関係スキャン（npm audit / pip audit）を自動実行
- SASt（静的解析）をPR時に自動実行

---

## 7. インシデント対応（セキュリティ版）

> `incident-response.md`の障害対応に加え、セキュリティ固有の対応手順。

### セキュリティインシデントの分類
| SEV | 例 | 対応時間 |
|---|---|---|
| SEV1 | データ漏洩・不正アクセス・ランサムウェア | 即時（1時間以内に初動） |
| SEV2 | 脆弱性の悪用（未遂含む）・DDoS | 4時間以内 |
| SEV3 | 脆弱性の発見（未悪用）・設定ミス | 24時間以内 |

### 対応フロー
```
1. 検知 → 即座に影響範囲を特定
2. 封じ込め → 攻撃経路を遮断（アカウント無効化/IP遮断/サービス隔離）
3. 証拠保全 → ログ・スナップショット・通信記録を保存（削除禁止）
4. 復旧 → パッチ適用/シークレットローテーション/サービス復旧
5. 報告 → 影響を受けたユーザーへの通知（法令に基づく期限内）
6. 事後分析 → 根本原因分析 + 再発防止策
```

---

## 8. AI固有のセキュリティ

> ConsultingOSの34エージェントが扱うAI固有のリスク。

### プロンプトインジェクション対策
- ユーザー入力とシステムプロンプトを明確に分離
- 外部データ（Web取得・ファイル読み込み）にはサニタイズフィルタを適用
- AI出力を直接eval/execしない
- 機密情報をシステムプロンプトに含めない

### データ汚染対策
- RAGのデータソースの信頼性を検証
- 学習データ/ナレッジベースの改ざん検知
- ユーザー入力がナレッジベースに直接書き込まれない設計

### AI出力のリスク
- AI生成コードのセキュリティレビュー必須（/security-scan）
- AI生成コンテンツのファクトチェック（ハルシネーション対策）
- AI生成の法的文書は必ず専門家レビュー（legal-compliance-checkerの免責事項）

---

## 8.5 サプライチェーンセキュリティ（npm / PyPI / GitHub Actions）

> **依存パッケージ経由の攻撃が2024-2026年で急増。OWASP A08「ソフトウェアとデータの整合性」の実装詳細。**

### 脅威モデル
- 悪意あるパッケージ（typosquatting: expres, loadsh 等）
- 既存パッケージの乗っ取り（メンテナアカウント侵害）
- preinstall / postinstall スクリプトでの任意コード実行
- ビルドパイプライン改ざん（GitHub Actions injection）

### 8つの防御設定

**1. ロックファイル強制コミット**
```
package-lock.json / yarn.lock / pnpm-lock.yaml / poetry.lock
→ 必ずgit管理。CI時は `npm ci` を使い `npm install` を禁止
```

**2. 自動脆弱性スキャン（CI組込）**
```yaml
# GitHub Actions例
- run: npm audit --audit-level=high
- run: pip-audit
```
`audit-level=high`以上でCIを落とす。

**3. Dependabot / Renovate で自動更新PR**
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

**4. preinstallスクリプトをブロック**
```bash
# 新規パッケージ追加時
npm install --ignore-scripts <package>
# その後、信頼できるもののみscriptを手動実行
```

**5. GitHub Secret Scanning + Push Protection**
```
Settings → Code security and analysis → Secret scanning: Enabled
Push protection: Enabled
→ コミット時にシークレットを自動検知・ブロック
```

**6. Dependency Review Action（PR時の新規依存チェック）**
```yaml
# .github/workflows/dependency-review.yml
- uses: actions/dependency-review-action@v4
  with:
    fail-on-severity: high
```

**7. npm provenance / SLSA対応**
```bash
# パッケージ公開時にprovenanceを付与
npm publish --provenance

# インストール時に検証
npm install --auditlevel=high
```

**8. GitHub Actions のpin固定**
```yaml
# 悪い例: バージョンタグ（書き換え可能）
- uses: actions/checkout@v4

# 良い例: commit SHAで固定
- uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1
```

### typosquatting対策
- 新規パッケージ追加前に GitHub Stars / ダウンロード数 / メンテナ履歴を確認
- 類似名（`lodash` vs `loadsh`, `express` vs `expres`）に注意
- `npm view <package>` で公開元・メンテナを確認

### ConsultingOS適用
- `fullstack-dev` / `frontend-dev` / `ai-engineer`: 新規パッケージ追加前に上記1-5を必ず確認
- `infra-devops`: CI/CDに2, 6, 8を組み込み
- `tech-lead`: 四半期ごとに全プロジェクトの依存監査

---

## 9. ConsultingOSエージェント別セキュリティ責務

| エージェント | セキュリティ責務 |
|---|---|
| tech-lead | 脅威モデリング・セキュリティ設計レビュー・依存関係監査 |
| fullstack-dev | OWASP Top 10準拠の実装・入力バリデーション・シークレット管理 |
| ai-engineer | プロンプトインジェクション対策・データ汚染防止・API認証設計 |
| infra-devops | TLS/ヘッダー設定・コンテナセキュリティ・監視・パッチ管理 |
| frontend-dev | XSS対策・CSP設定・SRI実装・認証フロー実装 |
| legal-compliance | GDPR/個人情報保護法準拠・データ漏洩時の法的対応 |
| brand-guardian | フィッシング/なりすまし対策・ブランド保護 |

---

## 禁止事項
- シークレットのリポジトリコミット（検知したら即ローテーション）
- 本番環境でのデバッグモード有効化
- rootユーザーでのコンテナ実行
- 入力バリデーションなしでのDB操作
- AI出力のセキュリティレビューなしでの本番適用
- ログへのPII/シークレット出力
- セキュリティインシデントの隠蔽（報告義務）


> 反証モード（トリプルチェック）の共通ルールは CLAUDE.md を参照。

---

## バージョン履歴

| Ver | 日付 | 変更内容 | 根拠 | 効果 |
|---|---|---|---|---|
| 1.0.0 | 2026-04-10 | 初版 | サイバーセキュリティの体系的スキル欠如 | ベースライン |
