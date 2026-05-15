# Anthropic Managed Agents - 長時間稼働エージェント公式ホストサービス (2026-05-15)

`tech-lead` + `infra-devops` + `ai-engineer` + `strategy-lead` 連携の 24/7 ホスト判断 anchor フレーム。Anthropic 公式 Managed Agents = PR #155 10-Agent パターン 24/7 ホスト Gap + PR #175 Dreaming 公式版の構造的解決候補。

出典: Anthropic Engineering Blog (anthropic.com/engineering/ma...、INFERENCE: ユーザー提示テキスト経由、本セッション一次出典 fetch 未実施)。

## 1. 核心: 「まだ考えられていないプログラム」設計哲学

Anthropic 設計哲学 (FACT、エンジニアリングブログより): 「まだ考えられていない『プログラム』向けのシステムをどのように設計するか」が Managed Agents の出発点。

= 既存「特定タスク向け固定システム」から「未定義タスク向け汎用 host」への構造転換。

ConsultingOS 整合: OEM 展開 (関根さん N&Y Craft + 将来 vertical 拡張) は「まだ存在しない案件」向け設計と同型構造、Anthropic Managed Agents 設計哲学と整合。

## 2. PR #155 10-Agent パターン 24/7 ホスト Gap 解決候補

PR #155 で Teamly $29-179/月 を 24/7 ホスト候補としていたが、Anthropic 公式 Managed Agents = 構造的代替:

| 軸 | Teamly | Anthropic Managed Agents |
|---|---|---|
| 価格 | $29-179/月 | enterprise 価格 (INFERENCE、要確認) |
| 公式性 | サードパーティ | Anthropic 公式 |
| Beta header | 不要 | 必要 (Mnimiy 記事 PR #175 言及) |
| 個人向け | YES | NO (enterprise pricing) |
| 中小 / 個人 ConsultingOS 適用 | 中 (関根さん Phase 3 で再評価) | 弱 (現状非対象) |

= ConsultingOS は中小 / 個人特化のため、現状 Managed Agents 非採用、Teamly が現実的候補維持。

## 3. PR #175 Dreaming 公式版

Mnimiy 記事 (PR #175) で言及済: 「The official feature [Dreaming] requires Managed Agents access with a beta header」。

= Anthropic 公式 Dreaming = Managed Agents 経由のみ。ConsultingOS は PR #175 Phase 1 雛形 + ローカル実装 (Mnimiy 流) で代替済、Managed Agents 採用は将来候補。

## 4. ConsultingOS 採用判定 (Boris #3 段階導入)

| Phase | 判定 |
|---|---|
| 現状 | 非採用 (中小 / 個人特化、enterprise pricing 非対象) |
| 関根さん Phase 3 | 再評価 (OEM 案件 3 件以上獲得後、組織展開時) |
| 水野さん v4 投資先候補 | 投資先企業評価軸として「Managed Agents 採用検討度」追加 |
| 将来 (5-10 年) | Karpathy ニューラルネット主役化 (PR #174) 連動、ニューラルネット = ホスト時代の必須インフラ候補 |

## 5. ConsultingOS の代替インフラ (現状)

Managed Agents 非採用でも 24/7 ホスト Gap を補完する既存仕組み:

| 機能 | ConsultingOS 代替 |
|---|---|
| 24/7 稼働 | Claude Code Agent View (PR #DK) + /goal command (PR #153) |
| 長時間タスク | Phased Preamble 二層化 (PR #160) + /goal 受け入れ基準 (PR #176) |
| Memory + Dreaming | PR #175 Phase 1 雛形 (ローカル実装、Mnimiy 流) + gbrain (PR #168) |
| 規律体系 | 21 hook + Hard Rule 17 + 反証チェック |

= ConsultingOS 個人 / 中小 vertical では Managed Agents 不要、既存仕組みで 7-8 割効果カバー。

## 6. ICP 提案質問 117-118 件目追加

117. AI 駆動サービスで「まだ考えられていないプログラム」設計哲学を採用しているか、それとも特定タスク向け固定システムに閉じていないか (Anthropic Managed Agents 設計哲学)
118. 24/7 稼働 agent のホスト戦略を「Managed Agents (enterprise) / Teamly (中小 / 個人) / ローカル (Agent View + /goal)」3 層で選択しているか

## 7. アンチパターン 3 件

YOU MUST: 以下を検知したら戦略再考:

1. 「Managed Agents = 必須」誤認 (中小 / 個人特化 ConsultingOS では非採用が正解)
2. 「ローカル実装で十分」固執 (関根さん Phase 3 OEM 拡張時の Managed Agents 再評価未実施)
3. 「まだ考えられていないプログラム」設計哲学を「特定タスク向け固定」に矮小化

## 8. 関連参照

- 出典: Anthropic Engineering Blog (anthropic.com/engineering/ma..., INFERENCE)
- 関連 skill: 10-Agent パターン (PR #155) / Dreaming Phase 1 (PR #175) / gbrain (PR #168) / Agent View (PR #DK) / /goal command (PR #153) + 受け入れ基準 (PR #176) / Phased Preamble (PR #160) / Karpathy ニューラルネット (PR #174) / TAI 研究アジェンダ (PR #186)
- 関連 agent: tech-lead + infra-devops + ai-engineer + strategy-lead
- 関連 hard rules: 17 主語詐称禁止 + Boris #3 先回り禁止 + Hard Rule 13 形骸化防止

## 9. 反証チェック (Step 1-4 圧縮)

- Step 1: Anthropic Managed Agents Engineering Blog INFERENCE (一次出典 fetch 未実施) / 設計哲学「まだ考えられていないプログラム」FACT (ユーザー提示) / enterprise pricing は Mnimiy 記事 PR #175 経由 INFERENCE
- Step 2: PR #155 + PR #175 + 既存 ConsultingOS 24/7 代替インフラと整合検証、ConsultingOS 中小 / 個人特化と Anthropic enterprise 対象の non-overlap 確認
- Step 3 実用反証: 採用判定 Phase 別明示、関根さん Phase 3 再評価条件物理化、24/7 代替インフラ 4 軸明示
- Step 4 リスク即潰し: アンチパターン 3 件 (必須誤認 / ローカル固執 / 設計哲学矮小化) + Boris #3 段階導入で構造的回避
