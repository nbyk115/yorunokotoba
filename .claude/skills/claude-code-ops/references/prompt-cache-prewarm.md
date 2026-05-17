# Prompt Cache Prewarm 実装 (Anthropic 公式、2026-05-14)

`ai-engineer` + `tech-lead` + `infra-devops` + `client-success` 連携の TTFT (Time To First Token) 削減技術。PR #169 LLM 推論メカニクス §2 KV キャッシュの具体実装例。

出典: Anthropic 公式 platform.claude.com/docs/en/build-... (INFERENCE: ユーザー提示画像経由、URL truncated)。

## 1. 核心: Prompt Cache Prewarm

ユーザー要求到着前にシステムプロンプトを `max_tokens=0` で送信、Claude がキャッシュに書き込むが出力生成スキップ。実際のユーザー要求時に温まったキャッシュヒット = TTFT 大幅削減。

## 2. 実装コード (Anthropic 公式)

```python
# prewarm.py
client.messages.create(
    model="claude-opus-4-7",
    max_tokens=0,  # disable generation
    system=[{
        "type": "text",
        "text": BIG_SYSTEM_PROMPT,
        "cache_control": {"type": "ephemeral"},
    }],
    messages=[{"role": "user", "content": "."}],
)
```

## 3. TTFT 削減効果 (Anthropic 公式測定、FACT)

| システムプロンプトトークン | TTFT 削減率 |
|---|---|
| 20k | 4% |
| 40k | 18% |
| 80k | 34% |
| 160k | **52%** |

= 大規模プロンプトほど削減効果大、ConsultingOS 規模 (workflow.json + skills + CLAUDE.md + ICP.md + DESIGN.md 合算) で 80-160k 到達 = 34-52% 削減見込み。

## 4. ConsultingOS への適用パス

### 4.1 ConsultingOS BIG_SYSTEM_PROMPT 候補

| ファイル | トークン目安 (INFERENCE) |
|---|---|
| CLAUDE.md (17 hard rules) | ~5-10k |
| workflow.json (PR #149) | ~3-5k |
| ICP.md | ~2-5k |
| DESIGN.md (§12 含む) | ~10-15k |
| consulting-playbook.md (500 行) | ~15-20k |
| 関連 references 5-10 件 | ~30-50k |
| 関根さん N&Y Craft OEM ベースキット | ~20-40k |
| 合算 | **~85-145k** |

= 80-160k 帯、TTFT 削減 34-52% 見込み。

### 4.2 関根さん月次顧問契約への直接適用

運用コスト透明性レポート (PR #169 §6 関根さん適用パス) を強化:

| 項目 | Prewarm 前 | Prewarm 後 (見込み) |
|---|---|---|
| 初回応答時間 | 数秒〜10 秒 | 50% 短縮 (152k token 想定) |
| ユーザー体験 | 待ち時間あり | 体感速度向上 |
| コスト | プロンプトキャッシュ料金 (90% 削減維持) | 同様 |

### 4.3 段階導入 (Boris #3 遵守)

Phase 1 (本 PR): references skill 登録、関根さん Phase 1 構築前の準備

Phase 2 (関根さん Phase 1 着手時): 月次顧問セッション開始時に prewarm 自動化、TTFT 実測

Phase 3 (Phase 2 成功後): 水野さん v4 + 他案件展開、ConsultingOS 標準起動フローに組み込み

## 5. Claude Code セッション起動への適用

ConsultingOS Claude Code セッション起動時:

```bash
# 朝の最初のセッション起動前、prewarm 実行
python prewarm.py --files workflow.json,CLAUDE.md,DESIGN.md,consulting-playbook.md
# 数秒後、Claude Code 起動 → 温まったキャッシュ + 高速応答
```

= 関根さん週次レビュー / 水野さん v4 書き直し時の TTFT 削減で生産性向上。

## 6. 既存 ConsultingOS 規律との整合

| 軸 | 関係 |
|---|---|
| PR #169 LLM 推論メカニクス §2 KV キャッシュ | 本 references が具体実装例 |
| workflow.json (PR #149) bootstrap data | Prewarm 対象として活用、TTFT 削減 |
| Karpathy 12 ルール 6 トークン予算 (PR #138) | キャッシュヒット時はトークン削減 |
| AI ガードレール (PR #150) 個人レベル運用 | Prewarm はガードレール 8 条件 (予算上限) と整合 |

## 7. ICP 提案質問 99 件目追加

99. AI 駆動システムの起動時に Prompt Cache Prewarm を活用して TTFT を削減しているか、それとも毎回ゼロから起動して待ち時間を許容しているか

## 8. ConsultingOS 自己診断 (2026-05-14 時点)

| 軸 | 適用度 |
|---|---|
| KV キャッシュ最大活用 | 強 (PR #169 §2) |
| Prompt Cache 設定 | 強 (cache_control ephemeral 既存) |
| Prewarm 自動化 | 弱 (本 PR Phase 1、Phase 2 で実装) |
| TTFT 実測 | 弱 (Phase 2 で関根さん Phase 1 構築時に実機検証) |
| 運用コスト透明性レポート | 中 (PR #169 で物理化、Prewarm で強化) |

## 9. 関連参照

- 出典: Anthropic 公式 platform.claude.com/docs/en/build-... (INFERENCE、URL truncated)
- 関連: LLM 推論メカニクス (PR #169) / workflow.json (PR #149) / Karpathy 12 ルール (PR #138) / AI ガードレール (PR #150)
- 関連 agent: ai-engineer + tech-lead + infra-devops + client-success

## 10. 反証チェック (Step 1-4 圧縮)

- Step 1: Anthropic 公式 docs は INFERENCE (URL truncated、本セッション fetch 未実施) / TTFT 削減率は公式測定 FACT / ConsultingOS トークン目安は INFERENCE
- Step 2: 既存 PR #169 + workflow.json + Karpathy + AI ガードレールと整合
- Step 3 実用反証: 段階導入 Phase 1-3 明示、Phase 2 で関根さん Phase 1 構築時に実機検証可能
- Step 4 リスク即潰し: 「Prewarm 形骸化」リスクは Phase 2 で関根さん月次顧問契約の TTFT 実測 + ROI 検証で構造的回避
