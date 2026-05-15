---
name: create-pull-request
description: ConsultingOS Git 規律に準拠した PR 作成手順。feature branch → commit → push → PR 起票 → Squash and merge → ブランチ削除 → PR URL 提示の標準フロー。Warp oz-skills を ConsultingOS ハードルール 4 / 6 / 7 / 12 / 15 統合版に翻訳（2026-05-08 PR BH 物理化）。
---

# create-pull-request: ConsultingOS PR 作成標準フロー

## いつ使うか

- ユーザーが「PR 作成」「コミット + push」「変更を main に統合」を依頼した時
- 自己実装 PR（OS 改善）/ 外部クライアント案件 PR（納品物）の両方に適用
- セッション内で複数 PR を作成する場合も毎回この skill を参照

## ConsultingOS Git 規律（CLAUDE.md ハードルール統合）

| ルール | 内容 |
|---|---|
| ハードルール 4 | NEVER: `git push --force` / `git reset --hard` / `rm -rf` / `chmod 777` / `--dangerously-skip-permissions` 実行 |
| ハードルール 6 | IMPORTANT: PR は Squash and merge 必須、マージ後ブランチ削除、PR URL ユーザー提示 |
| ハードルール 7 | NEVER: main への直接 push、必ず feature branch + PR 経由 |
| ハードルール 12 | YOU MUST: 1 コミット = 1 目的、複数変更の混在禁止、「ついで」「せっかくなので」が出たら即中断 |
| ハードルール 15 | IMPORTANT: ファイル削除・force push・DB drop 等の不可逆操作はユーザー承認必須 |

## 標準フロー（7 ステップ）

### Step 1: 現在地確認

```bash
git status -sb
git log --oneline -3
```

確認事項:
- feature branch にいるか（main / master でないか）
- 直近 commit が意図通りか
- 未追跡ファイルの有無

### Step 2: 変更内容のレビュー

```bash
git diff --stat
git diff <変更ファイル>
```

ハードルール 12 適合チェック: 1 コミット = 1 目的か、複数変更が混在していないか。混在していれば段階コミットに分割。

### Step 3: 反証チェック Step 1-3 実行

CLAUDE.md ハードルール 1 の必須プロセス。コミット前に:
- Step 1 自己反証: 変更が意図通りか、副作用ないか
- Step 2 構造反証: 既存規律 / 設計と整合するか
- Step 3 実用反証: 実機検証コマンド + 出力添付（grep / wc / find / test / git diff / pdffonts / unzip 等）

ブランドガイドライン適合チェック:
```bash
grep -c $'\xe2\x80\x94\|\xe2\x80\x93' <変更ファイル>  # em-dash / en-dash 検出（0 件必須）
```

### Step 4: ファイル追加 + コミット

```bash
git add <具体ファイル名>  # IMPORTANT: 「git add -A」「git add .」は .env / credentials 巻き込みリスクで非推奨
git commit -m "$(cat <<'EOF'
<type>(<scope>): <要約>（PR 識別子）

<本文>

検証:
- <実機検証コマンド + 結果>

ハードルール <番号> 履行:
- 追加: <内容>
- 削除: <内容>

担当: <agent 名 or assistant 直接>

https://claude.ai/code/session_<session_id>
EOF
)"
```

コミットメッセージ規律:
- type: feat / fix / refactor / docs / test / chore / security
- scope: hook / skill / agent / command 等
- 末尾に `https://claude.ai/code/session_<id>` 付与（Claude Code 標準）
- 反証チェック実測値を本文に必ず含める

### Step 5: push

```bash
git push -u origin <feature-branch-name>
```

注意:
- `block-main-push.sh` hook が `git push origin main` を物理ブロック（exit 2）
- bypass 6 種（HEAD:main / refs/heads/main / +main / --all / --mirror）も全ブロック
- ネットワーク失敗時は exponential backoff（2s → 4s → 8s → 16s）で最大 4 回リトライ
- `--force` は使用禁止（ハードルール 4）。`--force-with-lease` は不可逆操作のためユーザー明示承認必須（ハードルール 15）

### Step 6: PR 起票

