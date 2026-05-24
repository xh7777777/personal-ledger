export function roundMoney(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}
