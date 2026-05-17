> 注記（2026-05-05 PR #53 追加）: 本ファイルは consulting-playbook.md から PR #49 で分離したエピソード記憶（思想統合の経緯記録）です。記載エージェント名には PR #48 で廃止済みのもの（lead-qualifier / global-journalist / business-translator / crm-ma-strategist）を含みますが、過去の意思決定経緯として保持しています。現役エージェントの最新一覧は CLAUDE.md Architecture Map を参照してください。

## 銀行審査部の事業計画書 3 共通点（2026-05-03 中小企業診断士 野村幸司氏記事より取り込み）

`strategy-lead` + `proposal-writer` + `kpi-analytics` + `legal-compliance-checker` 連携で、銀行融資申請・事業計画書作成・投資家ピッチで失敗を構造的に防ぐチェックリスト。

### 共通点 1: 根拠のない楽観的な数字（最大の警戒点）

「来期売上 +30%」等の数値に「なぜそれが実現できるか」の根拠が欠落しているケース。CLAUDE.md ハードルール 2「出典なし具体数値の断言禁止 + FACT/INFERENCE/SPECULATION 3 ラベル」と整合。

対策:
- 売上には必ず「前提条件と根拠」をセット記載
- 「受注済み」「受注確度の高い案件」「新規開拓の見込み」を分けて記載

### 共通点 2: リスクに触れていない（触れたくない気持ちが見え見え）

「良いことしか書いていない」計画書は信頼を一気に下げる。CLAUDE.md ハードルール 1「反証チェック結果 Step 1-3 + 残存リスク必須」と整合。

対策:
- 「想定されるリスクと対応策」を 1 ページ設置
- 「売上が計画の 70% にとどまった場合、固定費をどう削減するか」等の具体記載

### 共通点 3: 返済財源（DSCR）が数字で示されていない

借りたお金を何で返すか = 銀行審査の最大テーマ。P/L 利益と返済可能キャッシュは別物。

DSCR（債務返済カバレッジ比率）= （営業利益 + 減価償却費）÷ 年間返済額

対策:
- 「返済シミュレーション」ページ設置
- 月次の元金返済額 + 利息と営業キャッシュフローの比較を表 / 図で可視化
- DSCR 1.2-1.5 以上を目安

### 既存 ConsultingOS スキルとの位置関係

| 既存 | 銀行審査部 3 共通点との関係 |
|---|---|
| CLAUDE.md ハードルール 1（反証チェック）| 共通点 2（リスク開示）と完全整合 |
| CLAUDE.md ハードルール 2（3 ラベル明示）| 共通点 1（根拠なし数字禁止）と完全整合 |
| `kpi-analytics` | 共通点 3（DSCR 計算・キャッシュフロー）の主担当 |
| `legal-compliance-checker` | 銀行融資契約・補助金申請の規制対応 |

「既存規律で共通点 1, 2 はカバー済、共通点 3（DSCR / キャッシュフロー）は kpi-analytics 主担当として新規補強」（佐藤裕介判断）。スキル新設は不要、kpi-analytics エージェントの参照ルールに追記推奨。

### 出典

