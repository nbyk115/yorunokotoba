---
description: 動画クリエイティブパイプライン skill。Higgsfield Supercomputer 統合運用、creative 5 名 orchestration + 動画 vertical 対応。TikTok / UGC / 広告 / SNS 動画案件で起動。
---

# video-creative-pipeline: 動画クリエイティブ統合パイプライン

## 用途

動画クリエイティブ案件 (TikTok / UGC / 広告 / SNS リール / VSL / プロモ動画) で creative チームを動画特化モードで起動。Higgsfield Supercomputer + Hyperframes (HeyGen) + Video Use 等のツールを段階選定、creative 5 名 orchestration を動画 vertical へ拡張。

## 起動条件

ユーザーが以下を発言した時:
- 「動画作って」「TikTok 作って」「広告動画作って」「SNS 動画」「リール作って」
- 「UGC バリエーション生成」「1 週間分の動画」「VSL 制作」
- 関根さん N&Y Craft Phase 2-3 = クラフトビール業界 TikTok / UGC 展開

## 動画クリエイティブ 6 段階パイプライン

### Phase 1: ブリーフ設計 (creative-director + proposal-writer)

YOU MUST: 動画制作着手前に必ず以下を定義:
1. ターゲット (ICP.md 参照、関根さん N&Y Craft の場合はクラフトビール購入層)
2. プラットフォーム (TikTok / Instagram Reels / YouTube Shorts / X / LP 埋込)
3. 動画タイプ (UGC / 広告 / 商品紹介 / ブランドストーリー / VSL)
4. 尺・本数・バリエーション数
5. ブランド一貫性要件 (DESIGN.md §12 参照ライブラリ + brand-guidelines.md)

