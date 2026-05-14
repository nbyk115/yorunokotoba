#!/usr/bin/env node
/**
 * sync-legal.mjs — docs/legal/*.md → frontend/public/legal/ 同期スクリプト.
 *
 * 法務文書の SSOT は project root の docs/legal/. frontend は公開用に
 * public/legal/ にコピーした md を fetch して表示する.
 * このスクリプトを prebuild に組込むことで、build 前に必ず同期される.
 *
 * 同期対象: tokushoho.md / terms.md / privacy.md
 * 除外: checkout-consent.md（UI 設計文書、公開不要）
 *
 * 処理内容:
 *   1. 「## 反証チェック」以降のセクションを除去（内部メタ情報）
 *   2. 改行を LF 正規化
 *   3. 末尾の余分な空行を整理
 *
 * 使い方:
 *   node scripts/sync-legal.mjs
 *   npm run build （prebuild で自動実行）
 *   npm run dev   （predev で自動実行）
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const SRC_DIR = resolve(ROOT, 'docs', 'legal');
const DST_DIR = resolve(__dirname, '..', 'public', 'legal');

const FILES = ['tokushoho.md', 'terms.md', 'privacy.md'];

/**
 * 内部メタ情報セクションを除去する.
 * - 「## 反証チェック」以降を削除（CRLF/LF/スペース差に耐性）
 * - 末尾の `---` 区切りや空行を整理
 */
function stripInternalMeta(text) {
  const normalized = text.replace(/\r\n/g, '\n');
  // 「## 反証チェック」前の `---` を含めて除去
  const cleaned = normalized.replace(
    /\n+---\s*\n+##\s*反証チェック[\s\S]*$/,
    '\n',
  );
  // 末尾の余分な空行・区切り線を整理
  return cleaned.replace(/(\n---\s*)+$/, '\n').replace(/\n{3,}$/, '\n\n');
}

async function sync() {
  if (!existsSync(SRC_DIR)) {
    console.error(`[sync-legal] source not found: ${SRC_DIR}`);
    process.exit(1);
  }
  await mkdir(DST_DIR, { recursive: true });

  let synced = 0;
  for (const file of FILES) {
    const src = resolve(SRC_DIR, file);
    const dst = resolve(DST_DIR, file);
    if (!existsSync(src)) {
      console.error(`[sync-legal] missing source: ${src}`);
      process.exit(1);
    }
    const raw = await readFile(src, 'utf8');
    const cleaned = stripInternalMeta(raw);
    await writeFile(dst, cleaned, 'utf8');
    synced += 1;
  }
  console.log(`[sync-legal] synced ${synced} files (内部メタ除去済み): ${FILES.join(', ')}`);
}

sync().catch((err) => {
  console.error('[sync-legal] failed', err);
  process.exit(1);
});
