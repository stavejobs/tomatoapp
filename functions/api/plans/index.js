export async function onRequestGet(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const type = url.searchParams.get('type')

  await env.DB.prepare(
    "DELETE FROM plans WHERE completed = 1 AND expires_at IS NOT NULL AND expires_at <= datetime('now')"
  ).run()

  let query = 'SELECT *, CASE WHEN expires_at IS NOT NULL AND expires_at <= datetime(\'now\') AND completed = 0 THEN 1 ELSE 0 END as expired FROM plans'
  const params = []

  if (type) {
    query += ' WHERE type = ?1'
    params.push(type)
  }

  query += ' ORDER BY created_at DESC'

  const stmt = env.DB.prepare(query)
  const { results } = await stmt.bind(...params).all()

  return Response.json(results)
}

export async function onRequestPost(context) {
  const { env } = context
  const { content, type, color } = await context.request.json()

  const now = new Date()
  const created_at = formatSQLiteDate(now)
  const expires_at = calculateExpiresAt(type, now)

  const stmt = env.DB.prepare(
    'INSERT INTO plans (content, type, color, created_at, expires_at) VALUES (?1, ?2, ?3, ?4, ?5)'
  )
  const result = await stmt.bind(content, type, color, created_at, expires_at).run()

  const created = await env.DB.prepare('SELECT * FROM plans WHERE id = ?1')
    .bind(result.meta.last_row_id).first()

  return Response.json(created)
}

function formatSQLiteDate(date) {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  const h = String(date.getUTCHours()).padStart(2, '0')
  const min = String(date.getUTCMinutes()).padStart(2, '0')
  const s = String(date.getUTCSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}:${s}`
}

function calculateExpiresAt(type, date) {
  switch (type) {
    case 'daily':
      return formatSQLiteDate(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1)))
    case 'weekly':
      return formatSQLiteDate(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 8)))
    case 'monthly': {
      const m = date.getUTCMonth() + 1
      const y = date.getUTCFullYear()
      if (m === 12) return formatSQLiteDate(new Date(Date.UTC(y + 1, 0, 1)))
      return formatSQLiteDate(new Date(Date.UTC(y, m, 1)))
    }
    case 'longterm':
      return formatSQLiteDate(new Date(Date.UTC(date.getUTCFullYear() + 1, 0, 1)))
    default:
      return null
  }
}
