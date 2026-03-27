# Verification Loop — 6フェーズ品質保証スキル

## 概要
機能実装後・PRサブミット前・リファクタリング後に実行する、
6フェーズの体系的品質保証フレームワーク。
PostToolUseフックを補完する深層レビュー機能。
出典: affaan-m/everything-claude-code (verification-loop)

---

## §1 6フェーズ検証

### Phase 1: ビルド検証
```bash
# プロジェクトが正常にコンパイルされるか確認
npm run build  # または: go build / cargo build / python -m py_compile
```
- ✅ 合格: ビルドエラーなし
- ❌ 不合格: ビルドエラーを全解消してから次フェーズへ

### Phase 2: 型チェック
```bash
# TypeScript / Pythonの型エラーを検出
npx tsc --noEmit  # または: mypy . / pyright
```
- ✅ 合格: 型エラーなし
- ❌ 不合格: any の無断使用・型不整合を解消

### Phase 3: リンティング
```bash
# コードスタンダードの適合確認
npm run lint  # または: ruff check . / golangci-lint run
```
- ✅ 合格: リントエラーなし（警告は要判断）
- ❌ 不合格: コードスタンダード違反を修正

### Phase 4: テスト
```bash
# 自動テスト実行
npm test  # または: pytest / go test ./... / cargo test
```
- **目標カバレッジ: 80%以上**
- ✅ 合格: 全テストパス + カバレッジ目標達成
- ❌ 不合格: 失敗テストを修正 / カバレッジ不足なら追加テストを書く

### Phase 5: セキュリティスキャン
```bash
# ハードコードシークレット・デバッグ文の検出
grep -r "console\.log\|debugger\|TODO\|FIXME" src/
grep -r "password\|secret\|api_key\|token" src/ --include="*.ts" --include="*.js"
```
- ✅ 合格: シークレット漏洩なし・デバッグ文なし
- ❌ 不合格: シークレットを環境変数に移動・デバッグ文を削除

### Phase 6: Git Diffレビュー
```bash
# 意図しない変更の検出
git diff --stat HEAD
git diff HEAD -- "*.env" "*.secret" "*.key"
```
- ✅ 合格: 変更が意図したスコープ内に収まっている
- ❌ 不合格: 意図しない変更を確認・元に戻す

---

## §2 実行タイミング

```
✅ 機能実装完了後
✅ PRサブミット前
✅ リファクタリング後
✅ 長時間作業セッション中（15分ごと、または大きな変更後）
✅ バグ修正後の回帰確認
```

---

## §3 レポートフォーマット

```
## Verification Loop レポート
実行日時: YYYY-MM-DD HH:MM

| Phase | ステータス | 詳細 |
|---|---|---|
| 1. ビルド | ✅/❌ | [出力サマリー] |
| 2. 型チェック | ✅/❌ | [エラー数・内容] |
| 3. リンティング | ✅/❌ | [警告/エラー数] |
| 4. テスト | ✅/❌ | [通過/失敗数 / カバレッジ%] |
| 5. セキュリティ | ✅/❌ | [検出事項] |
| 6. Git Diff | ✅/❌ | [変更ファイル数・意図との整合] |

**総合判定**: ✅ READY / ❌ NEEDS WORK

未解決項目:
- [アイテム1]
- [アイテム2]
```

---

## §4 継続監視モード

長時間作業セッションでは定期実行を推奨:
```
推奨頻度: 15分ごと or 大きな変更後
→ 問題を早期発見し、デバッグコストを最小化する
```

---

## §5 ConsultingOS適用エージェント

| エージェント | 使用場面 |
|---|---|
| tech-lead | PR前の最終品質チェック・コードレビュー前の基礎確認 |
| fullstack-dev | 機能実装完了時の自己チェック |
| infra-devops | デプロイ前の品質ゲート |
| frontend-dev | フロントエンド変更後の品質確認 |
| ai-engineer | AIシステム変更後の回帰テスト |
