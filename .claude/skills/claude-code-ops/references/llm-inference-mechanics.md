# LLM 推論メカニクス 4 概念 (Stanford 講義経由、2026-05-14)

`ai-engineer` + `tech-lead` + `infra-devops` + `client-success` 連携の LLM 推論コスト透明性フレーム。「使う側」から「動かす側」視点切替で、関根さん月次顧問の運用コスト説明力を物理層根拠で強化。

出典: Stanford 大学公開講義「AI 推論の仕組み」(無料、INFERENCE: ユーザー提示テキスト経由、本セッション一次出典 URL 未取得)。

## 1. 概念 1: メモリ律速 (Memory-Bound)

AI 生成フェーズ = 計算でなくメモリ律速:
- GPU の計算能力 (TFLOPS) は余っている
- ボトルネック = メモリ帯域 (HBM ↔ GPU の転送速度)
- 1 トークン生成ごとに全 weights を読み込む必要

ConsultingOS 含意: トークン節約 = 「礼儀」でなく「メモリ I/O 削減」= 構造的コスト削減。

## 2. 概念 2: KV キャッシュ

過去トークンの key/value を保存、生成時に再計算不要化:
- メモリ最適化超重要ポイント
- プロンプトキャッシュ = KV キャッシュ再利用 = 90% コスト削減可能 (INFERENCE)
- workflow.json (PR #149) bootstrap data = KV キャッシュ最大活用の物理化

ConsultingOS 含意: workflow.json + skill 体系 = KV キャッシュヒット率最大化設計。

## 3. 概念 3: 投機デコーディング (Speculative Decoding)

小型 AI 下書き + 大型 AI 検証 = 二人三脚高速化:
- 小型 AI (Haiku 等) が候補トークン生成
- 大型 AI (Opus 等) が検証 (並列処理可)
- 採用時は高速、不採用時は大型 AI で再生成

ConsultingOS 含意: /goal command (PR #153) の Haiku 評価者パターンと同型構造、5 Orchestration Patterns Outcomes Loop (PR #158) と整合。

## 4. 概念 4: 連続バッチング + PagedAttention + 量子化

同時大量リクエストさばく 3 技術:
- 連続バッチング: 動的バッチ構築でスループット最大化
- PagedAttention: メモリページング、KV キャッシュ効率化
- 量子化: 重みを INT8/INT4 で圧縮、メモリ削減

ConsultingOS 含意: Claude Code が速い時 / 遅い時の構造的説明 = サーバー側バッチング状態 + 推論コスト分担。

## 5. OpenAI API 処理量 (FACT、ユーザー提示)

- ~1 日 8.6 兆トークン (INFERENCE: 一次出典 URL 未取得)
- 推論コストは学習後も延々積み上がる
- AI ベンチャーの「PoC 地獄構造」(PR #161) と直結 = 推論コスト負担なしには事業継続不可

## 6. 関根さん月次顧問契約への適用

運用コスト透明性レポート構築:

| 項目 | 物理層根拠 | 関根さん向け説明 |
|---|---|---|
| 月次トークン消費 | KV キャッシュヒット率 | workflow.json + skill 体系で 60-90% キャッシュヒット見込み |
| 速度差 | 連続バッチング状態 | 朝 / 夜の API 負荷差で応答速度変動 |
| プロンプトキャッシュ削減 | KV キャッシュ再利用 | 規律体系の物理化 = 構造的コスト削減 |
| 投機デコーディング採用率 | 小型 / 大型 AI 二人三脚 | /goal command (PR #153) で Haiku 評価者活用 |

= 属人説明から構造説明への転換 = 佐藤裕介流「構造で売る」原則と整合。

## 7. ConsultingOS 自己診断

| 軸 | 適用度 |
|---|---|
| メモリ律速認識 | 強 (workflow.json + Karpathy ルール 6) |
| KV キャッシュ最大活用 | 強 (skill 体系 + bootstrap data) |
| 投機デコーディング | 強 (/goal command Haiku 評価者) |
| 連続バッチング認識 | 中 (応答速度変動の構造的理解) |
| 運用コスト透明性 | 弱 (関根さん月次レポートで物理化候補) |

## 8. ICP 提案質問 91-92 件目追加

91. AI 運用コストを「使う側」(プロンプト改善) でなく「動かす側」(メモリ律速 / KV キャッシュ / 投機デコード) の物理層根拠で説明できているか
92. プロンプトキャッシュ + 投機デコーディング + 量子化等の推論最適化技術を運用判断に組み込んでいるか

## 9. 関連参照

- 出典: Stanford 大学公開講義「AI 推論の仕組み」(INFERENCE)
- 関連: workflow.json (PR #149) / Karpathy 12 ルール (PR #138) / /goal command (PR #153) / 5 Orchestration Patterns (PR #158) / PoC 地獄脱出 (PR #161)
- 関連 agent: ai-engineer + tech-lead + infra-devops + client-success

## 10. 反証チェック (Step 1-4 圧縮)

- Step 1: Stanford 講義の URL / 講師名 / 公開日 INFERENCE (ユーザー提示テキスト経由、未確認) / 1 日 8.6 兆トークン INFERENCE / 90% コスト削減 INFERENCE
- Step 2: 既存 ConsultingOS 規律 (workflow.json + Karpathy + /goal + Outcomes Loop) と整合検証、ai-engineer agent 起動済判定で構造的妥当性確認
- Step 3 実用反証: 関根さん月次顧問レポートで実機検証可能、PR 内では未実測 (Phase 2 実装後検証)
- Step 4 リスク即潰し: 「Stanford 講義出典 URL 未確認」リスクは user 提示時に URL 追記推奨、構造的に発生不可能化は次セッション課題
