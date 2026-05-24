import { request } from "./http";

export const ledgerApi = {
  getState() {
    return request("/api/state");
  },
  createAccount(payload) {
    return request("/api/accounts", { method: "POST", body: JSON.stringify(payload) });
  },
  updateAccount(id, payload) {
    return request(`/api/accounts/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  },
  deleteAccount(id) {
    return request(`/api/accounts/${id}`, { method: "DELETE" });
  },
  createTransaction(payload) {
    return request("/api/transactions", { method: "POST", body: JSON.stringify(payload) });
  },
  updateTransaction(id, payload) {
    return request(`/api/transactions/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  },
  deleteTransaction(id) {
    return request(`/api/transactions/${id}`, { method: "DELETE" });
  }
};
