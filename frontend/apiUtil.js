function apiGetAllPlans() {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  return window.pywebview.api.get_all_plans();
}

function apiCreatePlan(planName) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  return window.pywebview.api.create_plan(planName);
}

function apiDeletePlan(planId) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  return window.pywebview.api.delete_plan(planId);
}

function apiGetPlanInitialBalance(planId) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  return window.pywebview.api.get_plan_initial_balance(planId);
}

function apiSetPlanInitialBalance(planId, balance) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  return window.pywebview.api.set_plan_initial_balance(planId, balance);
}

function apiGetPlanCurrency(planId) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  return window.pywebview.api.get_plan_currency(planId);
}

function apiSetPlanCurrency(planId, currency) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  return window.pywebview.api.set_plan_currency(planId, currency);
}

function apiGetIncomes(planId) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  return window.pywebview.api.get_incomes(planId);
}

function apiAddIncome(planId, description, amount, date) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  return window.pywebview.api.add_income(planId, description, amount, date);
}

function apiDeleteIncome(incomeId) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  return window.pywebview.api.delete_income(incomeId);
}

function apiGetPayments(planId) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  return window.pywebview.api.get_payments(planId);
}

function apiAddPayment(planId, description, amount, date) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  return window.pywebview.api.add_payment(planId, description, amount, date);
}

function apiDeletePayment(paymentId) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  return window.pywebview.api.delete_payment(paymentId);
}

function apiGetCashFlowDetails(planId, initialBalance) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  return window.pywebview.api.get_cash_flow_details(planId, initialBalance);
}
