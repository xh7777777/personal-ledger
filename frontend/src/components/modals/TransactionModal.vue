<script setup>
import { computed, ref, watch } from "vue";
import { categoryPresets, defaultCategory } from "../../constants/ledger";

const emit = defineEmits(["close", "submit", "apply-template"]);

const props = defineProps({
  accounts: {
    type: Array,
    required: true
  },
  templates: {
    type: Array,
    default: () => []
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

const visibleCategories = computed(() => [defaultCategory, ...(categoryPresets[props.form.type] || [])]);
const categoryExpanded = ref(false);
const hasMoreCategories = computed(() => visibleCategories.value.length > 4);

watch(
  () => props.form.type,
  () => {
    categoryExpanded.value = false;
  }
);

function selectCategory(category) {
  props.form.category = category.name === defaultCategory.name ? "" : category.name;
}

function isSelected(category) {
  const value = props.form.category.trim() || defaultCategory.name;
  return value === category.name;
}
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
      <div v-if="templates.length" class="template-strip modal-template-strip" aria-label="使用模板">
        <button v-for="template in templates" :key="template.id" class="template-pill" type="button" @click="emit('apply-template', template)">
          <span class="category-icon-badge" :class="`tone-${template.categoryMeta.tone}`">{{ template.categoryMeta.icon }}</span>
          <span>{{ template.name }}</span>
        </button>
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
        <div class="full-field category-field">
          <div class="field-label-row">
            <span>分类</span>
            <span class="field-hint">可不选，保存为未分类</span>
          </div>
          <div class="category-picker-wrap" :class="{ 'is-expanded': categoryExpanded, 'has-more': hasMoreCategories }">
            <div class="category-picker">
              <button
                v-for="category in visibleCategories"
                :key="category.name"
                type="button"
                class="category-chip"
                :class="[`tone-${category.tone}`, { 'is-active': isSelected(category) }]"
                @click="selectCategory(category)"
              >
                <span class="category-icon">{{ category.icon }}</span>
                <span class="category-chip-text">{{ category.name }}</span>
              </button>
            </div>
          </div>
          <button v-if="hasMoreCategories" class="category-expand-button" type="button" @click="categoryExpanded = !categoryExpanded">
            {{ categoryExpanded ? "收起分类" : "展开更多分类" }}
          </button>
          <label class="custom-category">
            <span>自定义分类</span>
            <input v-model="form.category" placeholder="输入自己的分类，或留空使用未分类" />
          </label>
        </div>
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
