function apiGetAllPlans() {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  try {
    return window.pywebview.api.get_all_plans().catch((error) => {
      console.error("Error in apiGetAllPlans:", error);
      throw error;
    });
  } catch (error) {
    console.error("Error in apiGetAllPlans:", error);
    return Promise.reject(error);
  }
}

function apiCreatePlan(name, planType, initialBalance, currency) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  try {
    return window.pywebview.api.create_plan(name, planType, initialBalance, currency).catch((error) => {
      console.error("Error in apiCreatePlan:", error);
      throw error;
    });
  } catch (error) {
    console.error("Error in apiCreatePlan:", error);
    return Promise.reject(error);
  }
}

function apiDeletePlan(planId) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  try {
    return window.pywebview.api.delete_plan(planId).catch((error) => {
      console.error("Error in apiDeletePlan:", error);
      throw error;
    });
  } catch (error) {
    console.error("Error in apiDeletePlan:", error);
    return Promise.reject(error);
  }
}

function apiGetPlanInitialBalance(planId) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  try {
    return window.pywebview.api.get_plan_initial_balance(planId).catch((error) => {
      console.error("Error in apiGetPlanInitialBalance:", error);
      throw error;
    });
  } catch (error) {
    console.error("Error in apiGetPlanInitialBalance:", error);
    return Promise.reject(error);
  }
}

function apiSetPlanInitialBalance(planId, balance) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  try {
    return window.pywebview.api.set_plan_initial_balance(planId, balance).catch((error) => {
      console.error("Error in apiSetPlanInitialBalance:", error);
      throw error;
    });
  } catch (error) {
    console.error("Error in apiSetPlanInitialBalance:", error);
    return Promise.reject(error);
  }
}

function apiGetPlanCurrency(planId) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  try {
    return window.pywebview.api.get_plan_currency(planId).catch((error) => {
      console.error("Error in apiGetPlanCurrency:", error);
      throw error;
    });
  } catch (error) {
    console.error("Error in apiGetPlanCurrency:", error);
    return Promise.reject(error);
  }
}

function apiSetPlanCurrency(planId, currency) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  try {
    return window.pywebview.api.set_plan_currency(planId, currency).catch((error) => {
      console.error("Error in apiSetPlanCurrency:", error);
      throw error;
    });
  } catch (error) {
    console.error("Error in apiSetPlanCurrency:", error);
    return Promise.reject(error);
  }
}

function apiGetIncomes(planId, month = null) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  try {
    return window.pywebview.api.get_incomes(planId).catch((error) => {
      console.error("Error in apiGetIncomes:", error);
      throw error;
    });
  } catch (error) {
    console.error("Error in apiGetIncomes:", error);
    return Promise.reject(error);
  }
}

function apiAddIncome(planId, description, amount, date, subtype = 'regular', month = null) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  try {
    return window.pywebview.api.add_income(planId, description, amount, date, subtype, month).catch((error) => {
      console.error("Error in apiAddIncome:", error);
      throw error;
    });
  } catch (error) {
    console.error("Error in apiAddIncome:", error);
    return Promise.reject(error);
  }
}

function apiDeleteIncome(incomeId) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  try {
    return window.pywebview.api.delete_income(incomeId).catch((error) => {
      console.error("Error in apiDeleteIncome:", error);
      throw error;
    });
  } catch (error) {
    console.error("Error in apiDeleteIncome:", error);
    return Promise.reject(error);
  }
}

function apiGetPayments(planId, month = null) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  try {
    return window.pywebview.api.get_payments(planId, month).catch((error) => {
      console.error("Error in apiGetPayments:", error);
      throw error;
    });
  } catch (error) {
    console.error("Error in apiGetPayments:", error);
    return Promise.reject(error);
  }
}

function apiAddPayment(planId, description, amount, date, subtype = 'regular', month = null) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  try {
    return window.pywebview.api.add_payment(planId, description, amount, date, subtype, month).catch((error) => {
      console.error("Error in apiAddPayment:", error);
      throw error;
    });
  } catch (error) {
    console.error("Error in apiAddPayment:", error);
    return Promise.reject(error);
  }
}

function apiDeletePayment(paymentId) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  try {
    return window.pywebview.api.delete_payment(paymentId).catch((error) => {
      console.error("Error in apiDeletePayment:", error);
      throw error;
    });
  } catch (error) {
    console.error("Error in apiDeletePayment:", error);
    return Promise.reject(error);
  }
}

function apiGetCashFlowDetails(planId, initialBalance, month = null) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  try {
    return window.pywebview.api.get_cash_flow_details(planId, initialBalance, month).catch((error) => {
      console.error("Error in apiGetCashFlowDetails:", error);
      throw error;
    });
  } catch (error) {
    console.error("Error in apiGetCashFlowDetails:", error);
    return Promise.reject(error);
  }
}

