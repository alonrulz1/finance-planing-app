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

// Load XLSX library from backend API
function loadXLSXLibrary() {
  if (typeof XLSX !== 'undefined') {
    return Promise.resolve();
  }
  
  if (!window.pywebview || !window.pywebview.api) {
    return Promise.reject("API not available yet");
  }
  
  return window.pywebview.api.get_lib_file('xlsx.full.min.js').then((content) => {
    if (content) {
      const script = document.createElement('script');
      script.textContent = content;
      document.head.appendChild(script);
      return Promise.resolve();
    } else {
      return Promise.reject("Failed to load XLSX library");
    }
  });
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
    console.error("Error downloading file:", error);
    alert("Error downloading file: " + error.message);
  }
}
