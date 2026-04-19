/**
 * Lab 3 の可視化ツリー構造とビルダー。
 *
 * Tree は Root → 子ノード 複数 の静的構造を持ち、各ノードには:
 *   - id: 一意識別子（render 回数の集計キー）
 *   - label: 画面表示用ラベル（A, B, C, ...）
 *   - memo: memo 化されているか（props 変更で止まれるか）
 *   - children: 子ノード
 * が入る。
 *
 * docs/08 §8.2 のチュートリアルステップ (depth 1〜5, 子 1〜5) に対応できるよう、
 * 「深さと各層の子数」だけ指定すれば木を組み立てられる buildTree ヘルパを提供する。
 */

export type TreeNode = {
  id: string
  label: string
  /** memo 化されているか。true なら同一 props で再 render を止められる */
  memo: boolean
  children: TreeNode[]
}

export type TreeSpec = {
  /** ルートを除く深さ。1〜5 */
  depth: number
  /** 各層の子ノード数。1〜5 */
  fanout: number
  /** memo を有効化するノード ID の Set。省略時は全ノード memo なし */
  memoIds?: ReadonlySet<string>
}

const LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

/**
 * 深さ・fanout 指定から木を組み立てる。
 * id は深さ優先の連番（A1, A2, A2-1, A2-2 …）。memoIds に含まれる ID は memo=true になる。
 */
export function buildTree(spec: TreeSpec): TreeNode {
  const depth = Math.min(5, Math.max(1, Math.floor(spec.depth)))
  const fanout = Math.min(5, Math.max(1, Math.floor(spec.fanout)))
  const memoIds = spec.memoIds ?? new Set<string>()

  let counter = 0
  const nextId = (): string => {
    const idx = counter++
    const letter = LABELS[idx % LABELS.length] ?? 'X'
    const generation = Math.floor(idx / LABELS.length)
    return generation === 0 ? letter : `${letter}${generation}`
  }

  const build = (level: number): TreeNode[] => {
    if (level >= depth) return []
    const nodes: TreeNode[] = []
    for (let i = 0; i < fanout; i++) {
      const id = nextId()
      nodes.push({
        id,
        label: id,
        memo: memoIds.has(id),
        children: build(level + 1),
      })
    }
    return nodes
  }

  return {
    id: 'ROOT',
    label: 'Root',
    memo: memoIds.has('ROOT'),
    children: build(0),
  }
}

/** 木を深さ優先で走査して全ノード id を返す。UI のセレクタ/統計初期化で使う */
export function collectIds(tree: TreeNode): string[] {
  const out: string[] = []
  const walk = (n: TreeNode) => {
    out.push(n.id)
    for (const c of n.children) walk(c)
  }
  walk(tree)
  return out
}
