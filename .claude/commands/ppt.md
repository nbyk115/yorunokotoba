# /ppt — PPTスライド生成コマンド

引数: $ARGUMENTS（テーマ・タイトル・枚数など）

## 概要
`python-pptx` を使って `.pptx` ファイルをコードで生成する。
デザインルールは `.claude/skills/ppt-presentation.md` を参照。

---

## 手順

### Step 1: 要件確認
引数からスライドの目的・枚数・構成を把握する。
不明な場合はデフォルト（提案書10枚構成）を適用。

```
テーマ: $ARGUMENTS
枚数: 指定なければ10枚
スタイル: ビジネス提案書（ジョブズ原則適用）
言語: 日本語（英語オプションあり）
```

### Step 2: python-pptx でファイル生成

以下のPythonスクリプトを `/tmp/generate_ppt.py` として生成し、実行する:

```python
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
import os

# ================================
# 設定
# ================================
OUTPUT_PATH = "/tmp/output_presentation.pptx"
SLIDE_WIDTH  = Inches(13.33)   # 16:9 横
SLIDE_HEIGHT = Inches(7.5)     # 16:9 縦

# カラーパレット
COLOR_BG      = RGBColor(0xFF, 0xFF, 0xFF)  # 白背景
COLOR_PRIMARY = RGBColor(0x1A, 0x1A, 0x2E)  # ダークネイビー（タイトル）
COLOR_ACCENT  = RGBColor(0x00, 0x7A, 0xFF)  # アクセントブルー
COLOR_BODY    = RGBColor(0x33, 0x33, 0x33)  # 本文グレー
COLOR_WHITE   = RGBColor(0xFF, 0xFF, 0xFF)  # 白

FONT_JP = "Meiryo"   # 日本語: メイリオ
FONT_EN = "Helvetica Neue"  # 英字（なければArialで代替）

# ================================
# ヘルパー関数
# ================================
def add_textbox(slide, text, left, top, width, height,
                font_name=FONT_JP, font_size=18, bold=False,
                color=COLOR_BODY, align=PP_ALIGN.LEFT):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.name = font_name
    run.font.size = Pt(font_size)
    run.font.bold = bold
    run.font.color.rgb = color
    return txBox

def fill_slide_bg(slide, color=COLOR_BG):
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = color

def add_title_slide(prs, title, subtitle=""):
    """タイトルスライド"""
    layout = prs.slide_layouts[6]  # 空白レイアウト
    slide = prs.slides.add_slide(layout)
    fill_slide_bg(slide, COLOR_PRIMARY)

    # タイトル（大）
    add_textbox(slide, title,
                Inches(1.0), Inches(2.5), Inches(11.33), Inches(1.8),
                font_size=40, bold=True, color=COLOR_WHITE,
                align=PP_ALIGN.CENTER)
    # サブタイトル
    if subtitle:
        add_textbox(slide, subtitle,
                    Inches(1.0), Inches(4.5), Inches(11.33), Inches(0.8),
                    font_size=20, color=RGBColor(0xCC, 0xCC, 0xFF),
                    align=PP_ALIGN.CENTER)
    return slide

def add_content_slide(prs, title, bullets, accent_line=True):
    """コンテンツスライド（タイトル + 箇条書き）"""
    layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(layout)
    fill_slide_bg(slide)

    # アクセントライン（上部）
    if accent_line:
        line = slide.shapes.add_shape(
            1,  # MSO_SHAPE_TYPE.RECTANGLE
            Inches(0), Inches(0), SLIDE_WIDTH, Inches(0.08)
        )
        line.fill.solid()
        line.fill.fore_color.rgb = COLOR_ACCENT
        line.line.fill.background()

    # スライドタイトル
    add_textbox(slide, title,
                Inches(0.6), Inches(0.3), Inches(12.0), Inches(0.9),
                font_size=28, bold=True, color=COLOR_PRIMARY)

    # 区切り線
    sep = slide.shapes.add_shape(
        1, Inches(0.6), Inches(1.25), Inches(11.5), Inches(0.02)
    )
    sep.fill.solid()
    sep.fill.fore_color.rgb = RGBColor(0xDD, 0xDD, 0xDD)
    sep.line.fill.background()

    # 箇条書き
    y_pos = Inches(1.5)
    for bullet in bullets:
        add_textbox(slide, f"• {bullet}",
                    Inches(0.8), y_pos, Inches(11.5), Inches(0.6),
                    font_size=18, color=COLOR_BODY)
        y_pos += Inches(0.7)

    return slide

def add_number_highlight_slide(prs, number, label, context=""):
    """数字ハイライトスライド（ジョブズスタイル）"""
    layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(layout)
    fill_slide_bg(slide, COLOR_PRIMARY)

    add_textbox(slide, number,
                Inches(0), Inches(1.5), SLIDE_WIDTH, Inches(3.0),
                font_size=96, bold=True, color=COLOR_ACCENT,
                align=PP_ALIGN.CENTER)
    add_textbox(slide, label,
                Inches(0), Inches(4.8), SLIDE_WIDTH, Inches(1.0),
                font_size=28, bold=True, color=COLOR_WHITE,
                align=PP_ALIGN.CENTER)
    if context:
        add_textbox(slide, context,
                    Inches(1.0), Inches(5.9), Inches(11.33), Inches(0.8),
                    font_size=16, color=RGBColor(0xCC, 0xCC, 0xFF),
                    align=PP_ALIGN.CENTER)
    return slide

def add_section_divider(prs, section_title, section_num=""):
    """セクション区切りスライド"""
    layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(layout)
    fill_slide_bg(slide, COLOR_ACCENT)

    if section_num:
        add_textbox(slide, section_num,
                    Inches(0), Inches(2.0), SLIDE_WIDTH, Inches(1.0),
                    font_size=48, bold=True, color=RGBColor(0xFF,0xFF,0xFF),
                    align=PP_ALIGN.CENTER)
    add_textbox(slide, section_title,
                Inches(0), Inches(3.2), SLIDE_WIDTH, Inches(1.5),
                font_size=36, bold=True, color=COLOR_WHITE,
                align=PP_ALIGN.CENTER)
    return slide


# ================================
# スライド構成（ここをカスタマイズ）
# ================================
prs = Presentation()
prs.slide_width  = SLIDE_WIDTH
prs.slide_height = SLIDE_HEIGHT

# --- Slide 1: タイトル ---
add_title_slide(prs,
    title="[ここにタイトル]",
    subtitle="[クライアント名] | [日付]")

# --- Slide 2: 課題・問い ---
add_content_slide(prs,
    title="解決すべき課題",
    bullets=[
        "課題1: [具体的な問題点]",
        "課題2: [現状のギャップ]",
        "課題3: [なぜ今対処が必要か]",
    ])

# --- Slide 3: 数字インパクト ---
add_number_highlight_slide(prs,
    number="XX%",
    label="[インパクトを示す指標]",
    context="[根拠・出典・対象期間]")

# --- Slide 4: 提案概要 ---
add_content_slide(prs,
    title="提案の核心",
    bullets=[
        "① [施策1]",
        "② [施策2]",
        "③ [施策3]",
    ])

# --- Slide 5: 実績・証拠 ---
add_content_slide(prs,
    title="実績・根拠",
    bullets=[
        "Case A: [実績数字]",
        "Case B: [実績数字]",
        "Case C: [実績数字]",
    ])

# --- Slide 6: ロードマップ ---
add_content_slide(prs,
    title="実行ロードマップ",
    bullets=[
        "Phase 1（〜1ヶ月）: [アクション]",
        "Phase 2（〜3ヶ月）: [アクション]",
        "Phase 3（〜6ヶ月）: [アクション]",
    ])

# --- Slide 7: 期待効果 ---
add_number_highlight_slide(prs,
    number="+XX%",
    label="[期待できる成果指標]",
    context="[達成条件・期間]")

# --- Slide 8: 体制・チーム ---
add_content_slide(prs,
    title="実行体制",
    bullets=[
        "プロジェクトリーダー: [名前/役割]",
        "担当: [名前/役割]",
        "サポート: [名前/役割]",
    ])

# --- Slide 9: 投資対効果 ---
add_content_slide(prs,
    title="投資対効果（ROI試算）",
    bullets=[
        "初期投資: [金額]",
        "月次コスト: [金額]",
        "期待リターン: [金額]（XX倍）",
        "投資回収期間: [XX ヶ月]",
    ])

# --- Slide 10: ネクストアクション ---
add_content_slide(prs,
    title="Next Action",
    bullets=[
        "✅ [アクション1]（担当: X / 期限: X月X日）",
        "✅ [アクション2]（担当: X / 期限: X月X日）",
        "📞 お問い合わせ: [メール/電話]",
    ])

# ================================
# 保存
# ================================
prs.save(OUTPUT_PATH)
print(f"✅ PPT生成完了: {OUTPUT_PATH}")
print(f"   スライド数: {len(prs.slides)}枚")
```

