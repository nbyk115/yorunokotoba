# Workload Identity Federation (keyless auth) - cybersecurity-playbook 分離 (2026-05-15 PR #199 物理化)

> INFERENCE: Anthropic 公式ドキュメント (platform.claude.com/docs/en/manage-claude/workload-identity-federation) に基づく。仕様変更リスクあり、採用前に最新ドキュメントを必ず参照。

## なぜ keyless auth が必要か

cybersecurity-playbook §3 の鉄則「ローテーション 90 日」と「最小権限」は API Key 長期保管を前提とするが、以下のリスクは残る。

- CI Secrets / `.env` に長期 API Key を保管 → 漏洩時、有効期限まで攻撃者が自由に使用可能 (マネーフォワード事案と同構造)
- ローテーション漏れ → 90 日ルールを形骸化させる運用ミスが蓄積
- 鍵の数が増えるほど管理コストが指数的に上昇

keyless auth は「家の合鍵 (長期 API Key)」から「毎回入館証 (短命トークン都度発行)」モデルへ移行し、鍵そのものを保管しない設計で上記リスクをカテゴリごと排除する。

## 仕組み

```
既存クラウド ID (AWS IAM Role / GCP SA / GitHub Actions OIDC 等)
        |
        v (Trust Federation: 既存 ID を Anthropic に信頼させる)
Anthropic STS (Security Token Service)
        |
        v (短命トークン発行、TTL: 分〜時間単位)
Claude API 呼び出し
```

API Key を環境変数 / CI Secrets に保存しない。トークンはリクエスト都度発行され、有効期限切れで自動失効する。

## 対応プロバイダー (2026-05-06 時点、INFERENCE)

| プロバイダー | 認証元 ID | 適合ユース |
|---|---|---|
| AWS | IAM Role (EC2 / Lambda / ECS) | AWS 上のバックエンド・バッチ処理 |
| GCP | Service Account (Workload Identity Pool) | GCP 上の Cloud Run / GKE |
| Azure | Managed Identity / Azure AD | Azure Functions / AKS |
| GitHub Actions | OIDC トークン (`id-token: write`) | CI/CD パイプライン |
| Kubernetes | Service Account + OIDC | k8s ワークロード |

## メリット 4 点

1. 漏洩時の影響限定: 短命トークンは有効期限内のみ有効。漏洩しても数分〜数時間で無効化
2. 監査追跡の精度向上: クラウド IAM 監査ログとの連携で「誰が・いつ・どのロールで呼び出したか」を追跡可能
3. 権限管理の一元化: シークレットのローテーション管理が不要。クラウド IAM に集約
4. クラウドネイティブ統合: 既存の IAM ポリシー・SCPs・組織ポリシーを Claude API にそのまま適用可能

## デメリット・制約

- IMPORTANT: 設定が複雑。Trust Federation の設定ミスは認証不能または過剰権限付与につながる (tech-lead のレビュー必須)
- 小規模・個人開発・ローカル検証: API Key の方がコスト対効果が高い。keyless auth の導入は過剰設計になりやすい
- Anthropic 側仕様: 2026-05-06 時点で全プランに提供されているか要確認 (エンタープライズ向けの可能性あり)

## 移行判断基準

| 規模 / 状況 | 推奨 |
|---|---|
| 個人開発・PoC・小規模 (開発者 1〜3 名) | 既存 API Key + 90 日ローテーション継続 |
| 中規模 SaaS (CI/CD + GitHub Actions 運用あり) | GitHub Actions OIDC keyless auth を優先検討 |
| 本番運用 (AWS / GCP / Azure 上) | プロバイダー Managed Identity / IAM Role keyless auth を採用 |
| マルチクラウド / エンタープライズ | 全ワークロードに keyless auth 適用、API Key 発行自体を禁止するポリシーも検討 |

**NEVER**: keyless auth 移行後も旧 API Key を CI Secrets に残置する (即削除・ローテーション必須)。

## 連携エージェント

| エージェント | 責務 |
|---|---|
| `service-dev/tech-lead` | Trust Federation 設計・IAM ポリシーレビュー・移行判断 |
| `service-dev/fullstack-dev` | SDK 側の認証フロー実装 (API Key → Federation Token への切替) |
| `service-dev/ai-engineer` | Claude API 呼び出しコードの keyless auth 対応 (Anthropic SDK の認証設定) |
| `service-dev/infra-devops` | AWS IAM Role / GCP SA / GitHub Actions OIDC の設定・CI/CD パイプライン修正 |
| `consulting/legal-compliance-checker` | エンタープライズ案件での監査証跡要件・契約上の認証要件の整合確認 |

> 出典 (FACT): Anthropic 公式ドキュメント - Workload Identity Federation (platform.claude.com/docs/en/manage-claude/workload-identity-federation)
