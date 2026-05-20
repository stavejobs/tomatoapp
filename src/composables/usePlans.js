import { ref, computed } from 'vue'

const PLAN_COLORS = {
  daily: '#FF6B6B',
  weekly: '#4ECDC4',
  monthly: '#45B7D1',
  longterm: '#96CEB4'
}

function getRemainingSeconds(expiresAt) {
  if (!expiresAt) return null
  const diff = new Date(expiresAt).getTime() - Date.now()
  return Math.max(0, Math.floor(diff / 1000))
}

function formatCountdown(seconds) {
  if (seconds === null || seconds === undefined) return null
  if (seconds <= 0) return null
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}小时${mins}分`
  return `${mins}分`
}

export function usePlans() {
  const plans = ref([])
  const loading = ref(false)
  const currentType = ref(null)
  const now = ref(Date.now())

  let countdownTimer = null

  function startCountdown() {
    if (countdownTimer) return
    countdownTimer = setInterval(() => {
      now.value = Date.now()
    }, 1000)
  }

  function stopCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }

  const hasExpired = computed(() => {
    return plans.value.some(p => p.expired || (
      p.expires_at && !p.completed && new Date(p.expires_at).getTime() <= Date.now()
    ))
  })

  const expiredPlans = computed(() => {
    return plans.value.filter(p => p.expired || (
      p.expires_at && !p.completed && new Date(p.expires_at).getTime() <= Date.now()
    ))
  })

  async function fetchPlans(type = null) {
    loading.value = true
    currentType.value = type
    try {
      const url = type ? `/api/plans?type=${type}` : '/api/plans'
      const res = await fetch(url)
      const data = await res.json()
      plans.value = data.map(p => ({
        ...p,
        countdown: p.expires_at ? getRemainingSeconds(p.expires_at) : null
      }))
      if (plans.value.some(p => p.expires_at && !p.completed)) {
        startCountdown()
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error)
    } finally {
      loading.value = false
    }
  }

  async function addPlan(content, type) {
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          type,
          color: PLAN_COLORS[type]
        })
      })
      const newPlan = await res.json()
      plans.value.unshift({
        ...newPlan,
        expired: false,
        countdown: newPlan.expires_at ? getRemainingSeconds(newPlan.expires_at) : null
      })
      if (newPlan.expires_at) startCountdown()
    } catch (error) {
      console.error('Failed to add plan:', error)
    }
  }

  async function togglePlan(id) {
    try {
      const res = await fetch(`/api/plans/${id}`, { method: 'PATCH' })
      if (!res.ok) throw new Error('Toggle failed')
      const plan = plans.value.find(p => p.id === id)
      if (plan) {
        plan.completed = !plan.completed
        plan.reminded = 0
      }
    } catch (error) {
      console.error('Failed to toggle plan:', error)
    }
  }

  async function deletePlan(id) {
    try {
      const res = await fetch(`/api/plans/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      plans.value = plans.value.filter(p => p.id !== id)
    } catch (error) {
      console.error('Failed to delete plan:', error)
    }
  }

  function refreshCountdowns() {
    plans.value = plans.value.map(p => ({
      ...p,
      countdown: p.expires_at ? getRemainingSeconds(p.expires_at) : null
    }))
  }

  return {
    plans,
    loading,
    currentType,
    now,
    hasExpired,
    expiredPlans,
    fetchPlans,
    addPlan,
    togglePlan,
    deletePlan,
    refreshCountdowns,
    startCountdown,
    stopCountdown,
    formatCountdown,
    PLAN_COLORS
  }
}
