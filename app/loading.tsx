export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl items-center justify-center px-4 py-24">
      <div
        role="status"
        aria-label="読み込み中"
        className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary"
      />
    </div>
  )
}
