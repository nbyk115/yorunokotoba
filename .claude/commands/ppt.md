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

### Step 2: フォント確認・インストール

**実行前に必ずフォントチェック（中国語フォント混入防止）:**
```bash
# 日本語フォント確認
fc-list --format="%{family[0]}\n" | grep -i "noto\|ipa\|takao\|vl" | head -5

# フォントがない場合はインストール
apt-get install -y fonts-noto-cjk && fc-cache -fv
```

### Step 3: python-pptx でファイル生成

以下のPythonスクリプトを `/tmp/generate_ppt.py` として生成し、実行する:

```python
# ============================================================
# ConsultingOS PPT Generator
# 中国語フォント完全排除・上下左右中央揃え完全対応版
# ============================================================
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from lxml import etree
import subprocess, os

# ============================================================
# §0 フォント自動検出（中国語フォント完全排除）
# ============================================================

def _detect_jp_font():
    """
    Linux環境でインストール済みの日本語フォントを自動検出する。
    優先順位: Noto Sans CJK JP > IPAPGothic > IPAGothic > TakaoPGothic
    重要: Noto Sans CJK SC（中国語）ではなく JP（日本語）バリアントを指定すること。
    """
    candidates = [
        ("Noto Sans CJK JP",  ["notosanscjkjp", "noto sans cjk jp"]),
        ("IPAPGothic",        ["ipapgothic"]),
        ("IPAGothic",         ["ipagothic"]),
        ("TakaoPGothic",      ["takaopgothic"]),
        ("VL PGothic",        ["vlpgothic", "vl pgothic"]),
        ("Noto Sans JP",      ["notosansjp", "noto sans jp"]),
    ]
    try:
        result = subprocess.run(
            ["fc-list", "--format=%{family[0]}\n"],
            capture_output=True, text=True, timeout=5
        )
        avail = result.stdout.replace(" ", "").lower()
        for font_name, keys in candidates:
            if any(k in avail for k in keys):
                print(f"✅ 日本語フォント検出: {font_name}")
                return font_name
    except Exception as e:
        print(f"⚠️  fc-list エラー: {e}")

    # フォントなし → インストール
    print("⚙️  日本語フォントが見つかりません。インストールを試みます...")
    try:
        subprocess.run(
            ["apt-get", "install", "-y", "fonts-noto-cjk"],
            capture_output=True, timeout=120
        )
        subprocess.run(["fc-cache", "-fv"], capture_output=True, timeout=15)
        print("✅ fonts-noto-cjk インストール完了")
    except Exception as e:
        print(f"⚠️  インストール失敗: {e}")
    return "Noto Sans CJK JP"


FONT_JP = _detect_jp_font()
FONT_EN = "Helvetica Neue"

# ============================================================
# §1 カラーパレット
# ============================================================
C_BG       = RGBColor(0xFF, 0xFF, 0xFF)  # 白背景
C_NAVY     = RGBColor(0x0D, 0x1B, 0x2A)  # ダークネイビー（タイトル・ダーク背景）
C_ACCENT   = RGBColor(0x00, 0x78, 0xD4)  # アクセントブルー（Microsoft Blue系）
C_ACCENT2  = RGBColor(0x00, 0xA8, 0x8A)  # サブアクセント（ティール）
C_BODY     = RGBColor(0x1A, 0x1A, 0x1A)  # 本文テキスト（ほぼ黒）
C_MUTED    = RGBColor(0x55, 0x65, 0x75)  # 補足テキスト（グレー）
C_WHITE    = RGBColor(0xFF, 0xFF, 0xFF)  # 白
C_LIGHT    = RGBColor(0xF4, 0xF7, 0xFB)  # 薄い背景（カード用）
C_BORDER   = RGBColor(0xD8, 0xE0, 0xEB)  # 区切り線

# スライドサイズ（16:9）
SLIDE_W = Inches(13.333)
SLIDE_H = Inches(7.5)

# ============================================================
# §2 コアユーティリティ関数
# ============================================================

def _apply_jp_font(run, font_name=None):
    """
    【中国語フォント完全排除の核心】
    <a:latin>（英字）と <a:ea>（東アジア文字）の両方に日本語フォントを明示設定する。
    <a:ea> を省略すると、テーマのデフォルト East Asian フォント（中国語 SC など）に
    自動フォールバックするため、必ず両方設定すること。
    <a:cs>（Complex Script）も念のため設定する。
    """
    f = font_name or FONT_JP
    rPr = run._r.get_or_add_rPr()
    for tag in ('a:latin', 'a:ea', 'a:cs'):
        el = rPr.find(qn(tag))
        if el is None:
            el = etree.SubElement(rPr, qn(tag))
        el.set('typeface', f)


def _fill_bg(slide, color=C_BG):
    """スライド背景色を塗りつぶす"""
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = color


def _remove_border(shape):
    """シェイプの枠線を削除"""
    try:
        shape.line.fill.background()
    except Exception:
        pass


def add_textbox(slide, text, left, top, width, height,
                font_size=18, bold=False, italic=False,
                color=None, align=PP_ALIGN.LEFT,
                font_name=None, line_spacing=1.15):
    """
    テキストボックスを追加。
    _apply_jp_font により中国語フォント混入を防止する。
    """
    color = color or C_BODY
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.alignment = align
    # 行間設定
    from pptx.oxml import parse_xml
    from pptx.oxml.ns import nsmap
    try:
        from pptx.util import Pt as _Pt
        from pptx.oxml.ns import qn as _qn
        lnSpc = parse_xml(
            f'<a:lnSpc xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">'
            f'<a:spcPct val="{int(line_spacing * 100)}%"/></a:lnSpc>'
        )
        p._p.append(lnSpc)
    except Exception:
        pass

    run = p.add_run()
    run.text = text
    run.font.size = Pt(font_size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color
    _apply_jp_font(run, font_name)

    return txBox


def add_centered_shape(slide, text, left, top, width, height,
                        bg_color, text_color=None, font_size=18,
                        bold=False, font_name=None, shape_type=1):
    """
    テキストが上下左右中央揃えのシェイプ（ボックス）を追加。
    vertical_anchor=MSO_ANCHOR.MIDDLE + PP_ALIGN.CENTER で完全センタリング。
    枠線なし・背景色塗りつぶし。
    """
    text_color = text_color or C_WHITE
    shape = slide.shapes.add_shape(shape_type, left, top, width, height)

    # 塗りつぶし
    shape.fill.solid()
    shape.fill.fore_color.rgb = bg_color
    _remove_border(shape)

    # テキスト設定
    tf = shape.text_frame
    tf.word_wrap = True
    tf.auto_size = None
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE   # ← 上下中央揃え（核心）
    tf.margin_left   = Inches(0.15)
    tf.margin_right  = Inches(0.15)
    tf.margin_top    = Inches(0.08)
    tf.margin_bottom = Inches(0.08)

    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER  # ← 左右中央揃え

    run = p.add_run()
    run.text = text
    run.font.size = Pt(font_size)
    run.font.bold = bold
    run.font.color.rgb = text_color
    _apply_jp_font(run, font_name)

    return shape


def add_rect(slide, left, top, width, height, color, border=False, border_color=None):
    """装飾用矩形（テキストなし）"""
    shape = slide.shapes.add_shape(1, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    if border and border_color:
        shape.line.color.rgb = border_color
        shape.line.width = Pt(0.75)
    else:
        _remove_border(shape)
    # テキスト空に
    shape.text_frame.text = ""
    return shape


# ============================================================
# §3 スライドテンプレート関数
# ============================================================

def make_title_slide(prs, title, subtitle="", date_str=""):
    """
    タイトルスライド: ダークネイビー全面 + 白テキスト。
    左サイドにアクセントバー。
    """
    layout = prs.slide_layouts[6]  # 空白
    slide = prs.slides.add_slide(layout)
    _fill_bg(slide, C_NAVY)

    # 左アクセントバー（縦）
    add_rect(slide, Inches(0), Inches(0), Inches(0.25), SLIDE_H, C_ACCENT)

    # タイトル
    add_textbox(slide, title,
                Inches(0.7), Inches(2.2), Inches(12.0), Inches(2.0),
                font_size=42, bold=True, color=C_WHITE,
                align=PP_ALIGN.LEFT, line_spacing=1.2)

    # サブタイトル
    if subtitle:
        add_textbox(slide, subtitle,
                    Inches(0.7), Inches(4.4), Inches(11.0), Inches(0.7),
                    font_size=20, color=RGBColor(0xA0, 0xC4, 0xE8),
                    align=PP_ALIGN.LEFT)

    # 日付・会社名（右下）
    if date_str:
        add_textbox(slide, date_str,
                    Inches(8.0), Inches(6.6), Inches(5.0), Inches(0.5),
                    font_size=13, color=RGBColor(0x66, 0x88, 0xAA),
                    align=PP_ALIGN.RIGHT)

    # 下部アクセントライン
    add_rect(slide, Inches(0.7), Inches(5.3), Inches(4.0), Inches(0.04), C_ACCENT)

    return slide


def make_section_divider(prs, section_num, section_title):
    """
    セクション区切りスライド: アクセントブルー全面。
    番号（大）＋ セクション名。
    """
    layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(layout)
    _fill_bg(slide, C_ACCENT)

    # 大きな番号（薄く）
    add_textbox(slide, section_num,
                Inches(0), Inches(0.8), SLIDE_W, Inches(2.5),
                font_size=120, bold=True,
                color=RGBColor(0xFF, 0xFF, 0xFF),
                align=PP_ALIGN.CENTER)

    # セクションタイトル
    add_textbox(slide, section_title,
                Inches(1.0), Inches(3.8), Inches(11.33), Inches(1.5),
                font_size=36, bold=True, color=C_WHITE,
                align=PP_ALIGN.CENTER)

    # 下部細線
    add_rect(slide, Inches(4.5), Inches(5.5), Inches(4.33), Inches(0.03),
             RGBColor(0xFF, 0xFF, 0xFF))

    return slide


def make_content_slide(prs, title, bullets, subtitle=""):
    """
    コンテンツスライド: 白背景 + 左アクセントバー + タイトル + 箇条書き。
    """
    layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(layout)
    _fill_bg(slide)

    # 上部アクセントバー（横・細）
    add_rect(slide, Inches(0), Inches(0), SLIDE_W, Inches(0.06), C_ACCENT)

    # スライドタイトル
    add_textbox(slide, title,
                Inches(0.6), Inches(0.25), Inches(12.0), Inches(0.85),
                font_size=28, bold=True, color=C_NAVY, align=PP_ALIGN.LEFT)

    # サブタイトル（オプション）
    if subtitle:
        add_textbox(slide, subtitle,
                    Inches(0.6), Inches(1.05), Inches(12.0), Inches(0.4),
                    font_size=15, color=C_MUTED, align=PP_ALIGN.LEFT)

    # 区切り線
    add_rect(slide, Inches(0.6), Inches(1.15 if subtitle else 1.05),
             Inches(11.5), Inches(0.025), C_BORDER)

    # 箇条書き（左にカラーのドット）
    y = Inches(1.35 if subtitle else 1.25)
    bullet_gap = Inches(0.72)
    for i, bullet in enumerate(bullets):
        # ドット（アクセント色の小さい丸）
        dot_top = y + Inches(0.12)
        add_centered_shape(slide, "●",
                           Inches(0.55), dot_top, Inches(0.25), Inches(0.3),
                           bg_color=C_BG, text_color=C_ACCENT,
                           font_size=9, bold=False)

        add_textbox(slide, bullet,
                    Inches(0.85), y, Inches(11.8), Inches(0.58),
                    font_size=18, color=C_BODY, align=PP_ALIGN.LEFT,
                    line_spacing=1.25)
        y += bullet_gap

    return slide


def make_number_slide(prs, number, label, context="", dark=True):
    """
    数字インパクトスライド（ジョブズスタイル）。
    巨大な数字1つで1スライドを占有。
    """
    layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(layout)
    bg = C_NAVY if dark else C_BG
    _fill_bg(slide, bg)

    # 大数字
    num_color = C_ACCENT if dark else C_ACCENT
    num_text_color = C_WHITE if dark else C_NAVY
    add_textbox(slide, number,
                Inches(0), Inches(1.2), SLIDE_W, Inches(3.2),
                font_size=108, bold=True, color=C_ACCENT,
                align=PP_ALIGN.CENTER)

    # ラベル
    add_textbox(slide, label,
                Inches(1.0), Inches(4.6), Inches(11.33), Inches(0.9),
                font_size=30, bold=True,
                color=C_WHITE if dark else C_NAVY,
                align=PP_ALIGN.CENTER)

    # コンテキスト（出典など）
    if context:
        add_textbox(slide, context,
                    Inches(1.5), Inches(5.7), Inches(10.33), Inches(0.6),
                    font_size=15, color=RGBColor(0x88, 0xAA, 0xCC) if dark else C_MUTED,
                    align=PP_ALIGN.CENTER)
    return slide


def make_3col_slide(prs, title, cols):
    """
    3カラム比較スライド。
    cols = [{"title":"A", "items":["1","2","3"]}, ...]
    """
    layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(layout)
    _fill_bg(slide)

    # 上部アクセントバー
    add_rect(slide, Inches(0), Inches(0), SLIDE_W, Inches(0.06), C_ACCENT)

    # スライドタイトル
    add_textbox(slide, title,
                Inches(0.6), Inches(0.25), Inches(12.0), Inches(0.8),
                font_size=28, bold=True, color=C_NAVY)

    add_rect(slide, Inches(0.6), Inches(1.05), Inches(11.5), Inches(0.025), C_BORDER)

    # 3カラムレイアウト（4.0インチ幅 × 3）
    col_w  = Inches(3.9)
    col_h  = Inches(4.8)
    col_top = Inches(1.3)
    gaps   = [Inches(0.45), Inches(4.5), Inches(8.55)]

    colors = [C_ACCENT, C_ACCENT2, RGBColor(0x7B, 0x61, 0xFF)]

    for i, (col, left, clr) in enumerate(zip(cols, gaps, colors)):
        # カラムヘッダーボックス
        add_centered_shape(slide, col.get("title", ""),
                           left, col_top, col_w, Inches(0.55),
                           bg_color=clr, text_color=C_WHITE,
                           font_size=17, bold=True)

        # カラム本体（薄い背景）
        add_rect(slide, left, col_top + Inches(0.55), col_w,
                 col_h - Inches(0.55), C_LIGHT, border=True, border_color=C_BORDER)

        # 項目テキスト
        y_item = col_top + Inches(0.75)
        for item in col.get("items", []):
            add_textbox(slide, f"• {item}",
                        left + Inches(0.15), y_item, col_w - Inches(0.3), Inches(0.55),
                        font_size=15, color=C_BODY)
            y_item += Inches(0.62)

    return slide


def make_roadmap_slide(prs, title, phases):
    """
    フェーズ型ロードマップスライド。
    phases = [{"label":"Phase 1", "period":"〜1ヶ月", "actions":["A","B"]}, ...]
    """
    layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(layout)
    _fill_bg(slide)

    add_rect(slide, Inches(0), Inches(0), SLIDE_W, Inches(0.06), C_ACCENT)
    add_textbox(slide, title,
                Inches(0.6), Inches(0.25), Inches(12.0), Inches(0.8),
                font_size=28, bold=True, color=C_NAVY)
    add_rect(slide, Inches(0.6), Inches(1.05), Inches(11.5), Inches(0.025), C_BORDER)

    n = len(phases)
    col_w = Inches(12.0 / n) if n else Inches(4.0)
    clrs  = [C_ACCENT, C_ACCENT2, RGBColor(0x7B, 0x61, 0xFF), C_NAVY]

    for i, phase in enumerate(phases):
        left = Inches(0.6) + col_w * i
        clr  = clrs[i % len(clrs)]

        # ヘッダー
        add_centered_shape(slide,
                           f"{phase.get('label','')}  {phase.get('period','')}",
                           left + Inches(0.05), Inches(1.3),
                           col_w - Inches(0.1), Inches(0.55),
                           bg_color=clr, font_size=14, bold=True)

        # 矢印（次フェーズへ）
        if i < n - 1:
            add_textbox(slide, "▶",
                        left + col_w - Inches(0.15), Inches(2.2),
                        Inches(0.3), Inches(0.4),
                        font_size=14, color=C_MUTED, align=PP_ALIGN.CENTER)

        # アクション一覧
        y = Inches(2.05)
        for action in phase.get("actions", []):
            add_textbox(slide, f"▸ {action}",
                        left + Inches(0.1), y, col_w - Inches(0.2), Inches(0.5),
                        font_size=14, color=C_BODY)
            y += Inches(0.55)

    return slide


def make_cta_slide(prs, main_text, contact=""):
    """
    Call to Action スライド: ネイビー全面 + 1行大テキスト。
    """
    layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(layout)
    _fill_bg(slide, C_NAVY)

    add_rect(slide, Inches(0), Inches(0), Inches(0.25), SLIDE_H, C_ACCENT)
    add_rect(slide, Inches(0.7), Inches(3.6), Inches(4.0), Inches(0.04), C_ACCENT)

    add_textbox(slide, main_text,
                Inches(0.7), Inches(2.0), Inches(12.0), Inches(1.8),
                font_size=38, bold=True, color=C_WHITE,
                align=PP_ALIGN.LEFT, line_spacing=1.3)

    if contact:
        add_textbox(slide, contact,
                    Inches(0.7), Inches(5.8), Inches(12.0), Inches(0.7),
                    font_size=18, color=RGBColor(0x88, 0xBB, 0xEE),
                    align=PP_ALIGN.LEFT)

    return slide


# ============================================================
# §4 スライド構成（ここをカスタマイズ）
# ============================================================
OUTPUT_PATH = "/tmp/output_presentation.pptx"

prs = Presentation()
prs.slide_width  = SLIDE_W
prs.slide_height = SLIDE_H

# --- Slide 1: タイトル ---
make_title_slide(prs,
    title="[ここにタイトル]",
    subtitle="[サブタイトル・プロジェクト名]",
    date_str="[クライアント名]  ｜  [年月]")

# --- Slide 2: 課題・問い ---
make_content_slide(prs,
    title="解決すべき課題",
    bullets=[
        "課題 1: [具体的な問題点を数字で表現]",
        "課題 2: [現状とあるべき姿のギャップ]",
        "課題 3: [なぜ今すぐ対処が必要か]",
    ])

# --- Slide 3: 数字インパクト ---
make_number_slide(prs,
    number="XX%",
    label="[インパクトを示す指標]",
    context="出典: [調査名・年] / 対象: [対象範囲]")

# --- Slide 4: セクション区切り ---
make_section_divider(prs, "01", "提案の核心")

# --- Slide 5: 提案概要 ---
make_content_slide(prs,
    title="提案の核心",
    subtitle="ConsultingOS AIエージェントによる高品質・高速納品",
    bullets=[
        "① [施策1: 具体的な内容と期待効果]",
        "② [施策2: 具体的な内容と期待効果]",
        "③ [施策3: 具体的な内容と期待効果]",
    ])

# --- Slide 6: 3カラム比較 ---
make_3col_slide(prs,
    title="比較・オプション概要",
    cols=[
        {"title": "オプション A",  "items": ["特徴1", "特徴2", "単価: XX万円"]},
        {"title": "オプション B ★推奨", "items": ["特徴1", "特徴2", "単価: XX万円"]},
        {"title": "オプション C",  "items": ["特徴1", "特徴2", "単価: XX万円"]},
    ])

# --- Slide 7: ロードマップ ---
make_roadmap_slide(prs,
    title="実行ロードマップ",
    phases=[
        {"label": "Phase 1", "period": "〜1ヶ月",
         "actions": ["ヒアリング", "現状分析", "方針決定"]},
        {"label": "Phase 2", "period": "〜3ヶ月",
         "actions": ["施策実行", "中間計測", "改善"]},
        {"label": "Phase 3", "period": "〜6ヶ月",
         "actions": ["スケール", "継続改善", "成果報告"]},
    ])

# --- Slide 8: 期待効果 ---
make_number_slide(prs,
    number="+XX%",
    label="[期待できる成果指標]",
    context="[達成条件・前提・期間]",
    dark=False)

# --- Slide 9: 投資対効果 ---
make_content_slide(prs,
    title="投資対効果（ROI試算）",
    bullets=[
        "初期投資:   [金額]",
        "月次コスト: [金額]",
        "期待リターン: [金額]（ROI XX倍）",
        "投資回収期間: [XX ヶ月]",
    ])

# --- Slide 10: Call to Action ---
make_cta_slide(prs,
    main_text="まず1週間、無料で試してみませんか？",
    contact="📧  your@email.com  ｜  📞  0X0-XXXX-XXXX")

# ============================================================
# §5 保存・完了確認
# ============================================================
prs.save(OUTPUT_PATH)
print(f"\n✅ PPT生成完了")
print(f"   ファイル: {OUTPUT_PATH}")
print(f"   スライド数: {len(prs.slides)} 枚")
print(f"   日本語フォント: {FONT_JP}")
print(f"   中国語フォント混入防止: <a:ea> タグ設定済み ✅")
```

