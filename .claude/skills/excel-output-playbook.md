# Excel Output Playbook: Claude Code による高精度 Excel 生成規律

## 概要

Claude Code で Excel を生成する際に発生しやすい問題（数値型不整合・構造崩れ・数式参照エラー・中国字形フォールバック）を体系的に防ぐための専門規律ファイル。事業計画書・投資家向け資料・セールスデック・中期戦略数値など ICP 対象（中堅企業・エンジェル投資家・代理店・D2C）が多用する納品物の品質を担保する。

なぜ Claude Code で Excel が難しいか:
- LLM はセル番地（A1・B3 等）を文字列として扱い、数値型との不整合が発生しやすい
- openpyxl が書き込む数式は Excel 起動時に再計算されるため、実行時エラーが見えない
- フォント指定を省略すると OS フォールバックで中国字形（SimSun 等）が混入する
- ハードコード値が散在すると元データ変更時にスクリプト全体の修正が必要になる

このプレイブックが解決すること: セル番地・列マップ・カラーの CLAUDE.md への事前定義 / 生成と検証のスクリプトセット化 / source/ 分離によるデータドリブン原則 / 色分け規約の統一。

---

## 1. プロジェクト初期化: CLAUDE.md へのセル番地・列マップ・カラー定義

Excel プロジェクト開始時に CLAUDE.md（またはプロジェクトローカルの `.claude/excel-config.md`）へ以下を必ず記述する。これにより Claude Code が「A3 は売上合計」「D 列はコスト」と理解した状態でスクリプトを生成できる。

```markdown
## Excel Config: 事業計画書 FY2026

### シート構成
| シート名 | 用途 | 行方向 | 列方向 |
|---|---|---|---|
| PL_Summary | 損益サマリー | 月次（4月-3月） | 科目別 |
| Unit_Economics | ユニットエコノミクス | 指標行 | 月次列 |
| Assumptions | 入力仮定値（黄セル） | 変数名 | 値・備考 |

### 列マップ（PL_Summary シート）
| 列 | 内容 | 型 |
|---|---|---|
| A | 科目名（ラベル） | str |
| B | FY2026 Q1 実績 | int |
| C | FY2026 Q2 実績 | int |
| D | FY2026 Q3 予測 | int |
| E | FY2026 Q4 予測 | int |
| F | FY2026 通期合計 | formula |

### セル番地（キー指標）
| セル | 内容 |
|---|---|
| B5 | 売上合計 Q1 |
| B12 | 粗利 Q1 |
| B18 | 営業利益 Q1 |
| F5 | 売上合計 通期（=SUM(B5:E5)） |

### カラー規約
| 色 | HEX | 用途 |
|---|---|---|
| 黄 | #FFF2CC | 入力セル（Assumptions シート） |
| 緑 | #E2EFDA | 自動計算セル（formula） |
| 青 | #DDEEFF | 他シート参照セル |
| 赤 | #FFE0E0 | 警告・要確認セル |
| 白 | #FFFFFF | 通常表示セル |
```

IMPORTANT: CLAUDE.md の Excel Config セクションは Excel スクリプト生成の前提条件。未記載で生成を開始してはならない。

---

## 2. ディレクトリ構造

```
project/
  source/           # 元データ（JSON / CSV）。Excel ハードコード禁止
    pl_data.json    # PL 数値・科目マスタ
    assumptions.json # 仮定値（成長率・単価・人件費等）
    kpi_targets.json # KPI 目標値
  scripts/
    generate_excel.py  # 生成スクリプト
    validate_excel.py  # 検証スクリプト
  output/            # 生成済み Excel（gitignore 推奨）
    pl_fy2026.xlsx
  _archive/          # 旧バージョン（削除しない）
    pl_fy2026_v22.xlsx
    pl_fy2026_v24.xlsx
    pl_fy2026_v25.xlsx
  CLAUDE.md          # Excel Config セクション含む（上記参照）
```

source/ フォルダの原則:
- Excel スクリプト内で数値をハードコードしない。すべて `source/*.json` を `json.load()` で読み込む
- source/ ファイルは人間が直接編集する唯一の場所。スクリプトは source/ を読み、output/ に書く
- source/ は Git 管理対象。output/ は `.gitignore` に入れるか、生成物として明示的にコミット

