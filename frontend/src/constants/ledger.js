export const rangeOptions = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
  { value: "year", label: "年" },
  { value: "custom", label: "自定义" }
];

export const accountTypes = ["现金", "银行卡", "储蓄", "其他"];

export const rangeLabels = {
  day: "今日",
  week: "本周",
  month: "本月",
  year: "本年",
  custom: "自定义范围"
};

export const defaultCategory = {
  name: "未分类",
  icon: "◇",
  tone: "neutral"
};

export const categoryPresets = {
  expense: [
    { name: "餐饮", icon: "🍜", tone: "food" },
    { name: "咖啡", icon: "☕", tone: "food" },
    { name: "水果零食", icon: "🍓", tone: "food" },
    { name: "购物", icon: "🛍", tone: "shopping" },
    { name: "日用品", icon: "🧴", tone: "home" },
    { name: "交通", icon: "🚇", tone: "travel" },
    { name: "打车", icon: "🚕", tone: "travel" },
    { name: "加油停车", icon: "⛽", tone: "travel" },
    { name: "房租房贷", icon: "🏠", tone: "home" },
    { name: "水电燃气", icon: "💡", tone: "home" },
    { name: "通讯网络", icon: "📱", tone: "tech" },
    { name: "医疗健康", icon: "💊", tone: "care" },
    { name: "运动健身", icon: "🏃", tone: "care" },
    { name: "教育学习", icon: "📚", tone: "study" },
    { name: "娱乐影音", icon: "🎬", tone: "fun" },
    { name: "旅行住宿", icon: "✈️", tone: "travel" },
    { name: "人情礼物", icon: "🎁", tone: "gift" },
    { name: "育儿", icon: "🧸", tone: "gift" },
    { name: "数码电器", icon: "💻", tone: "tech" },
    { name: "家居维修", icon: "🛋", tone: "home" },
    { name: "美容护理", icon: "💄", tone: "care" },
    { name: "保险", icon: "🛡", tone: "finance" },
    { name: "税费", icon: "🧾", tone: "finance" },
    { name: "其他支出", icon: "✨", tone: "neutral" }
  ],
  income: [
    { name: "工资", icon: "💼", tone: "finance" },
    { name: "奖金", icon: "🏆", tone: "gift" },
    { name: "报销", icon: "🧾", tone: "finance" },
    { name: "投资收益", icon: "📈", tone: "finance" },
    { name: "兼职副业", icon: "🧰", tone: "tech" },
    { name: "红包礼金", icon: "🧧", tone: "gift" },
    { name: "租金收入", icon: "🏘", tone: "home" },
    { name: "利息", icon: "🏦", tone: "finance" },
    { name: "退款", icon: "↩", tone: "shopping" },
    { name: "其他收入", icon: "✨", tone: "neutral" }
  ]
};

const allCategories = [defaultCategory, ...categoryPresets.expense, ...categoryPresets.income];

export function categoryDisplay(category) {
  const name = String(category || "").trim() || defaultCategory.name;
  return allCategories.find((item) => item.name === name) || { name, icon: "✎", tone: "custom" };
}