- [銀行審査部が嫌う事業計画書の 3 つの共通点 - 野村幸司](https://x.gd/lYeAY)（中小企業診断士・SPECULATION: URL 短縮形のため要再確認）

---

## 新規事業 / 企業 / M&A の責任者 = 佐藤裕介流（2026-05-03 役職整理）

### 役職定義

ConsultingOS の新規事業 / 企業 / M&A 領域の責任者は <span style="color:red">佐藤裕介流</span>（フリークアウト / STORES の創業 / 経営経験を思想的基盤）。新エージェント新設は形骸化リスク回避のため見送り、既存エージェント連携で対応。

### 主担当エージェント連携

| 領域 | 主担当 | 連携 |
|---|---|---|
| 新規事業立ち上げ | `strategy-lead`（佐藤裕介流主軸）| `product-manager` / `competitive-analyst` / `market-researcher` / `kpi-analytics` |
| 既存企業の事業再構築 | `strategy-lead` | `competitive-analyst` / `kpi-analytics` / `legal-compliance-checker` |
| M&A（買収 / 売却 / 統合）| `strategy-lead`（佐藤裕介流の Secret Thesis 適用）| `legal-compliance-checker` / `kpi-analytics`（DSCR・バリュエーション）/ `proposal-writer`（IM 作成）|

### 佐藤裕介流の新規事業判断軸

1. Secret Thesis: 業界コンセンサスと違うが正しい仮説 1 文（[Peter Thiel "Zero to One"](https://www.amazon.com/Zero-One-Notes-Startups-Future/dp/0804139296) 整合）
2. アセット帰属診断: OS 帰属 / 関係資産帰属 / 個人スキル帰属の 3 分割で再現性を検証
3. 3 変数交点: 市場機会 × 自社アセット × タイミング が交差する点
4. PL 思考: 粗利インパクト・ブレイクイーブン・ROI を全提案で明示
5. ruthlessly edit: 追加は削除と 1 セット、形骸化禁止
6. コンセンサス疑念: 業界常識を疑うべき仮定として最低 3 つ言語化

### M&A 特有の判断軸（佐藤裕介流 + 銀行審査部 3 共通点と整合）

- DSCR（債務返済カバレッジ比率）1.2-1.5 以上を融資前提
- リスクシナリオ 3 つ（ベスト / ベース / ワースト）と各対応策
- Day 1 / Day 100 / Year 1 の統合計画（PMI: Post-Merger Integration）
- アーンアウト条件 / 競業避止 / 機密保持 / IP 帰属の契約条件 4 点

### 既存スキル連携

| スキル | 新規事業 / M&A への適用 |
|---|---|
| `consulting-playbook`（本ファイル）| 4 ステップ + 銀行審査部 3 共通点 + 佐藤裕介流の判断軸 |
| `revenue-growth-framework` | 売上成長戦略の上位フレーム |
| `falsification-check` | Secret Thesis の反証 / コンセンサス疑念発動 |
| `marketing-research-playbook` | 市場調査・競合分析 |
| `industry-playbooks/` | 業界別の参入戦略 |

### 部門新設は不要（佐藤裕介判断）

「新規事業 / M&A 部門の独立エージェント新設」は形骸化リスク（CLAUDE.md ハードルール 13）。既存 strategy-lead を「佐藤裕介流の新規事業責任者」として強化、5 ステップ + 4 ステップ + 3 共通点 + 6 判断軸を統合運用するのが外科的最適解。

> 反証モード（トリプルチェック）の共通ルールは CLAUDE.md を参照。

---

## Jack Dorsey 流: 削除設計と体験ファースト（2026-05-03 思想統合）

`strategy-lead` の思想的基盤に佐藤裕介流と兼務で追加。Twitter / Square / Block 三社にわたり「手描きスケッチ / プロトタイプで体験を先行提示してから事業計画を語る」流儀を一貫実践。

### Dorsey 流の 5 判断軸

1. 削除が設計（Subtraction as Design）: 「Make every detail perfect and limit the number of details to perfect」
2. プロトタイプ・ファースト（Show, Don't Tell）: 投資家ピッチ前に「使えるもの」を持参
3. 構造的シンプルさ: 制約をインスピレーション源に転化（140 文字制限の原点）
4. CEO as Editor: 多数決ではなく削除の意思決定者として経営者を位置づけ
5. プロトコル思考（Protocols, Not Platforms）: オープンプロトコルへの賭け

### 削除設計 3 原則（提案品質基準）

- Simplicity: 提案の核心を 1 文で言えるか
- Constraint: 制約を設計原則に転化できるか
- Craftsmanship: 残した要素を完璧に仕上げているか

### プロトタイプ・ファースト チェックリスト

```
□ 提案を「見せる」前に「感じさせる」何かを用意したか（スケッチ・画面・体験）
□ ピッチ前に「動くもの」または「手描きの体験設計」があるか
□ 「削ったリスト」: 提案から外した要素とその理由を明示したか
```

### 出典

- [Creative Bloq Jack Dorsey インタビュー](https://www.creativebloq.com/netmag/jack-dorsey-1097160)
- [Twitter first sketch (Flickr)](https://www.flickr.com/photos/jackdorsey/182613360)
- [Sequoia Capital Square Founding Moments](https://www.sequoiacap.com/article/square-founding-moments/)
- [Fast Company - Block prototypes not slides 2026](https://www.fastcompany.com/91526664/jack-dorsey-wants-to-have-6000-direct-reports)

---

## 孫正義流: 「登りたい山」と「動くための計画」（2026-05-03 思想統合）

`strategy-lead` の思想的基盤に佐藤裕介流 + Dorsey 流と兼務で追加。「人生 50 年計画」(19 歳設定) + 300 年企業ビジョン + 10 秒決断の三軸。

### 孫正義流の 5 判断軸

1. 登山優先: 「登りたい山を先に決める。山が決まらなければ施策は彷徨と同じ」
2. 書き直し前提の計画: 「計画通りになるか」でなく「計画があるから動ける」が目的（[SPECULATION] ユーザー解釈、原著確認推奨）
3. 超長期起点の逆算: AGI/ASI・産業構造変化（10-300 年単位）から逆算
4. 10 秒決断: 経験 × 直感 × ビジョン整合の 3 点揃い前提（感情のみは WeWork 1.7 兆円損失で反証済）
5. 失敗の構造化: 失敗時は「感情判断 / ガバナンス不足 / ビジョン不整合」の 3 軸で原因特定

### Phase 0「山を決める」（全案件必須・新規ゲート）

```
□ 登りたい山（ビジョン / 目的地）: ___（1 文）
□ 10 年後にこの山が存在しているか: はい / 条件付き / いいえ
□ この計画は「満足のため」か「動くための理由」か
□ 書き直し前提のチェックポイント設定: 第 __ 週に再確認
→ Phase 1（BANT/MEDDIC 精査）へ進む
```

### 出典

- [arp-nt.co.jp 「19 歳で作った人生 50 年計画」](https://arp-nt.co.jp/rensai2/sono013/)
- [実業之日本社『志高く 孫正義正伝 決定版』](https://www.j-n.co.jp/books/978-4-408-33972-6/)
- [SoftBank World 2023 基調講演](https://www.softbank.jp/biz/blog/business/articles/202310/sbw2023-softbank-son-main-keynote/)
- [ITmedia NEWS WeWork 赤字「私がばかでした」](https://www.itmedia.co.jp/news/articles/2005/18/news131.html)

---

## Jensen Huang 流: 思考深度の証明と「倒産 30 日前」マインド（2026-05-03 思想統合）

`strategy-lead` の思想的基盤に佐藤裕介 + Dorsey + 孫正義と兼務で追加（4 兼務）。NVIDIA 32 年で 5 兆ドル時価総額到達、CUDA 11 年・120 億ドル先行投資の判断哲学。

### Huang 流の 5 判断軸

1. 事業計画 = 思考深度の証明装置: 財務予測でなく「解くべき問題・未充足ニーズ・防御困難性」の 3 点圧縮
2. 倒産 30 日前マインド: 「You know the phrase '30 days from going out of business,' I've used for 33 years」
3. CUDA 原則: 構造が見えていれば 20 年先行できる（市場不在でも先行投資判断）
4. 低い期待値が高いレジリエンス: 「The superpower of an entrepreneur is their ignorance」
5. 推論プロセスの公開: 60 名直属部下に 1on1 なし、グループ会議で「どう推論するか」を実演

### Huang テスト 3 点（中期計画レビュー必須ゲート）

```
□ 解くべき問題: 一文で書けるか
□ 未充足ニーズのタイミング: なぜ今か（過去でも未来でもなく）
□ 防御困難性: 「みんなが良いと思った時に飽和しない理由」が言えるか
→ 3 点全て書けない計画は財務モデルより先に差し戻す（strategy-lead 権限）
```

### CUDA 原則: 先行投資正当化チェック

```
□ 市場がまだ存在しない段階で「構造認識」は正しいか
□ タイムラインが間違っても、構造が正しければ投資継続できる体力があるか
□ 先行投資が「moat」になるロジックを説明できるか
```

### 出典

- [Acquired Podcast - Jensen Huang Interview](https://www.acquired.fm/episodes/jensen-huang)
- [Fortune - Jensen 30 days from going out of business](https://fortune.com/2025/12/04/nvidia-ceo-admits-he-works-7-days-a-week-including-holidays-in-a-constant-state-of-anxiety-out-of-fear-of-going-bankrupt/)
- [CNBC - Stanford 苦しみ講演](https://www.cnbc.com/2024/03/15/nvidia-ceo-huang-at-stanford-pain-and-suffering-breeds-success.html)
- [Stanford GSB - First-Principles 思考](https://www.gsb.stanford.edu/insights/jensen-huang-how-use-first-principles-thinking-drive-decisions)
- [Tae Kim "The Nvidia Way" (W.W. Norton 2025)](https://wwnorton.com/books/the-nvidia-way)

---

## 4 思想兼務体制の運用順序（2026-05-03 統合ルール）

`strategy-lead` の中期計画レビュー時の 4 思想適用順序:

```
Phase 0（孫正義流）: 「登りたい山」を 1 文で言語化
   ↓
Phase 1（Huang 流 Huang テスト）: 解くべき問題 / 未充足ニーズ / 防御困難性 の 3 点圧縮
   ↓
Phase 2（佐藤裕介流）: PL・3 変数交点・アセット帰属診断で構造検証
   ↓
Phase 3（Dorsey 流）: 提案物・施策を削ぎ落とし、最小構造化（プロトタイプ提示準備）
```

「順序を逆にしてはいけない。先に PL を出すと山が見えなくなる、先に削ぎ落とすと大きな賭けを見落とす、先に Huang テストを飛ばすと考え抜きの深さが出ない」（佐藤裕介 ruthlessly edit 統合判断）。

### 4 兼務の禁止事項

- 山を決める前に Phase 1 BANT を走らせること（孫正義流違反）
- Huang テスト 3 点未充足のまま財務モデルへ進むこと（Huang 流違反）
- PL 規律を飛ばして大型投資判断（佐藤裕介流違反 + WeWork 反例）
- 削ぎ落としなき重装備提案（Dorsey 流違反）

---

## バージョン履歴

| Ver | 日付 | 変更内容 | 根拠 | 効果 |
|---|---|---|---|---|
| 1.0.0 | 2026-03-25 | 初版 |: | ベースライン |
| 1.1.0 | 2026-05-03 | スモールビジネス 4 ステップ + 銀行審査部 3 共通点 追記 | みるぼん流 + 野村幸司 + 佐藤裕介判断 | 中堅中小・銀行融資・投資家ピッチでの実践テンプレ |
| 1.2.0 | 2026-05-03 | Dorsey + 孫正義 + Jensen Huang 思想統合（4 兼務体制）+ Phase 0「山を決める」+ Huang テスト 3 点 + 4 思想運用順序 | 4 並列 global-journalist 調査統合 + 佐藤裕介 ruthlessly edit 判断 | strategy-lead 思想的基盤強化、中期計画レビューゲート明確化 |


## 出典・依拠先

- FACT: 本ファイルは @nbyk115/consulting-os の ConsultingOS 規律ファイルとして 2026-05-05 PR #65 で体系的明示物理化により定義された（ファイルパス: .claude/skills/references/consulting-playbook-thoughts.md）
- INFERENCE: 業界標準ベストプラクティス（佐藤裕介流の構造で売る原則、Boris Cherny 流の 9 規律 ruthlessly edit、該当部門の業界フレームワーク）から派生し実装
- SPECULATION: 4 週間ごとの再評価カレンダー（evolution-log.md 再評価カレンダーセクション）で形骸化検出、Boris #3 削除セット対象、規律違反発生時は統合 / 分離 / 削除で整理予定