_archive/ 命名規約:
- バージョン番号は `v{2桁連番}` 形式（v22 / v24 / v25 等）
- 命名: `{ファイル名}_v{番号}.xlsx`（例: `pl_fy2026_v25.xlsx`）
- アーカイブは削除禁止。差分追跡・クライアントへの差し戻し対応に使用

---

## 3. 生成スクリプト設計

openpyxl を使用したデータドリブン生成の標準テンプレート:

```python
# scripts/generate_excel.py
import json
import openpyxl
from openpyxl.styles import PatternFill, Alignment, Font
from openpyxl.utils import get_column_letter
from pathlib import Path

# --- 定数（CLAUDE.md の Excel Config と対応）---
COLORS = {
    "input":     "FFF2CC",  # 黄: 入力セル
    "formula":   "E2EFDA",  # 緑: 自動計算
    "reference": "DDEEFF",  # 青: 他シート参照
    "warning":   "FFE0E0",  # 赤: 警告
}

FONT_JA = "Meiryo UI"  # 日本語フォント固定（SimSun 等の混入防止）

def load_source(filename: str) -> dict:
    """source/ からデータを読み込む（ハードコード禁止）"""
    path = Path(__file__).parent.parent / "source" / filename
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def apply_cell_style(cell, color_key: str, font_name: str = FONT_JA):
    """セルにカラー規約を適用"""
    cell.fill = PatternFill(
        start_color=COLORS[color_key],
        end_color=COLORS[color_key],
        fill_type="solid"
    )
    cell.font = Font(name=font_name)

def build_pl_sheet(wb: openpyxl.Workbook, pl_data: dict):
    ws = wb.active
    ws.title = "PL_Summary"

    # ヘッダー行（列マップに従う）
    headers = ["科目", "Q1 実績", "Q2 実績", "Q3 予測", "Q4 予測", "通期合計"]
    for col, header in enumerate(headers, start=1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.font = Font(name=FONT_JA, bold=False)  # bold は視認性のみ、出力に影響しない

    # データ行（source/pl_data.json から）
    for row_idx, item in enumerate(pl_data["items"], start=2):
        ws.cell(row=row_idx, column=1, value=item["label"]).font = Font(name=FONT_JA)
        for col_offset, val in enumerate(item["quarterly_values"], start=2):
            cell = ws.cell(row=row_idx, column=col_offset, value=val)
            apply_cell_style(cell, "formula" if item["is_calculated"] else "input")

        # 通期合計は数式（ハードコードしない）
        sum_col = len(item["quarterly_values"]) + 2
        first_col = get_column_letter(2)
        last_col  = get_column_letter(sum_col - 1)
        formula_cell = ws.cell(
            row=row_idx, column=sum_col,
            value=f"=SUM({first_col}{row_idx}:{last_col}{row_idx})"
        )
        apply_cell_style(formula_cell, "formula")

def main():
    pl_data = load_source("pl_data.json")
    wb = openpyxl.Workbook()
    build_pl_sheet(wb, pl_data)
    output_path = Path(__file__).parent.parent / "output" / "pl_fy2026.xlsx"
    output_path.parent.mkdir(exist_ok=True)
    wb.save(output_path)
    print(f"Generated: {output_path}")

if __name__ == "__main__":
    main()
```

IMPORTANT: `Font(name=FONT_JA)` の明示は全セルに必須。1 セルでも省略すると OS フォールバックで中国字形が混入する（brand-guidelines.md ハードルール 10 参照）。

---

## 4. 検証スクリプトセット

生成スクリプトと必ずセットで用意する。CI または生成直後に自動実行する。

