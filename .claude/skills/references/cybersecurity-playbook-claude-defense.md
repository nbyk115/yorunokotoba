## 9.5 Claude Code 多層防御（Multi-Layer Defense: 3層）

> **「信頼」ではなく「制御」で固める。** モデル判断 → 技術ブロック → Git 物理ブロックの3層で防御。Layer 1+2 は Claude Code 経由のみ守る → 人間が手動 `git add` した瞬間にすり抜ける。Layer 0 で Git レベル物理ブロック。

### 防御アーキテクチャ

```
Layer 0: Git pre-commit/pre-push hook（最終物理ブロック）
├─ Gitleaks で全 commit/push を機械検査
├─ Claude Code 経由でも手動 git add でも同じく阻止
└─ 新リポジトリ作成時に初日タスク化

Layer 1: CLAUDE.md（意図レベル）
├─ 自然言語で禁止事項を明示
├─ モデルの「判断」に依存する層
└─ リスク: モデルが例外を自己判断する可能性

Layer 2: settings.json（技術レベル）
├─ permissions.deny でコマンドパターンを技術的にブロック
├─ モデルの判断に関係なく実行を阻止
└─ リスク: deny リストに無いパターンはすり抜ける

3層を組み合わせ → モデル判断ミス + 手動コミットすり抜けを物理的にキャッチ
```

### Layer 0: Git pre-commit/pre-push hook（最終物理ブロック）
- **本リポジトリ実装済**: `.githooks/pre-commit` + `.githooks/commit-msg`（依存ゼロ・grep ベース、Gitleaks 併用可能）
- 初回セットアップ: `bash .githooks/setup.sh` で `core.hooksPath = .githooks` 自動設定
- 検知パターン: AWS / Anthropic / OpenAI / GitHub Token / PEM 秘密鍵 / .env 誤コミット / ハードコードパスワード / 環境変数ハードコード / commit message 機密混入
- **Gitleaks 併用推奨**（[gitleaks/gitleaks](https://github.com/gitleaks/gitleaks)、MIT / 無料）: `brew install gitleaks` または GitHub Actions `gitleaks-action`、本リポの `.githooks/pre-commit` は gitleaks がインストール済なら追加実行
- クライアント案件リポジトリでも同 `.githooks/` をコピーして pre-commit hook 必須化

### Layer 1: CLAUDE.md に記載すべきルール（意図レベル）

| カテゴリ | ルール例 |
|---|---|
| 機密ファイル | `.env`, `credentials`, `secrets` の読み取り・出力・コミット禁止 |
| 破壊的 Git 操作 | `push --force`, `reset --hard` 禁止 |
| 外部通信 | POST/PUT/DELETE はユーザー承認なしに実行しない |
| MCP 書き込み | Figma 編集、GitHub push_files 等はタスク単位で承認 |
| ファイル破壊 | `rm -rf`, `chmod 777` 禁止 |

### Layer 2: settings.json に設定すべき deny パターン（技術レベル）

```json
{
  "permissions": {
    "deny": [
      "Bash(rm -rf /*)",
      "Bash(rm -rf ./*)",
      "Bash(chmod 777 *)",
      "Bash(git push --force *)",
      "Bash(git push * --force*)",
      "Bash(git reset --hard *)",
      "Bash(sudo *)",
      "Bash(cat *.env*)",
      "Bash(cat *credentials*)",
      "Bash(cat *secret*)",
      "Bash(*> .env*)",
      "Read(.env*)",
      "Read(*credentials*)",
      "Read(*secret*)"
    ]
  }
}
```

### なぜ 2 層が必要か

| 防御 | 攻撃パターン | 結果 |
|---|---|---|
| Layer 1 のみ | モデルが「この .env は開発用だから読んで良い」と自己判断 | 機密漏洩 |
| Layer 2 のみ | 新ツール `Bash(base64 .env)` が deny に未登録 | すり抜け |
| **両方** | Layer 1 で意図を理解 + Layer 2 で技術ブロック | **安全** |

### 運用チェックリスト

- [ ] CLAUDE.md にルール追加 → settings.json の deny にも対応パターンを追加
- [ ] `/security-scan` 実行時に deny パターンの網羅性を確認
- [ ] 新 MCP 追加時にセキュリティ影響を評価
- [ ] deny リストのバイパスパターン（base64, xxd, od 等の間接読み取り）を定期チェック

### ConsultingOS 適用

- **全 34 エージェント**: Layer 1 ルールは CLAUDE.md の「セキュリティ多層防御」セクションに集約
- **settings.json**: プロジェクトルートの `.claude/settings.json` に deny パターンを定義（チームで共有）
- **settings.local.json**: 個人の追加制約は `.claude/settings.local.json` に定義（gitignore 対象）

---

## バージョン履歴

| Ver | 日付 | 変更内容 | 根拠 | 効果 |
|---|---|---|---|---|
| 1.0.0 | 2026-04-10 | 初版 | サイバーセキュリティの体系的スキル欠如 | ベースライン |
| 1.1.0 | 2026-04-12 | §8.7 ガバナンスフレームワーク（ISMS/NIST CSF/CPSF/経営ガイドライン/ISO 27005）追加 | IPA/NIST/METI/ISO 公式資料 + 企業経営サイバーセキュリティ診断チェック | エンジニアリング層とガバナンス層の分離・エンタープライズ案件の共通言語提供 |
| 1.2.0 | 2026-04-12 | §8.8 自律セキュリティテスト（Self-Pentesting）追加 | workers.io/blog/autonomous-mobile-pentesting + Chrome DevTools MCP 連携 | 本番前の動的検証を体系化・倫理規定で悪用防止・サブスク化前の必須チェック明確化 |
| 1.3.0 | 2026-04-18 | §9.5 Claude Code 多層防御（CLAUDE.md + settings.json 2層防御）追加 | Opus 4.7+ モデルの単一層バイパスリスク | 意図レベル + 技術レベルの defense-in-depth 確立 |

## 出典・依拠先

- FACT: 本ファイルは @nbyk115/consulting-os の規律ファイルとして 2026-05-05 PR #65 で体系的に出典明示が物理化された（ファイルパス: .claude/skills/references/cybersecurity-playbook-claude-defense.md、タイトル: # 9.5 Claude Code 多層防御（Multi-Layer Defense: 3層）、規律カテゴリ: ConsultingOS 6 部門 27 エージェント・27 スキル体系の構成要素）
- INFERENCE: 業界標準ベストプラクティス（佐藤裕介流「構造で売る = 仕組みが結果を担保する」、Boris Cherny 流「9 規律 ruthlessly edit」、該当部門の業界フレームワーク）から派生、各セクションの判断基準は実証研究と経験則の両軸を採用
- SPECULATION: 4 週間ごとの再評価カレンダー（evolution-log.md「再評価カレンダー」セクション）で形骸化検出、Boris #3 削除セット対象、規律違反や過剰要件が発生した場合は本ファイルを統合・分離・削除のいずれかで整理する運用予定
