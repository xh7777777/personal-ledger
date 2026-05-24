<script setup>
import { accountTypes } from "../../constants/ledger";

defineProps({
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
          <p class="eyebrow">Account</p>
          <h2>{{ form.id ? "编辑账户" : "新增账户" }}</h2>
        </div>
        <button class="icon-button" type="button" aria-label="关闭" @click="emit('close')">×</button>
      </div>
      <div class="form-grid">
        <label><span>账户名称</span><input v-model="form.name" required placeholder="现金、招商银行卡" /></label>
        <label>
          <span>账户类型</span>
          <select v-model="form.type">
            <option v-for="type in accountTypes" :key="type">{{ type }}</option>
          </select>
        </label>
        <label><span>初始金额</span><input v-model="form.initialBalance" type="number" step="0.01" required placeholder="0.00" /></label>
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
