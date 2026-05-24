<script setup>
defineProps({
  accounts: {
    type: Array,
    required: true
  },
  error: {
    type: String,
    default: ""
  },
  form: {
    type: Object,
    required: true
  },
  open: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(["close", "submit"]);
</script>

<template>
  <div v-if="open" class="modal-backdrop">
    <form class="modal-card" @submit.prevent="emit('submit')">
      <div class="modal-heading">
        <div>
          <p class="eyebrow">Transaction</p>
          <h2>{{ form.id ? "编辑流水" : "新增流水" }}</h2>
        </div>
        <button class="icon-button" type="button" aria-label="关闭" @click="emit('close')">×</button>
      </div>
      <div class="type-toggle" role="group" aria-label="流水类型">
        <button type="button" class="type-option" :class="{ 'is-active': form.type === 'expense' }" @click="form.type = 'expense'">支出</button>
        <button type="button" class="type-option" :class="{ 'is-active': form.type === 'income' }" @click="form.type = 'income'">收入</button>
      </div>
      <div class="form-grid">
        <label><span>金额</span><input v-model="form.amount" type="number" min="0.01" step="0.01" required placeholder="0.00" /></label>
        <label><span>日期</span><input v-model="form.date" type="date" required /></label>
        <label>
          <span>账户</span>
          <select v-model="form.accountId" required>
            <option v-for="account in accounts" :key="account.id" :value="account.id">{{ account.name }}</option>
          </select>
        </label>
        <label><span>分类</span><input v-model="form.category" required placeholder="餐饮、工资、交通" /></label>
        <label class="full-field"><span>对象/地点/用途</span><input v-model="form.target" placeholder="例如：便利店、房租、项目奖金" /></label>
        <label class="full-field"><span>备注</span><textarea v-model="form.note" rows="3" placeholder="可选"></textarea></label>
      </div>
      <p class="form-error">{{ error }}</p>
      <div class="modal-actions">
        <button class="ghost-button" type="button" @click="emit('close')">取消</button>
        <button class="primary-button" type="submit">保存</button>
      </div>
    </form>
  </div>
</template>
