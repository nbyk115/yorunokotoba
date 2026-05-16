#!/usr/bin/env node
/**
 * Design Contracts Validator
 *
 * tokens.json と rules.json に基づいてプロジェクト全体を検証する。
 * 違反があればCIを失敗させる。
 *
 * 使い方:
 *   ts-node scripts/design/validate.ts
 *   npm run design:validate
 */

import * as fs from 'fs';
import * as path from 'path';

interface TokenValue {
  value: string;
  usage: string;
  why: string;
}

interface Tokens {
  version: string;
  colors: Record<string, Record<string, TokenValue>>;
  typography: Record<string, any>;
  spacing: { base: number; scale: number[] };
  radius: Record<string, number | string>;
}

interface Rule {
  id: string;
  severity: 'error' | 'warning' | 'info';
  category: string;
  description: string;
  detector: {
    type: 'regex' | 'playwright' | 'manual';
    pattern?: string;
    files?: string[];
    test?: string;
    note?: string;
  };
  fix: string;
  why: string;
}

interface Rules {
  version: string;
  rules: Rule[];
}

interface Violation {
  ruleId: string;
  severity: string;
  file: string;
  line: number;
  match: string;
  fix: string;
}

const CONTRACTS_DIR = path.resolve(__dirname, '../../design/contracts');
const PROJECT_ROOT = path.resolve(__dirname, '../..');

function loadTokens(): Tokens {
  const raw = fs.readFileSync(path.join(CONTRACTS_DIR, 'tokens.json'), 'utf-8');
  return JSON.parse(raw);
}

function loadRules(): Rules {
  const raw = fs.readFileSync(path.join(CONTRACTS_DIR, 'rules.json'), 'utf-8');
  return JSON.parse(raw);
}

function findFiles(root: string, patterns: string[]): string[] {
  const results: string[] = [];
  const extensions = patterns
    .map(p => p.replace('*.', ''))
    .filter(ext => ext.length > 0);

  function walk(dir: string) {
    // node_modules / VCS / ConsultingOS 内部 / ビルド成果物 / 静的アセットは検証対象外.
    // dist は生成物, public は docs/legal からの自動生成 html を含むため除外.
    if (
      dir.includes('node_modules') ||
      dir.includes('.git') ||
      dir.includes('.claude') ||
      dir.includes(`${path.sep}dist`) ||
      dir.includes(`${path.sep}public`)
    )
      return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).slice(1);
        if (extensions.includes(ext)) {
          results.push(fullPath);
        }
      }
    }
  }

  walk(root);
  return results;
}

function validateRegexRule(rule: Rule): Violation[] {
  const violations: Violation[] = [];
  if (!rule.detector.pattern) return violations;

  const regex = new RegExp(rule.detector.pattern, 'g');
  const patterns = rule.detector.files || ['*.html', '*.css', '*.tsx', '*.jsx', '*.ts', '*.js'];
  const files = findFiles(PROJECT_ROOT, patterns);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      const match = line.match(regex);
      if (match) {
        violations.push({
          ruleId: rule.id,
          severity: rule.severity,
          file: path.relative(PROJECT_ROOT, file),
          line: idx + 1,
          match: match[0],
          fix: rule.fix,
        });
      }
    });
  }

  return violations;
}

function main() {
  console.log('🎨 Design Contracts Validation\n');

  const tokens = loadTokens();
  const rules = loadRules();

  console.log(`✓ Loaded ${Object.keys(tokens.colors.light).length} light tokens`);
  console.log(`✓ Loaded ${rules.rules.length} rules\n`);

  const allViolations: Violation[] = [];

  for (const rule of rules.rules) {
    if (rule.detector.type === 'regex') {
      const violations = validateRegexRule(rule);
      allViolations.push(...violations);
    }
  }

  if (allViolations.length === 0) {
    console.log('✅ All design rules passed!');
    process.exit(0);
  }

  const errors = allViolations.filter(v => v.severity === 'error');
  const warnings = allViolations.filter(v => v.severity === 'warning');

  console.log(`❌ Found ${errors.length} errors, ${warnings.length} warnings\n`);

  for (const v of allViolations) {
    const icon = v.severity === 'error' ? '❌' : '⚠️';
    console.log(`${icon} [${v.ruleId}] ${v.file}:${v.line}`);
    console.log(`   Match: ${v.match}`);
    console.log(`   Fix:   ${v.fix}\n`);
  }

  process.exit(errors.length > 0 ? 1 : 0);
}

main();
