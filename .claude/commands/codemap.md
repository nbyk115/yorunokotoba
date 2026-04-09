---
name: codemap
description: コードベースの構造マップを自動生成・更新して .claude/codemap.md に保存する。「コードマップ作って」「プロジェクト構造を把握したい」「ディレクトリ構造まとめて」「どこに何があるか整理して」と言われたとき。ディレクトリ構造・主要モジュール・依存関係・APIエンドポイントを出力。
effort: low
context: fork
agent: Explore
allowed-tools: Read Grep Glob Bash(find *) Bash(ls *) Write
---

## プロジェクト基本情報（自動取得）
- ルートファイル: !`ls -la 2>/dev/null | head -30`
- package.json name/version: !`cat package.json 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'name: {d.get(\"name\",\"?\")}  version: {d.get(\"version\",\"?\")}  main: {d.get(\"main\",\"?\")}')  " 2>/dev/null`
- Gitブランチ: !`git branch --show-current 2>/dev/null`

# /codemap — コードマップ自動生成・更新

プロジェクトのコードベースを分析し、ナビゲーション用のマップを生成・更新してください。

## 生成内容

### 1. ディレクトリ構造（深さ3まで）
```
src/
  ├── components/
  │   ├── ui/
  │   └── features/
  ├── lib/
  └── app/
```

### 2. 主要モジュール一覧
| ファイル | 役割 | 主要export |
|---|---|---|

### 3. 依存関係グラフ（テキスト形式）
- エントリポイント → 主要モジュールの呼び出し関係

### 4. API エンドポイント一覧（あれば）
| メソッド | パス | ハンドラ |
|---|---|---|

## 出力先
`.claude/codemap.md` に保存する（既存なら上書き更新）

## 注意
- node_modules, .next, dist, __pycache__ は除外
- 巨大ファイルは先頭のexport部分のみ読み取る
- コンテキストを消費しすぎないよう、概要レベルに留める
