let currentPlanId = null;
let currentCurrency = 'USD';
let currencySymbols = {
  'USD': '$',
  'ILS': '₪',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥'
};

window.addEventListener('pywebviewready', function() {
  console.log('pywebview ready');
  setEvents();
  loadPlans();
});

// Fallback in case pywebviewready doesn't fire
window.onload = function() {
  console.log('window loaded');
  setEvents();
  if (window.pywebview && window.pywebview.api) {
    loadPlans();
  } else {
    // Wait a bit for the API to be available
    setTimeout(function() {
      if (window.pywebview && window.pywebview.api) {
        loadPlans();
      }
    }, 500);
  }
};

function setEvents() {
  // Plan events
  document.getElementById("btnCreatePlan").onclick = createPlan;
  document.getElementById("btnDeletePlan").onclick = deletePlan;
  document.getElementById("btnRefreshPlans").onclick = loadPlans;
  document.getElementById("ddlPlans").onchange = selectPlan;
  document.getElementById("btnSaveCurrency").onclick = saveCurrency;
  
  // Tab events
  const tabButtons = document.querySelectorAll(".tabBtn");
  tabButtons.forEach((btn) => {
    btn.onclick = function() {
      switchTab(this.dataset.tab);
    };
  });
  
  // Income events
  document.getElementById("btnAddIncome").onclick = addIncome;
  
  // Payment events
  document.getElementById("btnAddPayment").onclick = addPayment;
  
  // Cash flow events
  document.getElementById("btnSaveInitialBalance").onclick = saveInitialBalance;
  document.getElementById("btnShowCashFlow").onclick = calculateCashFlow;
  
  const exportBtn = document.getElementById("btnExportCashFlow");
  if (exportBtn) {
    exportBtn.onclick = exportCashFlow;
  }
}

function switchTab(tabName) {
  // Hide all tabs
  const tabs = document.querySelectorAll(".tabContent");
  tabs.forEach((tab) => {
    tab.classList.remove("active");
  });

  // Remove active class from all buttons
  const buttons = document.querySelectorAll(".tabBtn");
  buttons.forEach((btn) => {
    btn.classList.remove("active");
  });

  // Show the selected tab
  document.getElementById(tabName).classList.add("active");

  // Mark the button as active
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
}

function loadPlans() {
  if (!window.pywebview || !window.pywebview.api) {
    console.error("API not available yet");
    return;
  }

  apiGetAllPlans().then((plans) => {
    console.log("Plans loaded:", plans);
    const ddl = document.getElementById("ddlPlans");
    ddl.innerHTML = '<option value="">-- Select a Plan --</option>';
    
    if (plans && plans.length > 0) {
      plans.forEach((plan) => {
        const option = document.createElement("option");
        option.value = plan.id;
        option.text = plan.name;
        ddl.appendChild(option);
      });
    } else {
      console.log("No plans found in database");
    }
  }).catch((error) => {
    console.error("Error loading plans:", error);
    alert("Error loading plans: " + error);
  });
}

function selectPlan() {
  const ddl = document.getElementById("ddlPlans");
  currentPlanId = parseInt(ddl.value) || null;
  
  if (currentPlanId) {
    document.getElementById("tabsContainer").style.display = "block";
    document.getElementById("btnDeletePlan").disabled = false;
    
    // Load the saved initial balance for this plan
    apiGetPlanInitialBalance(currentPlanId).then((balance) => {
      document.getElementById("txtInitialBalance").value = balance;
    }).catch((error) => {
      console.error("Error loading initial balance:", error);
    });

    // Load the saved currency for this plan
    apiGetPlanCurrency(currentPlanId).then((currency) => {
      currentCurrency = currency;
      document.getElementById("ddlCurrency").value = currency;
    }).catch((error) => {
      console.error("Error loading currency:", error);
    });
    
    loadIncomes();
    loadPayments();
  } else {
    document.getElementById("tabsContainer").style.display = "none";
    document.getElementById("btnDeletePlan").disabled = true;
    document.getElementById("txtInitialBalance").value = "";
    currentCurrency = 'USD';
    document.getElementById("ddlCurrency").value = 'USD';
  }
}

