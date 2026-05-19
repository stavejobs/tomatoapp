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
  const { request, env } = context
  const { content, type, color, expires_at } = await request.json()

  const stmt = env.DB.prepare(
    'INSERT INTO plans (content, type, color, expires_at) VALUES (?1, ?2, ?3, ?4)'
  )
  const result = await stmt.bind(content, type, color, expires_at || null).run()

  const created = await env.DB.prepare('SELECT * FROM plans WHERE id = ?1')
    .bind(result.meta.last_row_id).first()

  return Response.json(created)
}
