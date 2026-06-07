---
name: agent-lifecycle
description: AI エージェントを「デジタル従業員」と捉え、業務定義 / 採用 / 導入準備 / 配置・管理 / 運用改善 / 退職の 6 段階ライフサイクルで運用する skill。PwC コンサルティング 2026 論考整合。orchestrator + product-manager + claude-lawyer 起動時に auto-trigger、agent 設計 / 改廃時に必須参照。
---

# Agent Lifecycle: デジタル従業員 HR モデル

## 概要

ConsultingOS の 27 エージェントを「デジタル従業員」と捉え、外部公開情報 (PwC 論考 2026、claude-info 規律準拠で一般化) の 6 段階ライフサイクルで運用する。agent-evaluation (週次セルフレビュー) と並列、agent 設計 / 改廃の構造化フレーム。

## 1. 6 段階ライフサイクル

### Stage 1: 業務定義

- 利活用予定の業務内容を 1-3 文で明文化
- 期待効果 (定量 + 定性): 工数削減 X h / 売上 +Y 円 / NPS +Z 等
- 反指標 (副作用 / 過剰権限リスク) を 1 件以上特定
- 整合 skill: consulting-playbook §1 指標変革 + ai-readiness-assessment 5 軸診断

### Stage 2: 採用

- 性能評価: agent の能力 vs 業務要件 fit (Tom Griffiths Jagged Intelligence で再現可能演繹型か文脈依存判断型かを分類)
- 既存業務システムとの連携: tool use / MCP / API 設計
- ベンダー / モデル選定: Opus / Sonnet / Haiku の使い分け (cybersecurity-playbook ASL 整合)
- 整合 skill: ai-engineer + tech-lead

### Stage 3: 導入準備

- プロンプト設計: 役割 / 制約 / 完了条件 / 出力形式
- スキル付与: 参照 skill リスト + auto-trigger 条件
- ツール権限: 最小権限 (frontmatter `tools:` 明示、deny-list で物理ブロック)
- パフォーマンス最適化: token 予算 + Step 3 実用反証必須
- 整合 skill: claude-code-ops §13 agentic engineering + prompt-engineering

### Stage 4: 配置・管理

- 台帳登録: active-engagements.md に案件 / 担当 agent / 状態を登録
- 接続方法明確化: orchestration-protocol §3 起動前 4 点ゲート + §2.9 委譲比率
- アクセス制御: Hard Rule 3-4 + ~/.claude/settings.json permissions
- エスカレーション方法: agent 単独判断不可時の orchestrator 委譲ルート (副次 element 独断禁止、視覚物 4 点 gate §17)
- 整合 skill: claude-code-ops + orchestration-protocol

### Stage 5: 運用改善

- パフォーマンス継続モニタリング: agent-evaluation 週次セルフレビュー + score-os-health.sh 5 軸採点
- コンプライアンス継続: claude-lawyer 法規制チェック + falsification-check 反証チェック
- 学習サイクル: evolution-log + 完了/失注 学習台帳 (active-engagements.md) で OS 反映 loop
- 形骸化検知: 4 週間更新ゼロで再評価カレンダー alert、Boris #3 ruthlessly edit
- 整合 skill: agent-evaluation + audit + level-up + dreaming

### Stage 6: 退職

- 役割完了 / 価値喪失 / 統合候補の判定
- データ削除: agent の出力履歴 / 学習データの安全な archive
- 安全な退役: orchestration-protocol §2.12「Stay on the Exponential」原則 (現モデル限界補完は次モデルで削除前提)
- 統合判断: 重複 / 価値低下 agent は他 agent に統合 or 削除
- 整合 skill: Hard Rule 13 (追加は削除と 1 セット) + claude-code-ops §13.2 Boris 4 規律

## 2. PwC 5 軸ガバナンス統合