function createPlan() {
  const planName = document.getElementById("txtNewPlanName").value.trim();
  if (!planName) {
    alert("Please enter a plan name.");
    return;
  }

  apiCreatePlan(planName).then((response) => {
    alert(response.message);
    document.getElementById("txtNewPlanName").value = "";
    loadPlans();
  }).catch((error) => {
    console.error("Error creating plan:", error);
    alert("Error creating plan");
  });
}

function deletePlan() {
  if (!currentPlanId) return;
  
  if (confirm("Are you sure you want to delete this plan? This action cannot be undone.")) {
    apiDeletePlan(currentPlanId).then((response) => {
      alert(response.message);
      currentPlanId = null;
      document.getElementById("ddlPlans").value = "";
      loadPlans();
      selectPlan();
    }).catch((error) => {
      console.error("Error deleting plan:", error);
      alert("Error deleting plan");
    });
  }
}

function saveCurrency() {
  if (!currentPlanId) {
    alert("Please select a plan first.");
    return;
  }

  const currency = document.getElementById("ddlCurrency").value;
  currentCurrency = currency;

  apiSetPlanCurrency(currentPlanId, currency).then((response) => {
    alert(response.message);
  }).catch((error) => {
    console.error("Error saving currency:", error);
    alert("Error saving currency");
  });
}

function loadIncomes() {
  if (!currentPlanId) return;
  
  apiGetIncomes(currentPlanId).then((incomes) => {
    const tbody = document.getElementById("incomeTableBody");
    tbody.innerHTML = "";
    const symbol = currencySymbols[currentCurrency] || '$';
    
    incomes.forEach((income) => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${income.date}</td>
        <td>${income.description}</td>
        <td>${symbol}${income.amount.toFixed(2)}</td>
        <td><button onclick="deleteIncome(${income.id})">Delete</button></td>
      `;
    });
  }).catch((error) => {
    console.error("Error loading incomes:", error);
  });
}

function loadPayments() {
  if (!currentPlanId) return;
  
  apiGetPayments(currentPlanId).then((payments) => {
    const tbody = document.getElementById("paymentTableBody");
    tbody.innerHTML = "";
    const symbol = currencySymbols[currentCurrency] || '$';
    
    payments.forEach((payment) => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${payment.date}</td>
        <td>${payment.description}</td>
        <td>${symbol}${payment.amount.toFixed(2)}</td>
        <td><button onclick="deletePayment(${payment.id})">Delete</button></td>
      `;
    });
  }).catch((error) => {
    console.error("Error loading payments:", error);
  });
}

function addIncome() {
  if (!currentPlanId) {
    alert("Please select a plan first.");
    return;
  }

  const description = document.getElementById("txtIncomeDescription").value.trim();
  const date = document.getElementById("txtIncomeDate").value;
  const amount = parseFloat(document.getElementById("txtIncomeAmount").value);

  if (!description || !date || isNaN(amount) || amount <= 0) {
    alert("Please enter a valid description, date, and amount.");
    return;
  }

  apiAddIncome(currentPlanId, description, amount, date).then((response) => {
    alert(response.message);
    document.getElementById("txtIncomeDescription").value = "";
    document.getElementById("txtIncomeDate").value = "";
    document.getElementById("txtIncomeAmount").value = "";
    loadIncomes();
  }).catch((error) => {
    console.error("Error adding income:", error);
    alert("Error adding income");
  });
}

function addPayment() {
  if (!currentPlanId) {
    alert("Please select a plan first.");
    return;
  }

  const description = document.getElementById("txtPaymentDescription").value.trim();
  const date = document.getElementById("txtPaymentDate").value;
  const amount = parseFloat(document.getElementById("txtPaymentAmount").value);

  if (!description || !date || isNaN(amount) || amount <= 0) {
    alert("Please enter a valid description, date, and amount.");
    return;
  }

  apiAddPayment(currentPlanId, description, amount, date).then((response) => {
    alert(response.message);
    document.getElementById("txtPaymentDescription").value = "";
    document.getElementById("txtPaymentDate").value = "";
    document.getElementById("txtPaymentAmount").value = "";
    loadPayments();
  }).catch((error) => {
    console.error("Error adding payment:", error);
    alert("Error adding payment");
  });
}

