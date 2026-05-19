<template>
  <div class="plan-list">
    <div v-if="loading">加载中...</div>
    <div v-else-if="plans.length === 0" class="empty">暂无计划</div>
    <div v-else>
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="plan-item"
        :style="{ borderLeft: `4px solid ${plan.color}` }"
        :class="{ completed: plan.completed, expired: isExpired(plan) }"
      >
        <input
          type="checkbox"
          :checked="plan.completed"
          @change="$emit('toggle', plan.id)"
        />
        <span class="plan-content">{{ plan.content }}</span>
        <span class="plan-type">{{ getTypeLabel(plan.type) }}</span>
        <span v-if="isExpired(plan)" class="expired-tag">已过期</span>
        <span v-else-if="plan.countdown && plan.countdown > 0 && !plan.completed" class="countdown">
          {{ formatCountdownText(plan.countdown) }}
        </span>
        <button @click="$emit('delete', plan.id)" class="delete-btn">删除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  plans: Array,
  loading: Boolean,
  now: { type: Number, default: 0 }
})

defineEmits(['toggle', 'delete'])

const TYPE_LABELS = {
  daily: '当天',
  weekly: '本周',
  monthly: '本月',
  longterm: '长期'
}

function getTypeLabel(type) {
  return TYPE_LABELS[type] || type
}

function isExpired(plan) {
  if (plan.completed) return false
  if (plan.expired) return true
  if (plan.expires_at) {
    return new Date(plan.expires_at).getTime() <= Date.now()
  }
  return false
}

function formatCountdownText(seconds) {
  if (!seconds || seconds <= 0) return ''
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}时${mins}分`
  return `${mins}分`
}
</script>

<style scoped>
.plan-list {
  margin-top: 1rem;
}

.plan-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
}

.plan-item.completed .plan-content {
  text-decoration: line-through;
  opacity: 0.6;
}

.plan-item.expired {
  background: rgba(255, 68, 68, 0.1);
}

.plan-content {
  flex: 1;
}

.plan-type {
  font-size: 0.8rem;
  padding: 0.2rem 0.5rem;
  background: rgba(0,0,0,0.1);
  border-radius: 3px;
}

.countdown {
  font-size: 0.8rem;
  color: #ff9800;
  white-space: nowrap;
}

.expired-tag {
  font-size: 0.8rem;
  color: #ff4444;
  font-weight: bold;
  white-space: nowrap;
}

.delete-btn {
  padding: 0.2rem 0.5rem;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.empty {
  text-align: center;
  padding: 2rem;
  opacity: 0.6;
}
</style>
