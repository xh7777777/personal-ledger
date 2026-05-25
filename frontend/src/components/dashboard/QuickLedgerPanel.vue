<script setup>
import { categoryPresets, defaultCategory } from "../../constants/ledger";

defineProps({
  ledger: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <section class="panel quick-ledger-panel">
    <div class="section-heading">
      <div>
        <h2>快速记账</h2>
        <p>输入金额后立即保存，模板可一键填充</p>
      </div>
      <button class="ghost-button" @click="ledger.exportLedger()">导出账本</button>
    </div>
    <form class="quick-ledger-form" @submit.prevent="ledger.saveQuickTransaction">
      <div class="type-toggle" role="group" aria-label="快速记账类型">
        <button type="button" class="type-option" :class="{ 'is-active': ledger.quickForm.type === 'expense' }" @click="ledger.quickForm.type = 'expense'">支出</button>
        <button type="button" class="type-option" :class="{ 'is-active': ledger.quickForm.type === 'income' }" @click="ledger.quickForm.type = 'income'">收入</button>
      </div>
      <label><span>金额</span><input v-model="ledger.quickForm.amount" type="number" min="0.01" step="0.01" required placeholder="0.00" /></label>
      <label>
        <span>账户</span>
        <select v-model="ledger.quickForm.accountId" required>
          <option v-for="account in ledger.state.accounts" :key="account.id" :value="account.id">{{ account.name }}</option>
        </select>
      </label>
      <label>
        <span>分类</span>
        <select v-model="ledger.quickForm.category">
          <option :value="defaultCategory.name">未分类</option>
          <option v-for="category in categoryPresets[ledger.quickForm.type]" :key="category.name" :value="category.name">{{ category.name }}</option>
        </select>
      </label>
      <label><span>对象/用途</span><input v-model="ledger.quickForm.target" placeholder="可选" /></label>
      <button class="primary-button" type="submit">保存</button>
    </form>
    <div v-if="ledger.templateRows.length" class="template-strip" aria-label="记账模板">
      <div v-for="template in ledger.templateRows" :key="template.id" class="template-item">
        <button class="template-pill" @click="ledger.applyTemplateToForm(template, ledger.quickForm)">
          <span class="category-icon-badge" :class="`tone-${template.categoryMeta.tone}`">{{ template.categoryMeta.icon }}</span>
          <span>{{ template.name }}</span>
          <strong>{{ ledger.money(template.amount || 0) }}</strong>
        </button>
        <button class="template-delete" aria-label="删除模板" @click="ledger.deleteTemplate(template.id)">×</button>
      </div>
    </div>
    <p v-if="ledger.errors.transaction" class="form-error compact-error">{{ ledger.errors.transaction }}</p>
  </section>
</template>
