# Thariq セッション管理 5 パターン (2026-05-14)

`tech-lead` + `ai-engineer` + `infra-devops` 連携の Claude Code セッション管理規律。tech-lead agent 起動判定済。

出典: Anthropic 社員 Thariq @trq212 (X 54 万 view、INFERENCE: ユーザー提示テキスト経由)。

## 1. 5 パターン × ConsultingOS 既存カバー

| Thariq パターン | ConsultingOS 既存 | Gap |
|---|---|---|
| 1 Continue (続行) | default 動作 | なし |
| 2 /rewind (Esc Esc) | **未物理化** | **GAP 大** |
| 3 /clear (新規セッション) | /handoff (PR #157) で代替可 | 部分カバー |
| 4 /compact (圧縮) | /compact 既存 (Hard Rule 4) | カバー |
| 5 Subagents | Sub-Agent パターン (PR #158) | カバー |

## 2. 核心: /rewind が最も過小評価されている

ConsultingOS は forward-only 設計 (/handoff / /goal / workflow.json) に偏重、ロールバック規律未整備。

シナリオ:
- Claude が 5 ファイル読んでアプローチ失敗
- ❌ 普通: 「ダメだった、X を試して」→ 失敗ログ全部コンテキスト残存
- ✅ Thariq: ファイル読み込み直後まで /rewind → 学びを含めて再指示

YOU MUST: 失敗アプローチ検知時、即 /rewind 候補認識。Continue で「学びだけ加える」のは context rot を加速。

## 3. Context Rot 警告 (30-40 万 token、運用指針)

Thariq 経験則:
- 100M token モデルで 30-40 万 token から context rot 発生 (タスク依存)
- compact 失敗は context rot 時の「最低知性」状態で起きる
- 余裕のあるうちに /compact 自分から実行 + 次にやることの方向性を添える

ConsultingOS 規律 (運用指針として claude-code-ops に追記、Hard Rule 化は実測値蓄積後):
- 長セッション検知時 = /handoff (PR #157) or /clear 推奨
- /compact は方向性を添えて実行 (例: `/compact 関根さん N&Y Craft Phase 1 に集中して、過去の関係ないデバッグログは削除`)

## 4. /compact vs /clear トレードオフ

| 軸 | /compact | /clear |
|---|---|---|
| 制御 | 低 (Claude 判断) | 高 (自分で書き出し) |
| 手軽さ | 高 | 低 |
| 不可逆性 | あり (lossy) | なし (自分でまとめ) |
| 推奨シーン | 短期セッション継続 | 大型タスク切り替え |

## 5. Subagent 使い所判定

判断基準: 「このツール出力は後でまた必要か？それとも結論だけあればいいか？」

結論だけでいいなら Subagent に委任 = ConsultingOS Sub-Agent パターン (PR #158) と整合。

明示指示パターン:
- 「Subagent でこの spec ファイルから作業結果を検証して」
- 「Subagent で別のコードベースの auth flow 実装方法を要約して」
- 「Subagent で git diff からこの機能のドキュメントを書いて」

## 6. ConsultingOS 統合判定 (tech-lead agent 起動済)

| 軸 | 状態 |
|---|---|
| /rewind 物理化 | gap、本 references で運用指針追加 |
| Context rot 30-40 万 token 警告 | 運用指針 (Hard Rule 化は実測値蓄積後) |
| /compact 方向性付き実行 | 既存 Hard Rule 4 と整合 |
| Sub-Agent 使い分け | PR #158 で物理化済 |

## 7. ConsultingOS 自己診断

| 5 パターン | 適用度 |
|---|---|
| Continue | 強 |
| /rewind | 弱 (本 references で運用指針追加) |
| /clear | 中 (/handoff で代替) |
| /compact | 中 (方向性付き実行が推奨だが未明示) |
| Subagents | 強 (PR #158) |

## 8. 関連参照

- 出典: Thariq @trq212 (INFERENCE)
- 関連: /handoff (PR #157) / /goal (PR #153) / workflow.json (PR #149) / Sub-Agent パターン (PR #158) / gbrain (PR #168)

## 9. 反証チェック (Step 1-4 圧縮)

- Step 1: Thariq 発言 INFERENCE / 30-40 万 token 経験則 INFERENCE
- Step 2: tech-lead agent 起動判定済、既存 Hard Rule 4 + Sub-Agent パターン (PR #158) と整合
- Step 3 実用反証: /rewind は ConsultingOS で grep して未使用確認候補 (次セッション課題)
- Step 4 リスク即潰し: /rewind gap は本 references 運用指針 + 関根さん Phase 1 で実機検証