「ブリーフは第一のクリエイティブ行為」(Colleen DeCourcy、PR #148) を遵守、AI 増幅前のブリーフ品質確保。

### Phase 2: 参照ライブラリ query (ux-designer)

DESIGN.md §12 で動画リファレンス 3-5 件取得:
- 競合動画 (同業界 TikTok / SNS)
- 参照すべきトーン / 構成 / 演出パターン
- アンチパターン (既存動画 50 万再生されてないものの理由)

参照ゼロでブリーフ出すと visual ループ 30+ ラウンド同型リスク (DESIGN.md §12 規律)。

### Phase 3: ツール選定 (creative-director)

動画タイプ別ツール選定マトリクス:

| 動画タイプ | 推奨ツール | 理由 |
|---|---|---|
| TikTok / UGC 量産 (10 本以上) | Higgsfield Supercomputer | auto モデル選定 + 1 チャット完結、商用 OK |
| ブランド統一 SNS 動画 (5-20 本/週) | Higgsfield Skills (`/brand-pipeline`) | カスタムワークフロー再利用、チーム共有 |
| シネマティック広告 | Higgsfield (`/cinematic`) + Veo / Kling auto | 高品質シーン構築 |
| VSL (動画セールスレター) | Hyperframes (HeyGen / Apache 2.0) | HTML + GSAP で決定論レンダリング |
| モーショングラフィックス | Hyperframes + Puppeteer pipeline | CI 親和性高 |
| 既存素材編集 (mp4 → 完成版) | Video Use | アセットフォルダ→完成 mp4 自動編集 |
| 静止画ベース動画 (Ken Burns 等) | Hyperframes or html2pdf 派生 | 軽量 / プログラマブル |
| 長編動画 → クリップ抽出 + 投稿 (2026-05-15 追加) | VugolaAI.com MCP (有料推定 INFERENCE) or louisedesadele 系 OSS (無料、github.com/louisedesadele...、INFERENCE 一次出典 URL truncated) | Claude Opus 4.7 経由で長編分析 + クリップ抽出 + キャプション + スケジュール投稿、関根さん Phase 2-3 で醸造工程動画 → TikTok 切り出しに直接適用 |

YOU MUST: ツール選定根拠を 1-2 行で明示 (例: 「TikTok 10 本量産 → Higgsfield Supercomputer、auto モデル選定 + 商用 OK」)。

クリップ抽出 MCP 採用判定 (Boris #3):
- 即インストール禁止
- 関根さん Phase 2-3 (TikTok / UGC 展開時) で実需確認後
- OSS 版 (無料) を優先評価、有料版 (VugolaAI) は OSS で不足時のみ
- legal-compliance-checker: 動画素材の著作権 / 肖像権 / プラットフォーム規約検証必須
- AI ガードレール 3 層 (PR #150) + Tom Griffiths 8 条件 (PR #148) 全件遵守

### Phase 4: 生成・実装 (frontend-dev or sales-deck-designer)

選定ツールで生成実行:
- Higgsfield: 自然言語プロンプト「{ブランド}の{動画タイプ}を{尺}本、{プラットフォーム}向けに、{トーン}で作って」
- Hyperframes: `npx skills add heygen-com/hyperframes` 経由、HTML + CSS + GSAP コード生成
- Video Use: アセットフォルダ準備 → ツール起動

生成中に Tom Griffiths 8 条件 (PR #148) 全件満たすか機械検証:
1. 予算上限 (Higgsfield のコスト見積もり承認制活用)
2. 成果境界値 (ブランド規律遵守)
3. 戦略制約 (ICP.md + プラットフォーム規約)
4. 説明可能性 (Higgsfield プラン作成可視化)
5. 監査可能性 (生成ログ保存)
6. ロールバック (前バージョン保持)
7. 学習閾値 (Skills として保存、次回再利用)
8. エスカレーション (品質基準未達時は人間レビュー)

### Phase 5: 検証 (brand-guardian)

動画特有のブランド規律検証:
1. ブランドカラー / フォント一致 (DESIGN.md 準拠)
2. ロゴ表示位置・サイズ
3. 音楽 / ナレーション (ElevenLabs MCP 候補) のトーン一致
4. 字幕の日本語字形 (ハードルール 10: Noto Sans JP / Yu Gothic / Hiragino)
5. プラットフォーム規約準拠 (TikTok / Instagram のガイドライン)

未達時は Phase 3-4 へ差し戻し、ルーブリック明示 skill (PR #160) で 80 点未満時の具体的修正指示自動生成。

### Phase 6: 配信・運用 (creative-director レビュー + client-success)

- 配信スケジュール設定 (関根さん N&Y Craft の場合は週次)
- パフォーマンス計測 (再生数 / エンゲージメント / コンバージョン)
- A/B テストバリエーション準備
- 成功パターンの Skills 化 (Higgsfield Skills の slash command 保存)

## creative 5 名 orchestration (動画 vertical 拡張)

| agent | 動画パイプラインでの責務 |
|---|---|
| creative-director | Phase 1 ブリーフ設計 + Phase 3 ツール選定 + Phase 6 レビュー |
| ux-designer | Phase 2 参照ライブラリ query + 情報設計 |
| frontend-dev or sales-deck-designer | Phase 4 生成・実装 |
| brand-guardian | Phase 5 検証 (動画特有 5 軸機械検証) |
| content-strategist | Phase 1-2 補助 (スクリプト / ナレーション設計) |

## Higgsfield Supercomputer 30+ ツール統合との連携

- Slack 自動投稿: 動画完成後の通知
- Google Drive 自動保存: 指定フォルダへの納品
- Notion 企画書読み込み: ブリーフ自動生成
- Figma デザイン参照: 動画スタイル決定

YOU MUST: ConsultingOS 既存 MCP (Figma / GitHub) と Higgsfield 30+ ツール統合の重複を CLAUDE.md §4 (MCP 最大 5-6) と整合確認、追加 MCP は実需確認後 (Boris #3)。

## 関根さん N&Y Craft Phase 2-3 適用パス

Phase 1 業務 OS 構築完了後、Phase 2-3 で動画クリエイティブ展開候補:
- クラフトビール製造工程 TikTok シリーズ (10-20 本)
- 商品紹介 UGC バリエーション (100 種)
- ブランドストーリー Instagram Reels (週次)
- 醸造家インタビュー YouTube Shorts

実需発生時に本 skill 起動、Higgsfield Supercomputer + Hyperframes 併用候補。

## ConsultingOS 自己診断

| 軸 | 適用度 |
|---|---|
| 動画クリエイティブパイプライン明示 | 強 (本 skill で物理化) |
| creative 5 名 orchestration 動画拡張 | 強 |
| Higgsfield Supercomputer 連携 | 強 (起動条件 + 6 Phase 明示) |
| 既存 Tom Griffiths 8 条件 + ルーブリック | 強 (PR #148 + #160 連動) |
| 関根さん Phase 2-3 適用パス | 強 |

## 関連参照

- 出典: Higgsfield Supercomputer 2026-05-13 release (INFERENCE)
- 関連 skill: creative-playbook / aeo-playbook / output-quality-rubrics (PR #160) / consulting-playbook-agentic-advertising-foundry-nyc (PR #148)
- 関連 agent: creative-director / ux-designer / frontend-dev / sales-deck-designer / brand-guardian / content-strategist
- 関連: DESIGN.md §12 / brand-guidelines.md / Hyperframes (HeyGen)

## 反証チェック (Step 1-4 圧縮)

- Step 1: Higgsfield 機能詳細は INFERENCE (ユーザー提示テキスト経由) / 6 Phase パイプラインは assistant 構築 INFERENCE
- Step 2: 既存 creative 5 名 orchestration (PR #139) + Tom Griffiths 8 条件 (PR #148) + ルーブリック (PR #160) + DESIGN.md §12 と整合
- Step 3: 本 skill は次回動画案件で実機検証、関根さん Phase 2-3 適用パス物理化
- Step 4 リスク即潰し: 「動画クリエイティブ案件発生時の判断遅延」リスクは 6 Phase パイプライン + ツール選定マトリクスで構造的回避
