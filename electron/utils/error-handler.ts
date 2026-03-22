export function serializeError(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  if (err && typeof err === 'object') {
    const e = err as any
    return e.message || e.error_description || e.hint || JSON.stringify(e)
  }
  return 'Unknown error'
}
