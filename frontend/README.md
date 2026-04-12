# よるのことば Frontend (v9 Rebuild)

**Stack**: Vite 5 + React 18 + TypeScript 5
**Purpose**: Monolithic `index.html` (649KB/629行) の段階的再構築

## Development

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ に出力
npm run typecheck
```

## Phase Progress

- [x] **Phase 0**: 現状棚卸し (`backlog/rebuild/inventory.md`)
- [x] **Phase 1**: Vite + React + TS 初期化（本 PR）
- [ ] Phase 2: 純粋ロジック抽出 (`src/logic/*.ts`)
- [ ] Phase 3: Firebase 層分離 (`src/lib/*.ts`)
- [ ] Phase 4: UIコンポーネント分割
- [ ] Phase 5: スタイリング（tokens.css 経由）
- [ ] Phase 6: PWA + Service Worker
- [ ] Phase 7: Vercel デプロイ切替
- [ ] Phase 8: Self-Pentesting

## Directory Structure

```
frontend/
├── index.html              # Vite entry
├── vite.config.ts          # ビルド設定
├── tsconfig.json           # TS設定（strict mode）
├── src/
│   ├── main.tsx            # React root
│   ├── App.tsx             # ルートコンポーネント
│   ├── components/         # 共通UI
│   │   ├── ui/             # Card, Tag, ExpandText等
│   │   ├── navigation/     # BottomTabBar等
│   │   ├── onboarding/     # FtueOverlay等
│   │   └── fx/             # Particles等
│   ├── features/           # 機能単位
│   │   ├── dream/
│   │   ├── fortune/
│   │   ├── character/
│   │   ├── premium/
│   │   └── retention/
│   ├── logic/              # 純粋ロジック（副作用なし）
│   ├── lib/                # 副作用層（firebase/analytics/theme）
│   ├── styles/             # tokens.css, global.css
│   └── assets/             # base64画像等
└── public/                 # 静的アセット
```

## 互換性維持ルール

1. **Firebase config**: `src/lib/firebase.ts` 内の値は一字一句変更禁止
2. **localStorage keys**: `ynk_*` プレフィックスの全キーを保全
3. **VAPID key**: プッシュ通知のキーは変更禁止
4. **Service Worker**: 新バージョンは `cleanupOutdatedCaches` で旧SW自動削除

## Design Tokens

`src/styles/tokens.css` は `design/contracts/tokens.json` の写像です。
色・フォント・スペーシング・角丸を変更する場合は、まず `tokens.json` を更新し、
`scripts/design/validate.ts` を通過させてから本ファイルを更新してください。
