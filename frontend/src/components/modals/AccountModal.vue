<script setup>
import { accountPresets } from "../../constants/ledger";

const props = defineProps({
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

function selectPreset(account) {
  const presetNames = accountPresets.map((item) => item.label);
  if (!props.form.name || presetNames.includes(props.form.name)) props.form.name = account.label;
  props.form.type = account.type;
}
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
        <div class="full-field account-preset-field">
          <div class="field-label-row">
            <span>账户类型</span>
            <span class="field-hint">选择常用账户，名称可继续自定义</span>
          </div>
          <div class="account-preset-grid">
            <button
              v-for="account in accountPresets"
              :key="account.type"
              type="button"
              class="account-preset-button"
              :class="[`wallet-${account.tone}`, { 'is-active': form.type === account.type }]"
              @click="selectPreset(account)"
            >
              <span class="account-preset-icon">
                <img v-if="account.iconUrl" :src="account.iconUrl" :alt="account.label" />
                <span v-else>{{ account.icon }}</span>
              </span>
              <span>
                <strong>{{ account.label }}</strong>
                <small>{{ account.brand }}</small>
              </span>
            </button>
          </div>
        </div>
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
