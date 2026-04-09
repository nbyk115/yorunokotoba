---
id: 20260327-2320_orchestrator_next-session
from: orchestrator
to: next-session
status: pending
priority: high
created: 2026-03-27T23:20:00
project: (ConsultingOS社内プロジェクト)
---

## タスク（1文）
ConsultingOS v2の運用フェーズを開始し、月次メンテナンス・実運用フィードバック収集・Claude.ai Project対応を進める。

## なぜこのタスクが必要か（背景）
2026-03-27のセッションでConsultingOS v2が完成した（34エージェント・36スキル・9コマンド）。
スキル10本の追加・14エージェントへの配線・グローバルシンボリックリンク同期まで完遂し、120点評価を達成した。
次フェーズは「作った」から「使い倒す」への移行であり、実運用での品質検証と継続メンテナンスが必要。

## インプット（今セッションの完成物）

### 追加スキル（10本・全グローバル同期済み）
| スキル | パス | 主な適用先 |
|---|---|---|
| humanizer-ja | `.claude/skills/humanizer-ja.md` | content-strategist, business-translator, brand-guardian, pr-communications, social-media-strategist |
| superpowers | `.claude/skills/superpowers.md` | tech-lead, fullstack-dev, ai-engineer |
| claude-health | `.claude/skills/claude-health.md` | orchestrator（月次） |
| planning-with-files | `.claude/skills/planning-with-files.md` | orchestrator, tech-lead, fullstack-dev |
| frontend-design | `.claude/skills/frontend-design.md` | frontend-dev, ux-designer, creative-director |
| verification-loop | `.claude/skills/verification-loop.md` | tech-lead, fullstack-dev, infra-devops |
| deep-research | `.claude/skills/deep-research.md` | competitive-analyst, market-researcher, global-journalist |
| playwright-skill | `.claude/skills/playwright-skill.md` | fullstack-dev, frontend-dev, infra-devops |
| security-scan | `.claude/skills/security-scan.md` | orchestrator, tech-lead |
| strategic-compact | `.claude/skills/strategic-compact.md` | orchestrator, 長時間タスク全般 |

### 更新エージェント（14本・参照スキル追加済み）
content-strategist / tech-lead / fullstack-dev / frontend-dev / competitive-analyst / market-researcher / global-journalist / business-translator / brand-guardian / pr-communications / ux-designer / creative-director / social-media-strategist / orchestrator

### グローバル同期状態
- `~/.claude/skills/` → 全36スキルへのシンボリックリンク ✅
- `~/.claude/agents/` → 全エージェントへのシンボリックリンク ✅
- 全リポジトリ・全ブランチでConsultingOSフル稼働 ✅

### ブランチ
`claude/consulting-os-multiagent-YS5GK`（最新コミット: 1a3ae49）

## 期待アウトプット
- 形式: 各タスクに応じる
- 分量: 継続的なメンテナンス
- 期限: 月次サイクル（次回: 2026-04-27）

## 成功基準
- [ ] claude-health を月次実行し、Critical項目ゼロを維持
- [ ] security-scan を月次実行し、グレードB以上を維持
- [ ] 実運用で発生したエージェント品質の問題をcore_memory.mdに記録
- [ ] Claude.ai Project用Custom Instructionsを作成（CLAUDE.md非対応環境への対応）
- [ ] everything-claude-codeから追加価値スキルを継続評価（quarterly）

## 参照スキル
- `claude-health.md` §4 診断実行プロセス（月次実行手順）
- `security-scan.md` §6 スキャンタイミング（月次実行）
- `strategic-compact.md` §4 コンテキスト最適化（長時間セッション管理）
- `planning-with-files.md` §2 ディレクトリ構造（複合タスク時）

## 制約
- エージェントファイルの大幅変更は反証モードDeepで事前検証してから実施
- 新スキル追加時は必ず `~/.claude/skills/` にシンボリックリンクを作成する
- グローバルCLAUDE.md（`/root/.claude/CLAUDE.md`）のスキル数カウントをプロジェクトと同期する
- `--dangerously-skip-permissions` は禁止

## 反証チェック結果（送り出し側: orchestrator）
- ✅ Step 1（自己反証）: ConsultingOS v2は「設計書」として完成。実運用品質は未検証。エージェント連携の実際の精度は動かしてみるまで不明。
- ✅ Step 2（構造反証）: スキル数カウント（プロジェクト36/グローバル37に1差）は確認済み。シンボリックリンクは手動作成のためgit管理外。新リポジトリ環境では再作成が必要。
- ✅ Step 3（実用反証）: Claude.ai Project環境ではCLAUDE.mdが読まれないため、ConsultingOSが機能しない。Custom Instructions対応が残課題。
- 🔺 残存リスク: ①実運用未検証 ②Claude.ai Project未対応 ③シンボリックリンクが環境依存（新マシンで再構築が必要）

## 引き継ぎ知見（重要）
1. **スキルを追加したら即シンボリックリンク**: `ln -s /home/user/yorunokotoba/.claude/skills/[name].md /root/.claude/skills/[name].md`
2. **everything-claude-codeは宝庫だが全取込不要**: ConsultingOS文脈で価値あるものだけ選定
3. **フェイクコマンドリスト（/plan等）に惑わされない**: 強さはプロセス設計にある
4. **グローバルの真のマスターはyorunokotoba/.claude/**: ここを更新すれば全環境に反映される
