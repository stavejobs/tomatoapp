export async function onRequestPatch(context) {
  const { request, env } = context
  const id = context.params.id

  const plan = await env.DB.prepare('SELECT * FROM plans WHERE id = ?1')
    .bind(id).first()

  if (!plan) return new Response('Not found', { status: 404 })

  const newCompleted = plan.completed ? 0 : 1
  const completedAt = newCompleted ? new Date().toISOString() : null

  await env.DB.prepare(
    'UPDATE plans SET completed = ?1, completed_at = ?2, reminded = 0 WHERE id = ?3'
  ).bind(newCompleted, completedAt, id).run()

  return new Response(null, { status: 204 })
}

export async function onRequestDelete(context) {
  const { env } = context
  const id = context.params.id

  await env.DB.prepare('DELETE FROM plans WHERE id = ?1').bind(id).run()

  return new Response(null, { status: 204 })
}
