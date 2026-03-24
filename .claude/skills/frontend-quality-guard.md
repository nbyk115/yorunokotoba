# Frontend Quality Guard — Reactフリーズ・バグ防御

## 概要
Claude Codeが生成するReact/Next.jsコードに頻発するフリーズ・クラッシュ・バグの
根本パターンと、それを防ぐ具体的な実装パターンを定義する。

**適用タイミング**: コードを書く**前**にこのスキルを参照し、
実装中に各パターンを意識してコードを生成すること。

---

## 🔴 フリーズ・クラッシュ原因 TOP7

### 1. useEffectの無限ループ（最頻出）

**症状**: ページが固まる / ブラウザタブが重くなる

```tsx
// ❌ 死のパターン: オブジェクト/配列を依存配列に入れる
useEffect(() => {
  fetchData(options) // optionsは毎回新しい参照
}, [options]) // → 毎レンダリングで再実行 → 無限ループ

// ❌ 死のパターン: stateをsetしながら依存配列に入れる
useEffect(() => {
  setData(transform(data)) // dataを読んでdataを更新
}, [data]) // → 無限ループ

// ✅ 正しいパターン: プリミティブ値か安定した参照のみ
useEffect(() => {
  fetchData(userId)
}, [userId]) // stringやnumberならOK

// ✅ 正しいパターン: useCallbackでメモ化
const stableOptions = useMemo(() => ({ limit: 10, page }), [page])
useEffect(() => {
  fetchData(stableOptions)
}, [stableOptions])
```

**実装前チェック**: useEffectの依存配列にオブジェクト・配列・関数を入れていないか？

---

### 2. 非同期処理のメモリリーク（クラッシュ原因）

**症状**: "Warning: Can't perform a React state update on unmounted component" → 実際はサイレントクラッシュ

```tsx
// ❌ 死のパターン: クリーンアップなし
useEffect(() => {
  fetchUserData(id).then(data => {
    setUser(data) // コンポーネントがアンマウント後も実行される
  })
}, [id])

// ✅ 正しいパターン: AbortController使用
useEffect(() => {
  const controller = new AbortController()

  fetchUserData(id, { signal: controller.signal })
    .then(data => setUser(data))
    .catch(err => {
      if (err.name !== 'AbortError') setError(err)
    })

  return () => controller.abort() // クリーンアップ必須
}, [id])

// ✅ React Query使用（最推奨）
const { data: user, isLoading, error } = useQuery({
  queryKey: ['user', id],
  queryFn: () => fetchUserData(id)
})
// → キャンセル・キャッシュ・再試行を自動処理
```

---

### 3. ErrorBoundary未設定（ホワイトアウト原因）

**症状**: どこかでエラーが起きると画面が真っ白になる

```tsx
// ❌ ErrorBoundaryなし → どこかでエラー → 画面全体がクラッシュ
export default function App() {
  return <Dashboard />
}

// ✅ ErrorBoundaryで包む
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>エラーが発生しました: {error.message}</p>
      <button onClick={resetErrorBoundary}>再試行</button>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Dashboard />
    </ErrorBoundary>
  )
}
```

**全ページのルートに必ず設置。複数機能は個別にも設置する。**

---

### 4. Suspenseなし非同期 → loading/error状態の未処理

**症状**: ローディング中にundefinedアクセス → クラッシュ

```tsx
// ❌ 死のパターン: ロード中を考慮しない
function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchUser(userId).then(setUser)
  }, [userId])

  return <div>{user.name}</div> // userがnullのときクラッシュ
}

// ✅ 3状態（loading/error/success）を必ず処理
function UserProfile({ userId }) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId)
  })

  if (isLoading) return <Skeleton />
  if (error) return <ErrorMessage error={error} />
  if (!user) return null

  return <div>{user.name}</div> // 安全
}
```

---

### 5. 過剰な再レンダリング（操作が重くなる）

**症状**: 入力フォームが遅い / スクロールがカクつく

```tsx
// ❌ 死のパターン: 子コンポーネントに毎回新しい関数を渡す
function Parent() {
  const [count, setCount] = useState(0)

  return (
    <ExpensiveChild
      onClick={() => setCount(c => c + 1)} // 毎レンダリングで新関数
      data={{ id: 1, name: 'foo' }} // 毎レンダリングで新オブジェクト
    />
  )
}

// ✅ useCallback + useMemo でメモ化
function Parent() {
  const [count, setCount] = useState(0)

  const handleClick = useCallback(() => setCount(c => c + 1), [])
  const data = useMemo(() => ({ id: 1, name: 'foo' }), [])

  return <ExpensiveChild onClick={handleClick} data={data} />
}

// ✅ 重いコンポーネントはmemo化
const ExpensiveChild = memo(function ExpensiveChild({ onClick, data }) {
  // ...
})
```