```python
# scripts/validate_excel.py
import openpyxl
import json
from pathlib import Path

TOLERANCE = 1  # 整数丸め誤差の許容値（円単位）

def load_source(filename: str) -> dict:
    path = Path(__file__).parent.parent / "source" / filename
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def validate_structure(ws, expected_headers: list[str]):
    """構造崩れ検知: ヘッダー行の一致確認"""
    actual = [ws.cell(row=1, column=i+1).value for i in range(len(expected_headers))]
    assert actual == expected_headers, (
        f"構造崩れ検知: ヘッダーが一致しません\n期待: {expected_headers}\n実際: {actual}"
    )

def validate_pl_totals(ws, pl_data: dict):
    """売上合計 / 粗利 / 営業利益の 3 点 assert"""
    # source/ の期待値と Excel セルの実測値を突き合わせ
    checks = [
        ("売上合計", pl_data["expected_totals"]["revenue"],     "B5"),
        ("粗利",     pl_data["expected_totals"]["gross_profit"], "B12"),
        ("営業利益", pl_data["expected_totals"]["op_profit"],   "B18"),
    ]
    for label, expected, cell_addr in checks:
        actual = ws[cell_addr].value
        assert actual is not None, f"{label}({cell_addr}): 値が None（数式未解決の可能性）"
        assert isinstance(actual, (int, float)), f"{label}({cell_addr}): 数値型でない（actual={actual!r}）"
        assert abs(actual - expected) <= TOLERANCE, (
            f"{label}({cell_addr}): 数値ズレ検知 期待={expected} 実際={actual}"
        )

def validate_font(ws):
    """全セルのフォント確認（中国字形混入チェック）"""
    forbidden_fonts = {"SimSun", "SimHei", "Noto Sans CJK SC", "Source Han Sans SC"}
    violations = []
    for row in ws.iter_rows():
        for cell in row:
            if cell.font and cell.font.name in forbidden_fonts:
                violations.append(f"{cell.coordinate}: {cell.font.name}")
    assert not violations, f"中国字形フォント検知:\n" + "\n".join(violations)

def validate_color_convention(ws, color_map: dict):
    """色分け規約の遵守確認（入力セル=黄、計算セル=緑）"""
    for cell_addr, expected_color_key in color_map.items():
        cell = ws[cell_addr]
        actual_fill = cell.fill.fgColor.rgb if cell.fill else None
        # 先頭 2 文字は alpha チャンネル（FF...）
        actual_hex = actual_fill[2:] if actual_fill and len(actual_fill) == 8 else actual_fill
        # COLORS dict は generate_excel.py と同期
        COLORS = {"input": "FFF2CC", "formula": "E2EFDA", "reference": "DDEEFF", "warning": "FFE0E0"}
        expected_hex = COLORS.get(expected_color_key)
        assert actual_hex == expected_hex, (
            f"{cell_addr}: 色規約違反 期待={expected_color_key}({expected_hex}) 実際={actual_hex}"
        )

def main():
    wb = openpyxl.load_workbook(
        Path(__file__).parent.parent / "output" / "pl_fy2026.xlsx",
        data_only=True  # 数式ではなく計算済み値を取得
    )
    ws = wb["PL_Summary"]
    pl_data = load_source("pl_data.json")

    print("-- 構造チェック")
    validate_structure(ws, ["科目", "Q1 実績", "Q2 実績", "Q3 予測", "Q4 予測", "通期合計"])

    print("-- 数値 3 点 assert（売上合計 / 粗利 / 営業利益）")
    validate_pl_totals(ws, pl_data)

    print("-- フォント検証（中国字形混入チェック）")
    validate_font(ws)

    print("-- 色分け規約検証")
    color_map = pl_data.get("color_validation_map", {})
    if color_map:
        validate_color_convention(ws, color_map)

    print("OK: 全検証通過")

if __name__ == "__main__":
    main()
```

YOU MUST: `data_only=True` で数式セルは計算済み値を取得。ただし openpyxl は Excel を実行しないため、数式結果は None になる場合がある。その際は LibreOffice CLI で事前に一度開いてキャッシュを更新するか、数式セルの検証は「数式文字列が正しいか」で代替する。

---

## 5. 色分け規約（brand-guidelines 連携）

| 色 | HEX | Excel での用途 | DESIGN.md との対応 |
|---|---|---|---|
| 黄 | #FFF2CC | 入力セル（ユーザーが直接変更する値） | アクセントカラー系 |
| 緑 | #E2EFDA | 自動計算セル（数式・SUM・集計） | ポジティブ系 |
| 青 | #DDEEFF | 他シート参照セル（=Assumptions!B3 等） | 情報系 |
| 赤 | #FFE0E0 | 警告セル（閾値超過・要確認項目） | アラート系 |
| 白 | #FFFFFF | 通常表示セル（ラベル・説明） | ベース |