function apiGetMonthlyPlanMonths(planId) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  try {
    return window.pywebview.api.get_monthly_plan_months(planId).catch((error) => {
      console.error("Error in apiGetMonthlyPlanMonths:", error);
      throw error;
    });
  } catch (error) {
    console.error("Error in apiGetMonthlyPlanMonths:", error);
    return Promise.reject(error);
  }
}

function apiActivateMonth(planId, month) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  try {
    return window.pywebview.api.activate_month(planId, month).catch((error) => {
      console.error("Error in apiActivateMonth:", error);
      throw error;
    });
  } catch (error) {
    console.error("Error in apiActivateMonth:", error);
    return Promise.reject(error);
  }
}

function apiCopyRegularTransactions(planId, fromMonth, toMonth) {
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  try {
    return window.pywebview.api.copy_regular_transactions(planId, fromMonth, toMonth).catch((error) => {
      console.error("Error in apiCopyRegularTransactions:", error);
      throw error;
    });
  } catch (error) {
    console.error("Error in apiCopyRegularTransactions:", error);
    return Promise.reject(error);
  }
}

// Load XLSX library from backend API
function loadXLSXLibrary() {
  if (typeof XLSX !== 'undefined') {
    return Promise.resolve();
  }
  
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  
  try {
    return window.pywebview.api.get_lib_file('xlsx.full.min.js').then((content) => {
      if (content) {
        const script = document.createElement('script');
        script.textContent = content;
        document.head.appendChild(script);
        return Promise.resolve();
      } else {
        return Promise.reject("Failed to load XLSX library");
      }
    }).catch((error) => {
      console.error("Error loading XLSX library:", error);
      throw error;
    });
  } catch (error) {
    console.error("Error loading XLSX library:", error);
    return Promise.reject(error);
  }
}

function exportCashFlowToExcel(planName, currency, currencySymbol, cashFlowData, initialBalance) {
  try {
    const ws_name = "Cash Flow";
    const wb = XLSX.utils.book_new();
    
    const wsData = [];
    wsData.push(["Financial Plan Report"]);
    wsData.push(["Plan Name:", planName]);
    wsData.push(["Currency:", currency]);
    wsData.push(["Initial Balance:", currencySymbol + initialBalance.toFixed(2)]);
    wsData.push([]);
    
    wsData.push(["Date", "Description", "Type", "Amount", "Balance"]);
    
    if (cashFlowData && cashFlowData.length > 0) {
      cashFlowData.forEach((transaction) => {
        const amountDisplay = transaction.type === "income" 
          ? transaction.amount.toFixed(2) 
          : (-transaction.amount).toFixed(2);
        wsData.push([
          transaction.date,
          transaction.description,
          transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
          parseFloat(amountDisplay),
          parseFloat(transaction.balance.toFixed(2))
        ]);
      });
    }
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [
      { wch: 15 },
      { wch: 25 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 }
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, ws_name);
    
    const sanitizedPlanName = planName.replace(/[\/\\?*[\]:"|<>]/g, '_');
    const defaultFileName = `CashFlow_${sanitizedPlanName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    return {
      workbook: wb,
      defaultFileName: defaultFileName
    };
  } catch (error) {
    console.error("Error preparing Excel export:", error);
    throw new Error("Error preparing Excel export: " + error.message);
  }
}

function triggerFileDownload(wb, defaultFileName) {
  try {
    const fileName = prompt("Enter file name:", defaultFileName);
    
    if (fileName === null) {
      return;
    }
    
    if (!fileName.trim()) {
      alert("File name cannot be empty.");
      return;
    }
    
    const finalFileName = fileName.endsWith('.xlsx') ? fileName : fileName + '.xlsx';
    
    try {
      // Convert workbook to binary and send to backend
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      
      // Convert array buffer to base64 for transmission
      const binaryString = String.fromCharCode.apply(null, new Uint8Array(wbout));
      const base64Data = btoa(binaryString);
      
      // Send to backend to save
      if (!window.pywebview || !window.pywebview.api) {
        alert("API not available");
        return;
      }
      
      window.pywebview.api.save_excel_file(finalFileName, base64Data).then((result) => {
        if (result.success) {
          alert("File saved successfully to:\n" + result.path);
        } else {
          alert("Error saving file: " + result.message);
        }
      }).catch((error) => {
        console.error("Error saving file:", error);
        alert("Error saving file: " + error);
      });
    } catch (error) {
      console.error("Error converting workbook to Excel:", error);
      throw error;
    }
    
  } catch (error) {
    console.error("Error downloading file:", error);
    alert("Error downloading file: " + error.message);
  }
}