| 軸 | ConsultingOS 整合先 |
|---|---|
| ① 経営戦略 (AIガバナンス委員会・CxO) | Hard Rule 17 orchestrator 検証ゲート + strategy-lead Phase 0 Drucker 5 質問 |
| ② 部門横断的統制 (セキュリティ・法務・プライバシー・人事) | claude-lawyer + cybersecurity-playbook + Hard Rule 3-4 |
| ③ 技術的統制 (IT/MLOps) | ai-engineer Pre-deployment Safety Checklist + lethal trifecta + 25 hook 機械検証 |
| ④ 業務現場統制 (業務部門責任者) | orchestration-protocol §4.5 trust-but-verify + 視覚物 4 点 gate + 副次 element 独断禁止 |
| ⑤ 監査 (内部監査) | evolution-log + audit skill + score-os-health.sh + 4 週間再評価カレンダー |

5 軸全て既存 ConsultingOS で物理化済 (FACT、本 skill で対応表明示)。新規追加なし、参照軸の体系化のみ (Boris #3「追加は削除と 1 セット」準拠)。

## 3. 適用 agent

- orchestrator: 案件着手時に 6 段階のうち該当 stage を判定、stage 別チェックリスト適用
- product-manager: 新規 agent 設計時に Stage 1-3 (業務定義 / 採用 / 導入準備) 必須実施
- claude-lawyer: Stage 2 ベンダー選定 + Stage 4 アクセス制御で法規制チェック
- audit skill: Stage 5 運用改善 + Stage 6 退職判断の定期実施

## 4. 出典・依拠先

- FACT: PwC コンサルティング「AIエージェントを『デジタル従業員』と捉えた論考」(2026、図表 1-3 経由)。外部公開情報、claude-info 規律準拠で外部発信者個人帰属表記なし、「業界標準デジタル従業員 HR モデル」として一般化。出典 URL: pwc.com/jp/ja/knowledge (ユーザー提示、一次 URL fetch 未実施 INFERENCE)
- INFERENCE: ConsultingOS 既存 5 軸整合は本 skill の対応表で明示、新規追加なし。Boris #3 整合
- SPECULATION: 4 週間後 (2026-06-26) 再評価カレンダーで「6 段階のうち実需で運用された stage」検証、形骸化検知時は Boris #3 ruthlessly edit

---

## 5. 記憶 / スキーマ 2 層分離 + 4 点セット書式 (2026-05-30 統合)

外部公開情報 (claude-info 規律準拠で「業界標準スキーマ設計論」一般化、参考文献は学術 FACT として保持): 認知科学スキーマ理論 (Piaget 1952 / Bartlett 1932 / Rumelhart 1980) + 神経科学 予測符号化理論 (Friston 2010) ベース。

### 5.1 ConsultingOS の「記憶 / スキーマ」分散統合

- 記憶 (What happened) = 時間軸で増える: evolution-log + active-engagements 学習台帳 + audit 記録
- スキーマ (How things work) = 構造で深まる: CLAUDE.md (Hard Rule + 部門構造) + consulting-playbook + ICP.md + DESIGN.md + brand-guidelines + orchestration-protocol + falsification-check 等の主要 skill 群

【判定】ConsultingOS は既に分散統合済、グローバル ~/.claude/schemas/ 新規ディレクトリは Boris #3 「追加は削除と 1 セット」違反候補のため不採用。既存「スキーマ束」を本節で位置付け明示。

### 5.2 「定義・適用・例・誤解」4 点セット書式 (採用、skill 改善基準として)

スキーマ層 skill (consulting-playbook / brand-guidelines / orchestration-protocol 等) の各原則 / 規律記述は以下 4 点セットで書く (新規追加 + 既存 skill 改善時の基準):

1. 定義: 原則 / 規律の公式定義 (1-3 文)
2. 適用: どういう状況で適用するか + どういう判断 / 提案に変換するか
3. 例: 過去の判断例 1-3 件 (具体的場面 + 採用 / 却下の判断)
4. 誤解: 「表層的にこう受け取られがちだが本来の意図はこう」+ 誤解のメカニズム

【効果】単に「これはダメ」で終わらせず、誤解パターンごと書き残すことで解釈ブレを減らす。do / don't 両面提示と同型。

### 5.3 context → schemas 昇格条件 4 件 (採用、Stage 5 運用改善に統合)

skill / 規律の「プロジェクト固有 context」を「スキーマ層 (世界の構造)」に昇格させる条件:

1. 検証済: 複数案件 (2 件以上) で検証し、判断の質向上を確認
2. 組織的合意: 個別 agent / 案件だけでなく、orchestrator + 関連 agent 横断で合意
3. 他のスキーマと整合: 既存 Hard Rule / consulting-playbook / 主要 skill と矛盾せず、補強関係
4. 反証可能: 「こういう場面では適用しない」境界条件が明確

【物理化】Stage 5 運用改善で active-engagements 学習台帳の「OS 反映 (更新ファイル + commit / 反映不要の理由)」欄を本 4 条件で評価、4 件全て満たす学び → スキーマ層 skill 追記、満たさない学び → 案件 context にのみ保持。

### 5.4 同化 (assimilation) / 調節 (accommodation) サイクル (採用、dreaming + audit に明文化)

- 同化: 新案件 / 新知見が既存スキーマで説明可能な場合、既存スキーマに当てはめて理解 (skill 参照 + 適用)
- 調節: 既存スキーマで説明不可能な出来事が起きたら、スキーマそのものを更新 (skill 書き換え + Boris #3 整合)

調節タイミング検知: agent / orchestrator が「skill 既存記述と矛盾する判断」「skill 適用できない案件」に遭遇したら即 evolution-log 記録 + 4 週間後再評価カレンダーで dreaming + audit によりスキーマ更新判断。

【物理化】既存 dreaming + audit + level-up skill に「同化 / 調節判定 step」を明示、4 週間後再評価で「同化 (skill 維持) / 調節 (skill 書き換え) / 廃止 (Boris #3 削除)」3 分岐。

### 5.5 「自社だったらどうする?」問いの構造化

スキーマ束 (事業 + 組織 + 関係者 + 自分自身) の総合的判断軸として「(案件先) だったらどうする?」を orchestrator 起動前 4 点ゲート (§3) と並行で問う。

ConsultingOS 適用: 案件着手前に ICP.md (案件別) + consulting-playbook §市場構造分解 + active-engagements (関係者) + Hard Rule 18 (規律最新化) を全件参照、「(案件先) スキーマ」が立ち上がってから提案開始。

参考文献 (学術 FACT 一次出典):
- Piaget, J. (1952). The Origins of Intelligence in Children.
- Bartlett, F. C. (1932). Remembering: A Study in Experimental and Social Psychology.
- Rumelhart, D. E. (1980). Schemata: The building blocks of cognition.
- Friston, K. (2010). The free-energy principle: a unified brain theory? Nature Reviews Neuroscience, 11(2), 127-138.

外部公開情報 (claude-info 規律準拠、業界標準スキーマ設計論として一般化): 2026-04 note 記事 (ユーザー提示)

## 6. mechanism 追加の前提判定 (不在 vs 未適用、2026-06-07 物理化・全 OS / 全ブランチ / claude.ai 共通)

新規 hook / skill / agent を「採用 (Stage 2)」する前の必須ゲート。他ブランチ / claude.ai / 新規プロジェクトで作業中に「足りないから足そう」と反射的に mechanism を増やすのを構造的に却下する。

判定手順:
1. この失敗は「規律の不在」か「既存規律の未適用」か。
2. 未適用 (ルールはあるが守らなかった) → mechanism を足さない。echo / warn / reminder hook は無視されて形骸化する (関根OS 13 回連続品質未達 + yorunokotoba 監査の self-audit hook 提案で実証済み)。直すのは「適用」: 既存ルールを読む + §4.7 佐藤裕介フル思考の厳格な最終ジャッジで ship 前に捕まえる。
3. 不在 かつ 決定論的 (語彙 grep / 構造 / 型のように機械が確実に判定できる) → そこだけ機械化する。
4. judgment / taste / application /「ちゃんとやる」系 → 機械化不能。人間 + 佐藤裕介厳格ゲート (§4.7) が層。

却下する典型: application 失敗を見て self-audit hook / reminder hook を足す = 関根OS 16 ループの轍。100% の機械ブロックは原理的に不可能 (judgment を強制する hook 自体がこのアンチパターン)。enforcement は doctrine (本判定を mechanism 追加前に読む) + §4.7 佐藤裕介フル思考の厳格ゲート (review で却下) + CLAUDE.md HR13 の 2 段。Boris #3 ruthlessly edit と整合。
