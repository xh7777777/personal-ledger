<script setup>
defineProps({
  ledger: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <section class="view">
    <div class="panel">
      <div class="section-heading">
        <div>
          <h2>定时记账</h2>
          <p>按固定频率自动生成收入或支出流水</p>
        </div>
        <button class="secondary-button" @click="ledger.openScheduleModal()">新增定时</button>
      </div>
      <div v-if="!ledger.scheduleRows.length" class="empty-state compact">还没有定时记账规则</div>
      <div v-else class="schedule-grid">
        <article v-for="schedule in ledger.scheduleRows" :key="schedule.id" class="schedule-card" :class="{ 'is-paused': !schedule.active }">
          <div class="schedule-card-top">
            <div>
              <div class="schedule-title">
                <span class="category-icon-badge" :class="`tone-${schedule.categoryMeta.tone}`">{{ schedule.categoryMeta.icon }}</span>
                <span>{{ schedule.categoryMeta.name }}</span>
              </div>
              <div class="schedule-meta">{{ schedule.frequencyLabel }} · {{ schedule.accountName }}</div>
            </div>
            <span class="schedule-status" :class="{ 'is-active': schedule.active }">{{ schedule.active ? "启用" : "暂停" }}</span>
          </div>
          <div class="schedule-amount" :class="schedule.type === 'income' ? 'positive' : 'negative'">
            {{ schedule.type === "income" ? "+" : "-" }}{{ ledger.money(schedule.amount) }}
          </div>
          <div class="schedule-detail">
            <span>下次 {{ schedule.nextRunDate }}</span>
            <span v-if="schedule.target">{{ schedule.target }}</span>
          </div>
          <div class="schedule-actions">
            <button class="text-button" @click="ledger.openScheduleModal(schedule)">编辑</button>
            <button class="text-button" @click="ledger.toggleSchedule(schedule.id, !schedule.active)">{{ schedule.active ? "暂停" : "启用" }}</button>
            <button class="text-button delete" @click="ledger.deleteSchedule(schedule.id)">删除</button>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