適用ルール:
- Assumptions シートは原則「全セル黄」。計算式が入ったセルは緑に変更
- PL_Summary の通期合計列（F 列等）は全セル緑
- 他シートから引っ張るセルは青で視覚的に参照構造を示す
- 閾値チェック（粗利率 30% 未満等）は条件付き書式と組み合わせ、赤を自動適用

NEVER: 色を「見た目の好み」で変更しない。色はデータの意味を示す情報設計。規約外の色を追加する場合は CLAUDE.md の Excel Config に追記してから使用する。

詳細なカラーシステムは `.claude/skills/brand-guidelines.md` セクション「カラーパレット」を参照。

---

## 6. バージョン管理（Git + _archive/）

### Git 運用
- Excel 生成スクリプト（`scripts/*.py`）と source データ（`source/*.json`）を Git 管理対象とする
- output/ の xlsx は `.gitignore` に入れるか、リリース用生成物として明示コミットする（プロジェクト方針に従う）
- 1 コミット = 1 目的（CLAUDE.md ハードルール 12）。数値修正とスクリプト改修を同一コミットに混在させない

```bash
# OK: 目的が分離されている
git commit -m "feat(excel): 売上合計セルの数式を Q4 まで拡張"
git commit -m "fix(excel): Assumptions シートの入力セル色を黄に修正"

# NG: 複数目的の混在
git commit -m "Excel いろいろ修正"
```

### _archive/ 運用
- クライアントに送付した xlsx は必ず _archive/ にコピーしてからバージョン番号を付与する
- バージョン番号は送付順の連番（v22 → v24 → v25 は欠番あり可、追番のみ厳守）
- _archive/ のファイルは編集・削除禁止（ハードルール 15: 不可逆操作は承認必須）

```bash
# アーカイブ手順
cp output/pl_fy2026.xlsx _archive/pl_fy2026_v25.xlsx
git add _archive/pl_fy2026_v25.xlsx
git commit -m "chore(archive): v25 をクライアント送付前にアーカイブ"
```

---

## 7. 4 エージェント連携