function deleteIncome(incomeId) {
  if (confirm("Delete this income entry?")) {
    apiDeleteIncome(incomeId).then((response) => {
      loadIncomes();
    }).catch((error) => {
      console.error("Error deleting income:", error);
      alert("Error deleting income");
    });
  }
}

function deletePayment(paymentId) {
  if (confirm("Delete this payment entry?")) {
    apiDeletePayment(paymentId).then((response) => {
      loadPayments();
    }).catch((error) => {
      console.error("Error deleting payment:", error);
      alert("Error deleting payment");
    });
  }
}

function saveInitialBalance() {
  if (!currentPlanId) {
    alert("Please select a plan first.");
    return;
  }

  const initialBalance = parseFloat(document.getElementById("txtInitialBalance").value);

  if (isNaN(initialBalance)) {
    alert("Please enter a valid initial balance.");
    return;
  }

  apiSetPlanInitialBalance(currentPlanId, initialBalance).then((response) => {
    alert(response.message);
  }).catch((error) => {
    console.error("Error saving initial balance:", error);
    alert("Error saving initial balance");
  });
}

function calculateCashFlow() {
  if (!currentPlanId) {
    alert("Please select a plan first.");
    return;
  }

  const initialBalance = parseFloat(document.getElementById("txtInitialBalance").value);

  if (isNaN(initialBalance)) {
    alert("Please enter a valid initial balance.");
    return;
  }

  // Get detailed cash flow
  apiGetCashFlowDetails(currentPlanId, initialBalance).then((details) => {
    const tbody = document.getElementById("cashFlowTableBody");
    tbody.innerHTML = "";
    const symbol = currencySymbols[currentCurrency] || '$';

    if (details && details.length > 0) {
      details.forEach((transaction) => {
        const row = tbody.insertRow();
        const balanceClass = transaction.balance < 0 ? "negative-balance" : "positive-balance";
        const amountClass = transaction.type === "income" ? "income-amount" : "payment-amount";
        const amountDisplay = transaction.type === "income" ? `+${symbol}${transaction.amount.toFixed(2)}` : `-${symbol}${Math.abs(transaction.amount).toFixed(2)}`;
        
        row.innerHTML = `
          <td>${transaction.date}</td>
          <td>${transaction.description}</td>
          <td>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</td>
          <td class="${amountClass}">${amountDisplay}</td>
          <td class="${balanceClass}">${symbol}${transaction.balance.toFixed(2)}</td>
        `;
      });
    } else {
      const row = tbody.insertRow();
      row.innerHTML = `<td colspan="5" style="text-align: center;">No transactions</td>`;
    }
  }).catch((error) => {
    console.error("Error getting cash flow details:", error);
    alert("Error getting cash flow details");
  });
}

function exportCashFlow() {
  if (!currentPlanId) {
    alert("Please select a plan first.");
    return;
  }

  const initialBalance = parseFloat(document.getElementById("txtInitialBalance").value);

  if (isNaN(initialBalance)) {
    alert("Please enter a valid initial balance.");
    return;
  }

  try {
    // Load XLSX library first, then proceed with export
    loadXLSXLibrary().then(() => {
      apiGetCashFlowDetails(currentPlanId, initialBalance).then((details) => {
        if (!details || details.length === 0) {
          alert("No cash flow data to export. Please add some transactions first.");
          return;
        }
        
        const planName = document.getElementById("ddlPlans").selectedOptions[0].text;
        const symbol = currencySymbols[currentCurrency] || '$';
        
        try {
          const result = exportCashFlowToExcel(planName, currentCurrency, symbol, details, initialBalance);
          
          if (result && result.workbook) {
            triggerFileDownload(result.workbook, result.defaultFileName);
          }
        } catch (error) {
          console.error("Error exporting:", error);
          alert("Error exporting: " + error.message);
        }
      }).catch((error) => {
        console.error("Error getting cash flow details:", error);
        alert("Error getting cash flow details: " + error);
      });
    }).catch((error) => {
      console.error("Error loading XLSX library:", error);
      alert("Error loading XLSX library: " + error);
    });
  } catch (error) {
    console.error("Export error:", error);
    alert("Error during export: " + error.message);
  }
}
