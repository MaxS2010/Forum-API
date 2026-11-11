export function getPostgresSqlState(error: unknown): string | undefined {
  const visited = new Set<object>();
  const pending: unknown[] = [error];

  while (pending.length > 0) {
    const current = pending.pop();
    if (!current || typeof current !== 'object' || visited.has(current)) continue;
    visited.add(current);

    if ('sqlState' in current && typeof current.sqlState === 'string') return current.sqlState;
    if ('cause' in current) pending.push(current.cause);
    if ('details' in current) pending.push(current.details);
  }

  return undefined;
}