| エージェント | Excel 出力での責任範囲 |
|---|---|
| proposal-writer | 事業計画書・投資家資料の「数値スライド」構成を定義。セル番地・列マップを CLAUDE.md に記述し、kpi-analytics に渡す |
| kpi-analytics | PL 数値・KPI 目標値を source/*.json に格納。売上合計・粗利・営業利益の期待値を `expected_totals` キーに明記し、validate_excel.py の 3 点 assert の根拠とする |
| sales-deck-designer | Excel から PNG/SVG でグラフを書き出し、HTML セールスデックに埋め込む。openpyxl の `chart` モジュールまたは matplotlib で対応。埋め込み時は `lang="ja"` / `ja-JP` 必須 |
| strategy-lead | 中期計画の仮定値（CAGR・市場成長率・コスト構造）を Assumptions シートに格納するロジックをレビュー。感度分析（楽観/標準/悲観）の 3 シナリオを別シートで要求する |

連携プロトコル:
1. strategy-lead が仮定値を `source/assumptions.json` に格納
2. kpi-analytics が PL 数値を `source/pl_data.json` に格納（`expected_totals` 含む）
3. proposal-writer が CLAUDE.md に Excel Config（セル番地・列マップ・カラー）を記述
4. Claude Code が `generate_excel.py` を実行 -> `validate_excel.py` で検証
5. sales-deck-designer が出力 xlsx からグラフを抽出してデック素材化

---

## 8. 失敗パターン回避

### 数式エラー（VLOOKUP / SUM 参照切れ）
- 原因: セル番地を文字列で指定した後に行挿入・削除が発生し、参照がずれる
- 対策: 固定参照（`$B$5`）を使用。VLOOKUP は XLOOKUP（openpyxl 非対応のため LibreOffice CALC 想定時のみ）か INDEX/MATCH に変える
- 検知: `validate_excel.py` の `validate_structure()` がヘッダー位置ずれを検知する

### 数値型不整合（文字列数値）
- 原因: JSON から読み込んだ値が `str` 型のまま Excel セルに書き込まれる
- 対策: `source/*.json` に格納する数値は必ず `int` / `float` で保持。ロード後に `int(val)` でキャスト確認
- 検知: `validate_pl_totals()` の `isinstance(actual, (int, float))` assert が検知する

### 中国字形フォールバック
- 原因: `Font(name=...)` を省略すると openpyxl のデフォルトフォント（Calibri）が適用され、日本語レンダリング時に OS が SimSun 等にフォールバックする
- 対策: 全セルに `Font(name="Meiryo UI")` または `Font(name="游ゴシック")` を明示
- 検知: `validate_font()` が SimSun / SimHei / Noto Sans CJK SC を検知する
- 詳細: `.claude/skills/brand-guidelines.md` ハードルール 10 参照

### 数式の未解決（data_only=True で None）
- 原因: openpyxl は Excel エンジンを持たないため、新規生成ファイルの数式結果は None になる
- 対策: 検証を「数式文字列の正しさ（`=SUM(B5:E5)` 形式か）」チェックに変更する。または LibreOffice CLI で一度開いて保存することで値をキャッシュする
- コマンド例: `libreoffice --headless --calc --convert-to xlsx output/pl_fy2026.xlsx`

### 改行・文字化け（CP932 vs UTF-8）
- 原因: source/*.json を UTF-8 で保存し、Windows Excel が CP932 で読む場合に文字化けが発生する
- 対策: openpyxl 経由で書き込む場合は文字コード問題は発生しない（xlsx は XML）。CSV 出力が必要な場合は `encoding="utf-8-sig"` で BOM 付き UTF-8 を使用する

### セル結合によるデータ破損
- 原因: `merge_cells()` を使うと結合範囲の左上以外のセルがデータを失う
- 対策: ヘッダーセル結合は最後に実施する。検証スクリプトは結合前のデータ範囲に対して実行する

---

## 9. Pre-mortem（失敗シナリオ 5 選）

カーネマン式 Pre-mortem として「このプレイブックを 1 年追って失敗するシナリオ」を事前定義する。

1. source/ と Excel の乖離: source/*.json を更新したのにスクリプトを再実行せず、古い xlsx をクライアントに送付する
2. 検証スクリプトの形骸化: `expected_totals` を更新し忘れ、validate_excel.py が常に通過する状態になる
3. フォント指定の抜け漏れ: 新しい開発者がシートを追加する際に `Font(name=FONT_JA)` を省略し、中国字形が混入する
4. CLAUDE.md の Excel Config 未更新: シート追加・列追加後に Excel Config を更新せず、Claude Code が古い列マップでスクリプトを生成する
5. _archive/ の肥大化: アーカイブを削除禁止にしたが整理ルールがなく、数十バージョンが蓄積してレポジトリが重くなる（対策: _archive/ は `.gitignore` に入れ、別ストレージ運用も検討）

---

## 参照スキル

| スキル | 参照理由 |
|---|---|
| `.claude/skills/engineering-playbook.md` | Git 規律・コミット粒度・1 コミット 1 目的 |
| `.claude/skills/code-quality-gates.md` | 検証スクリプトの品質ゲート設計（Gate 3: テスト自動化） |
| `.claude/skills/brand-guidelines.md` | 日本語フォント規律・中国字形フォールバック禁止（ハードルール 10） |
| `.claude/skills/revenue-growth-framework.md` | PL 数値・ブレイクイーブン・感度分析の計算ロジック |

---

## 出典・依拠先

- FACT: 本ファイルは @nbyk115/consulting-os の規律ファイルとして 2026-05-06 PR #70 で新設された（ファイルパス: .claude/skills/excel-output-playbook.md、規律カテゴリ: ConsultingOS 6 部門 27 エージェント・27 スキル体系への追加スキル、Phase 3 PR Q として ICP 対象の Excel 納品物品質向上を目的とする）
- INFERENCE: 業界標準ベストプラクティス（masahirochaen 氏の SNS 実体験 Tips・Microsoft Excel 公式仕様・openpyxl ライブラリ公式ドキュメント・LibreOffice CLI リファレンス）から派生し、ConsultingOS の既存規律（Boris Cherny 流 9 規律・佐藤裕介流 PL 思考・カーネマン式 Pre-mortem）と整合する形で各セクションの判断基準を設計した
- SPECULATION: 4 週間ごとの再評価カレンダー（evolution-log.md「再評価カレンダー」セクション）で形骸化を検出し、openpyxl のバージョンアップや Microsoft 365 の仕様変更に伴い検証コマンドや数式形式が陳腐化した場合は本ファイルを更新・分離・削除のいずれかで整理する運用予定とする