### Step 3: スクリプトを実行

```bash
pip install python-pptx -q && python3 /tmp/generate_ppt.py
```

### Step 4: カスタマイズして再生成

ユーザーの内容（テーマ・数字・具体的な文章）をスクリプトに組み込んで再実行。
`[ここにタイトル]` などのプレースホルダーを全て実データで置き換える。

### Step 5: ファイルの場所を通知

```
生成ファイル: /tmp/output_presentation.pptx
ダウンロード方法: ファイルを直接開く or プロジェクトフォルダにコピー
```

---

## デザインバリエーション

| スタイル | 背景 | 用途 |
|---|---|---|
| ダークネイビー（デフォルト） | `COLOR_PRIMARY` (#1A1A2E) | 提案書・ピッチデック |
| ホワイト | `COLOR_BG` (#FFFFFF) | 社内報告・進捗報告 |
| ブランドカラー | クライアント指定色 | クレデンシャル・営業資料 |

---

## 参照スキル

- `.claude/skills/ppt-presentation.md` — デザインルール・日本語品質・ジョブズ原則
- `.claude/agents/consulting/proposal-writer.md` — 提案書の論理構成

---

## よくある失敗と対策

| 問題 | 原因 | 対策 |
|---|---|---|
| 日本語が豆腐（□□□）になる | フォント未インストール | Noto Sans JPに変更 or PDF出力 |
| テキストがはみ出る | フォントサイズが大きすぎる | Pt() を小さくする |
| python-pptxが入っていない | 未インストール | `pip install python-pptx` |
| スライドが真っ白になる | レイアウト番号が違う | `slide_layouts[6]`（空白）を使う |
