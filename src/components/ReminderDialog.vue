<template>
  <Teleport to="body">
    <div v-if="visible" class="overlay" @click.self="dismiss">
      <div class="dialog">
        <h3>未完成的计划提醒</h3>
        <p>以下计划已过期但尚未完成：</p>
        <ul>
          <li v-for="plan in expiredPlans" :key="plan.id" class="expired-item">
            <span>{{ plan.content }}</span>
            <span class="expired-type">{{ getTypeLabel(plan.type) }}</span>
          </li>
        </ul>
        <div class="actions">
          <button @click="dismiss" class="btn-secondary">我知道了</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  expiredPlans: { type: Array, default: () => [] }
})

const emit = defineEmits(['dismiss'])

const visible = ref(false)

const TYPE_LABELS = {
  daily: '当天',
  weekly: '本周',
  monthly: '本月',
  longterm: '长期'
}

function getTypeLabel(type) {
  return TYPE_LABELS[type] || type
}

function dismiss() {
  visible.value = false
  emit('dismiss')
}

watch(() => props.expiredPlans.length, (len) => {
  if (len > 0) visible.value = true
}, { immediate: true })
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 2rem;
  max-width: 480px;
  width: 90%;
  color: #fff;
}

.dialog h3 {
  margin: 0 0 0.5rem;
  color: #ff9800;
}

.dialog p {
  margin: 0 0 1rem;
  opacity: 0.8;
  font-size: 0.9rem;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem;
}

.expired-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.expired-type {
  font-size: 0.75rem;
  padding: 0.15rem 0.4rem;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.btn-secondary {
  padding: 0.5rem 1.5rem;
  background: rgba(255,255,255,0.15);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.25);
}
</style>
