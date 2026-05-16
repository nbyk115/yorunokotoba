# ConsultingOS 案件機能化ハンドオフ テンプレート (2026-05-15)

> 全案件ブランチ共通の「ConsultingOS を実地で機能させる」申し送り。各案件セッション (関根さん nycraftOS / 水野さん v4 / GTM / よるのことば 等) は session 開始時に本テンプレート + 案件固有ハンドオフ + active-engagements.md を参照する。consulting-os の規律拡充が実案件で機能していない問題 (skill / ツール / デザイン参照 / 競合比較がプロダクト未反映) への構造対策。

## 0. session 開始時チェックリスト (全案件共通)

1. `cd consulting-os && git pull origin main` で ConsultingOS 規律を最新化 (Hard Rule 18)
2. `active-engagements.md` で担当案件のブランチ / ステータスを確認
3. 案件固有ハンドオフ (下表) を Read
4. 本テンプレート §2-5 のワークフローを厳守

## 1. 案件とハンドオフの対応

| 案件 | ブランチ | 案件固有ハンドオフ |
|---|---|---|
| 関根さん nycraftOS | `claude/session-status-check-pmiIG` | docs/handoff-n-y-craft-meeting-2026-05-09.md + handoff-n-y-craft-os-beta-setup.md |
| 水野さん v4 投資テーゼ | `claude/mizuno-funding-v4` | docs/handoff-mizuno-funding-v4.md |
| GTM 案件 | `claude/gtm-consulting-os-launch-Q1yOm` | (未作成、当該セッションで作成推奨) |
| よるのことば | 別リポ `nbyk115/yorunokotoba` / `claude/design-tokens-canon` | docs/handoff-yorunokotoba-os-activation.md |
| 個人コンサル案件 | `main` | (main 作業ログ) |

## 2. ConsultingOS skill の物理配布 (2026-05-15 PR #234 訂正)

重要: `~/.claude/skills/` symlink は consulting-os 環境内でのみ有効。別リポ案件 (yorunokotoba / nycraftOS 等) は別環境のため consulting-os の skill が物理的に存在しない。

案件セッションは session 開始時に必ず以下を実行し、ConsultingOS の skill / agent を案件環境に物理配布する:

```
bash <(curl -s https://raw.githubusercontent.com/nbyk115/consulting-os/main/scripts/distribute-os-skills.sh)
```

これで案件リポの `.claude/skills/` `.claude/agents/` に最新 skill が配布される。定期再実行で Hard Rule 18 (規律最新化) を満たす。hook と settings.json は案件固有設定があるため配布対象外。

## 3. 案件タイプ別の必須 skill

| 案件タイプ | 必須 skill |
|---|---|
| 戦略 / 提案 (関根さん OEM / GTM) | consulting-playbook / document-creation-6-steps / revenue-growth-framework / falsification-check / industry-playbooks |
| 投資テーゼ (水野さん v4) | consulting-playbook §13-16 / references/consulting-playbook-dario-3-stage / personal-cfo-system / monopoly-positioning-framework / handoff-mizuno-funding-v4 §11.7 (YC 8 セクター) |
| GTM / 市場投入 | global-expansion-playbook / consulting-playbook / marketing-research-playbook / aeo-playbook |
| creative / デザイン (よるのことば) | creative-playbook / references/creative-playbook-distinctiveness / brand-guidelines / document-creation-6-steps |
| 全案件共通 | falsification-check (反証チェック) / brand-guidelines (出力規律) |

## 4. agent 委任プロンプトテンプレート (PR #219/#230 準拠、必須)

agent 起動時、委任プロンプトに必ず skill を明示。skill 明示なしは `skill-reference-check.sh` hook が warn:

```
[agent 名] として [タスク] を実施。
着手前に必ず ~/.claude/skills/<該当skill>.md を Read。
[案件固有の参照ファイル / 競合 / データ] も Read。
作業は本テンプレート §5 のフロー厳守。結論 + 反証チェック Step 1-4。
```

## 5. 共通作業フロー (skill 参照 → 競合比較 → 反映 → 検証)

成果物クオリティが低い根本原因は、このフローの省略。各ステップを飛ばさない:

1. skill 参照: §3 の案件タイプ別 skill を Read。知見を作業に使う
2. 競合 / 参照取得: competitive-analyst で競合分析、creative 案件はデザイン参照 3-5 件 (Lazyweb / Mobbin / creative-playbook §2.6)
3. プロダクト反映: skill + 競合比較の結論を成果物に落とす。「読んだ」で終わらせず、どの知見をどこに反映したか 1 行記録
4. 識別性ゲート (PR #226、creative 案件): 「合理的推奨をどこで断ったか」1 行明示。平均値への収束回避
5. 2 段階検証ゲート (PR #213): 成果物 → 部門リード agent チェック → orchestrator チェック

## 6. 品質ゲート

- 床ゲート (スロップ回避): outcomes-judge-minimal.sh + template-injection-check.sh + creative はビジュアル品質ルーブリック 12 点未満 REJECT
- 天井ゲート (識別性、creative 案件): 識別性ゲート (合理的推奨をどこで断ったか明示)
- 反証チェック Step 1-4 (全案件、全成果物)

## 7. 「OS が機能する」判定基準 (全案件共通)

成果物が以下を満たせば ConsultingOS が機能している:
- §3 の skill を Read し知見が成果物に反映 (§5-3 の 1 行記録で確認)
- 競合比較 / 参照がプロダクトに落ちている
- 品質ゲート (床 + 天井) 通過
- 2 段階検証ゲート通過

満たさなければ、委任プロンプトが雑 (skill 未明示) か §5 フローが省略されている。そこを実地で修正。

## 8. 反証チェック (Step 1-4 圧縮)

- Step 1: 案件・ブランチ対応は active-engagements.md FACT / 既存ハンドオフ 6 件 FACT (ls 実測) / ワークフローは consulting-os 既存 skill 統合 INFERENCE
- Step 2: 本テンプレートは規律追加でなく全案件共通の申し送り (docs/handoff-* 既存パターン)、Hard Rule 13 非該当。よるのことば PR #232 は creative 案件の具体例、本テンプレートは全案件タイプの汎用版
- Step 3 実用反証: consulting-os 40 PR 規律が実案件で機能していない実データを受け、規律でなく実作業フロー (§5) の全案件申し送りに変換
- Step 4 リスク即潰し: 案件で skill 未活用 → §4 委任テンプレート + skill-reference-check.sh / フロー省略 → §5 5 ステップ厳守 + §7 判定基準 / 案件横断把握漏れ → §0 チェックリストで active-engagements.md 参照必須化 / 形骸化 → 各案件完了で当該行 archive
