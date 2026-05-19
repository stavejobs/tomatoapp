<template>
  <div class="home">
    <Timer />
    <div class="plans-section">
      <h2>计划清单</h2>
      <PlanForm @add="addPlan" />
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="{ active: currentTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>
      <PlanList
        :plans="filteredPlans"
        :loading="loading"
        :now="now"
        @toggle="togglePlan"
        @delete="deletePlan"
      />
    </div>
    <ReminderDialog
      :expired-plans="expiredPlans"
      @dismiss="onDismissReminder"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import Timer from '@/components/Timer.vue'
import PlanForm from '@/components/PlanForm.vue'
import PlanList from '@/components/PlanList.vue'
import ReminderDialog from '@/components/ReminderDialog.vue'
import { usePlans } from '@/composables/usePlans'

const {
  plans, loading, now,
  hasExpired, expiredPlans,
  fetchPlans, addPlan, togglePlan, deletePlan,
  refreshCountdowns, startCountdown, stopCountdown, formatCountdown
} = usePlans()

const tabs = [
  { key: null, label: '全部' },
  { key: 'daily', label: '当天' },
  { key: 'weekly', label: '本周' },
  { key: 'monthly', label: '本月' },
  { key: 'longterm', label: '长期' }
]

const currentTab = ref(null)

const filteredPlans = computed(() => {
  if (!currentTab.value) return plans.value
  return plans.value.filter(p => p.type === currentTab.value)
})

function switchTab(key) {
  currentTab.value = key
  fetchPlans(key)
}

function onDismissReminder() {
}

onMounted(() => {
  fetchPlans()
  startCountdown()
})

onUnmounted(() => {
  stopCountdown()
})

watch(now, () => {
  refreshCountdowns()
})
</script>

<style scoped>
.home {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.plans-section {
  padding: 1rem;
}

.tabs {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.tabs button {
  padding: 0.4rem 0.8rem;
  background: rgba(255,255,255,0.08);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.tabs button.active {
  background: rgba(255,255,255,0.2);
  border-color: rgba(255,255,255,0.4);
}

.tabs button:hover {
  background: rgba(255,255,255,0.15);
}

@media (max-width: 768px) {
  .home {
    grid-template-columns: 1fr;
  }
}
</style>