---

### 6. Next.js App Router固有のバグ

**症状**: ハイドレーションエラー / サーバー・クライアントの不一致

```tsx
// ❌ 死のパターン: Clientコンポーネントでサーバーデータを直接使う
'use client'
export default function Page() {
  // これはクライアントでのみ実行されるが、
  // サーバーと結果が異なるとハイドレーションエラー
  const time = new Date().toLocaleString()
  return <div>{time}</div>
}

// ✅ useEffectで遅延初期化
'use client'
export default function Page() {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    setTime(new Date().toLocaleString())
  }, [])

  return <div>{time ?? 'Loading...'}</div>
}

// ❌ Server ComponentにイベントハンドラーをPropsで渡す
// Server Component → Client Component の境界でシリアライズできない関数はNG

// ✅ 'use client' ディレクティブを正しく配置
// イベントハンドラーが必要なコンポーネントは必ず 'use client'
```

---

### 7. Stale Closure（古い値を参照し続ける）

**症状**: ボタンを押しても値が古い / setIntervalが正しく動かない

```tsx
// ❌ 死のパターン: クロージャがcountの古い値をキャプチャ
function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1) // 常にcount=0をキャプチャ → 永遠に1にしかならない
    }, 1000)
    return () => clearInterval(id)
  }, []) // 依存配列が空なので更新されない

  return <div>{count}</div>
}

// ✅ 関数形式のupdaterを使う
function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCount(prev => prev + 1) // 常に最新値を参照
    }, 1000)
    return () => clearInterval(id)
  }, []) // 依存配列が空でも安全

  return <div>{count}</div>
}
```

---

## 実装前チェックリスト（コードを書く前に確認）

```
新しいuseEffectを書く前:
- [ ] 依存配列にオブジェクト・配列・関数を直接入れていないか？
- [ ] 非同期処理にAbortControllerかReact Queryを使っているか？
- [ ] クリーンアップ関数(return)を書いたか？

新しいコンポーネントを書く前:
- [ ] loading / error / success の3状態を全て処理したか？
- [ ] ErrorBoundaryで包まれる場所に配置されるか？
- [ ] Server/Client Componentの境界を正しく設定したか？

パフォーマンスが懸念される場合:
- [ ] 子コンポーネントに渡す関数はuseCallbackで安定化したか？
- [ ] 子コンポーネントに渡すオブジェクトはuseMemoで安定化したか？
- [ ] 重い計算はuseMemoでメモ化したか？
```

---

## 必須パッケージ構成

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",    // 非同期状態管理（useEffectの代替）
    "react-error-boundary": "^4.0.0",     // ErrorBoundary（ホワイトアウト防止）
    "zod": "^3.0.0"                       // APIレスポンス・フォーム入力バリデーション
  }
}
```

**React Query + ErrorBoundary + Zodの3点セットが最低ライン。**
この3つがなければフリーズ・クラッシュは必ず起きる。

---

## API通信の標準パターン

```tsx
// ✅ 全APIコールの標準テンプレート
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['resource', id],          // キャッシュキー（idが変わると再フェッチ）
  queryFn: async () => {
    const res = await fetch(`/api/resource/${id}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return resourceSchema.parse(await res.json()) // Zodでバリデーション
  },
  staleTime: 5 * 60 * 1000,           // 5分間はキャッシュ使用
  retry: 2,                            // 失敗時2回リトライ
})

// ✅ Mutation（データ変更）の標準テンプレート
const mutation = useMutation({
  mutationFn: (payload: UpdatePayload) => updateResource(id, payload),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resource'] }),
  onError: (error) => toast.error(error.message),
})
```

---

## 反証チェック（実装後必須）

コード実装後に以下3点を確認:

```
【フリーズチェック】
1. このコンポーネントで無限レンダリングは起きないか？
   → useEffectの依存配列を全て確認
2. このコンポーネントがアンマウントされたらどうなるか？
   → 非同期処理のクリーンアップを確認
3. APIが失敗したときにホワイトアウトしないか？
   → error状態のハンドリングを確認
```

---

## 適用エージェント
- `service-dev/fullstack-dev` — フロントエンド実装全般
- `creative/frontend-dev` — UI実装
- `service-dev/tech-lead` — コードレビュー時の品質基準