### Step 4: スクリプトを実行

```bash
pip install python-pptx -q 2>/dev/null || pip install python-pptx
python3 /tmp/generate_ppt.py
```

### Step 5: カスタマイズして再生成

ユーザーの内容（テーマ・数字・具体的な文章）をスクリプトの§4に組み込んで再実行。
`[ここにタイトル]` などのプレースホルダーを全て実データで置き換える。

### Step 6: ファイルの場所を通知

```
生成ファイル: /tmp/output_presentation.pptx
ダウンロード: プロジェクトフォルダにコピーして開く
```

---

## デザインバリエーション

| スタイル | 設定 | 用途 |
|---|---|---|
| ダークネイビー（デフォルト） | `dark=True` | 提案書・ピッチデック |
| ホワイト | `dark=False` | 社内報告・進捗報告 |
| ブランドカラー | `C_ACCENT` を変更 | クライアント合わせ |

---

## よくある失敗と対策

| 問題 | 原因 | 対策 |
|---|---|---|
| 文字が中国語フォントに見える | `<a:ea>` タグ未設定（最頻出） | `_apply_jp_font(run)` で `<a:ea>` を明示設定 |
| 日本語が □□□（豆腐）になる | フォント未インストール | `apt-get install fonts-noto-cjk` 後に再実行 |
| テキストがシェイプ上部に偏る | vertical_anchor 未設定 | `tf.vertical_anchor = MSO_ANCHOR.MIDDLE` を追加 |
| テキストがはみ出る | フォントサイズ過大 | `Pt()` を小さくするか `tf.word_wrap = True` を確認 |
| python-pptxが入っていない | 未インストール | `pip install python-pptx` |

---

## 参照スキル

- `.claude/skills/ppt-presentation.md` — デザインルール・日本語品質・ジョブズ原則
- `.claude/agents/consulting/proposal-writer.md` — 提案書の論理構成