```javascript
mcp__github__create_pull_request({
  owner: "nbyk115",
  repo: "consulting-os",
  base: "main",
  head: "<feature-branch-name>",
  title: "<type>(<scope>): <要約>（PR 識別子）",
  body: `## 背景\n<課題説明>\n\n## 修正内容\n- 変更点 1\n- 変更点 2\n\n## 検証\n- 実機コマンド + 出力\n\n## ハードルール 13 履行\n- 追加: <内容>\n- 削除: <内容>\n\n## 反証チェック結果\n- Step 1 自己反証: ...\n- Step 2 構造反証: ...\n- Step 3 実用反証: ...\n- Step 4 リスク即潰し: ...\n\n## マージ方針\nハードルール 6: Squash and merge 必須、マージ後ブランチ削除\n\nhttps://claude.ai/code/session_<id>`
})
```

PR タイトル規律:
- 70 文字以内（GitHub UI 表示制限）
- 日本語可、絵文字禁止（ハードルール 16 ①）
- PR 識別子（例: PR BH）を末尾括弧で付与

PR body 規律:
- ハードルール 16 ⑥: em-dash / en-dash 禁止（コロン / ハイフン / カンマで代替）
- 反証チェック Step 1-4 必須
- 検証セクションに実機コマンド + 出力本文添付（narrative-only 禁止）

### Step 7: PR URL ユーザー提示 + マージ方針通知

```
URL: https://github.com/nbyk115/consulting-os/pull/<番号>
マージ方針: ハードルール 6 Squash and merge 必須、マージ後ブランチ削除
ユーザー側 TODO: GitHub UI で Squash and merge → ブランチ削除（30 秒）
```

### Step 8（マージ後）: ローカル同期

ユーザーから「マージ完了」報告を受けたら:

```bash
git fetch origin main
git rebase origin/main
[ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] && echo "MATCH" || echo "MISMATCH"
```

注意:
- squash merge は commit hash 不一致のため `[ahead N, behind M]` 状態が必ず発生
- `--force-with-lease` push が必要だが不可逆操作のためユーザー明示承認必須（ハードルール 15）
- 代替: 同 branch 継続使用がユーザー指示なら force-with-lease 承認を求める / 別 branch 名で次回開始

## 禁止事項

- NEVER: `git push --force`（ハードルール 4）
- NEVER: `git reset --hard`（ハードルール 4）
- NEVER: main / master へ直接 push（ハードルール 7、`block-main-push.sh` で物理ブロック）
- NEVER: `git add -A` / `git add .`（.env / credentials 巻き込みリスク）
- NEVER: `--no-verify` / `--no-gpg-sign` / `--dangerously-skip-permissions`（ハードルール 4）
- NEVER: 1 コミットに複数目的を混在（ハードルール 12）
- NEVER: 反証チェック実測値なしの完了断言（ハードルール 1、`stop-validator.sh` で検証）
- NEVER: em-dash / en-dash 含む PR body（ハードルール 16 ⑥、`emdash-detector.sh` で検証）

## 違反時の対応

- pre-commit hook 失敗 → fix + 新規 commit（amend は使わない、過去 commit 上書きで履歴喪失リスク）
- push 失敗（block-main-push.sh トリガー）→ feature branch 作成 + PR 経由で再実行
- stop-validator.sh トリガー（完了系キーワード未実測）→ 実測コマンド実行 + 出力添付で再応答

## 統合運用 agent

- `tech-lead`: コード変更 PR / アーキテクチャ判断
- `infra-devops`: hook / CI/CD / 設定変更 PR
- `creative-director`: 納品物 PR（HTML / PPTX / PDF）
- `proposal-writer`: 提案書 PR
- `brand-guardian`: PR 起票前の規律準拠検証（em-dash / 字形 / 主語詐称）

## 参考

- 出典: Warp oz-skills `create-pull-request`（2026-05-08 取得、ConsultingOS 規律統合版に翻訳）
- 関連: CLAUDE.md ハードルール 4 / 6 / 7 / 12 / 13 / 15 / 16
- 検証 hook: `block-main-push.sh` / `emdash-detector.sh` / `stop-validator.sh` / `self-fraud-check.sh` / `reality-check.sh`
- 関連 skill: `falsification-check` / `brand-guidelines` / `claude-code-ops`
