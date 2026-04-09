let currentPlanId = null;
let currentPlanType = 'custom';
let currentMonth = null;
let currentCurrency = 'USD';
let currencySymbols = {
  'USD': '$',
  'ILS': '₪',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥'
};

// Function to format date to Israeli format (dd-mm-yyyy)
function formatDateToIsraeli(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// Function to parse Israeli date format (dd-mm-yyyy) to ISO format
function parseIsraeliDate(israeliDateString) {
  if (!israeliDateString) return '';
  const parts = israeliDateString.split('-');
  if (parts.length !== 3) return israeliDateString;
  const day = parts[0];
  const month = parts[1];
  const year = parts[2];
  return `${year}-${month}-${day}`;
}

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
  document.getElementById("ddlPlanType").onchange = onPlanTypeChange;
  document.getElementById("ddlMonths").onchange = onMonthChange;
  document.getElementById("btnStartMonth").onclick = startMonth;
  
  // Transaction events
  document.getElementById("btnAddTransaction").onclick = addTransaction;
  
  // Cash flow events
  document.getElementById("btnSaveInitialBalance").onclick = saveInitialBalance;
  
  const exportBtn = document.getElementById("btnExportCashFlow");
  if (exportBtn) {
    exportBtn.onclick = exportCashFlow;
  }
}

function updateBalanceDisplay() {
  const initialBalance = parseFloat(document.getElementById("txtInitialBalance").value) || 0;
  
  if (!currentPlanId) {
    document.getElementById("currentBalanceDisplay").textContent = '$0.00';
    return;
  }

  // Get detailed cash flow to calculate current balance
  apiGetCashFlowDetails(currentPlanId, initialBalance).then((details) => {
    const symbol = currencySymbols[currentCurrency] || '$';
    
    if (details && details.length > 0) {
      const lastTransaction = details[details.length - 1];
      document.getElementById("currentBalanceDisplay").textContent = `${symbol}${lastTransaction.balance.toFixed(2)}`;
      
      // Update the transaction table
      updateTransactionTable(details);
    } else {
      document.getElementById("currentBalanceDisplay").textContent = `${symbol}${initialBalance.toFixed(2)}`;
      document.getElementById("transactionTableBody").innerHTML = `<td colspan="6" style="text-align: center;">No transactions</td>`;
    }
  }).catch((error) => {
    console.error("Error updating balance display:", error);
  });
}

function onPlanTypeChange() {
  console.log("=== onPlanTypeChange START ===");
  const planType = document.getElementById("ddlPlanType").value;
  console.log("Plan type changed to:", planType);
  
  // Update the currentPlanType variable
  currentPlanType = planType;
  console.log("Updated currentPlanType to:", currentPlanType);
  
  const customPlanSelection = document.getElementById("customPlanSelection");
  const monthlyPlanSelection = document.getElementById("monthlyPlanSelection");
  const customPlanControls = document.getElementById("customPlanControls");
  const monthlyPlanControls = document.getElementById("monthlyPlanControls");
  const subtypeDropdown = document.getElementById("ddlTransactionSubtype");
  
  if (planType === "monthly") {
    console.log("Switching to monthly mode - hiding custom controls, showing monthly controls");
    // Hide custom plan controls, show monthly plan controls
    customPlanSelection.style.display = "none";
    monthlyPlanSelection.style.display = "block";
    customPlanControls.style.display = "none";
    monthlyPlanControls.style.display = "block";
    subtypeDropdown.style.display = "inline-block";
    generateMonthOptions(); // Generate month options when switching to monthly
    
    // Auto-select first monthly plan if no plan is selected
    if (!currentPlanId) {
      console.log("No plan selected, looking for first monthly plan...");
      apiGetAllPlans().then((plans) => {
        const monthlyPlan = plans.find(p => p.name.includes("Monthly Plan"));
        if (monthlyPlan) {
          console.log("Found monthly plan:", monthlyPlan);
          currentPlanId = monthlyPlan.id;
          document.getElementById("ddlPlans").value = monthlyPlan.id;
        }
        
        console.log("About to call loadMonthlyMonths...");
        loadMonthlyMonths(); // Load month data to show icons
        console.log("Called loadMonthlyMonths");
      }).catch((error) => {
        console.error("Error getting plans:", error);
      });
    } else {
      console.log("About to call loadMonthlyMonths...");
      loadMonthlyMonths(); // Load month data to show icons
      console.log("Called loadMonthlyMonths");
    }
  } else {
    console.log("Switching to custom mode - showing custom controls, hiding monthly controls");
    // Show custom plan controls, hide monthly plan controls
    customPlanSelection.style.display = "block";
    monthlyPlanSelection.style.display = "none";
    customPlanControls.style.display = "block";
    monthlyPlanControls.style.display = "none";
    subtypeDropdown.style.display = "none";
  }
  console.log("=== onPlanTypeChange END ===");
}

function onMonthChange() {
  const selectedMonth = document.getElementById("ddlMonths").value;
  if (!selectedMonth) return;
  
  // Get the selected option using selectedOptions property instead of querySelector
  const selectedOption = document.getElementById("ddlMonths").selectedOptions[0];
  if (!selectedOption) return;
  
  const planId = selectedOption.getAttribute('data-plan-id');
  const isActive = selectedOption.getAttribute('data-is-active') === 'true';
  
  console.log("Month changed to:", selectedMonth);
  console.log("Selected option:", selectedOption);
  console.log("Plan ID from data attribute:", planId);
  console.log("Is Active from data attribute:", isActive);
  console.log("Current currentPlanId before change:", currentPlanId);
  
  if (!planId) {
    console.log("No plan associated with this month");
    // No plan associated with this month
    document.getElementById("transactionTableBody").innerHTML = '<td colspan="7" style="text-align: center;">Please start this month first to add transactions</td>';
    updateBalanceDisplay();
    
    // Hide transaction form
    const transactionForm = document.querySelector("div[style*='Add Transaction']");
    if (transactionForm) {
      transactionForm.style.display = "none";
    }
    return;
  }
  
  // Set currentPlanId if different
  if (planId !== currentPlanId.toString()) {
    console.log("Updating currentPlanId from", currentPlanId, "to", planId);
    currentPlanId = parseInt(planId);
  }
  
  // Load transactions based on whether month is active
  if (isActive) {
    console.log("Month is active, calling loadTransactions with active status");
    loadTransactions(true);
  } else {
    console.log("Month is not active, hiding transaction components");
    // Clear transaction table and show message
    document.getElementById("transactionTableBody").innerHTML = '<td colspan="7" style="text-align: center;">Please start this month first to add transactions</td>';
    updateBalanceDisplay();
    
    // Hide entire transaction component (form and balance display)
    const financeContainer = document.getElementById("financeContainer");
    if (financeContainer) {
      financeContainer.style.display = "none";
    }
  }
}

function startMonth() {
  const selectedMonth = document.getElementById("ddlMonths").value;
  if (!selectedMonth) {
    alert("Please select a month first.");
    return;
  }
  
  let planId = currentPlanId;
  
  // If no plan is selected, create a new monthly plan first
  if (!planId) {
    const planName = `${selectedMonth} ${new Date().getFullYear()} Monthly Plan`;
    console.log("Creating new monthly plan:", planName);
    
    apiCreatePlan(planName, "monthly").then((response) => {
      console.log("Plan created:", response);
      // Reload plans to get the new plan ID
      loadPlans().then(() => {
        // Find the newly created plan and select it
        apiGetAllPlans().then((plans) => {
          const newPlan = plans.find(p => p.name === planName);
          if (newPlan) {
            planId = newPlan.id;
            currentPlanId = planId;
            
            // Select the new plan in the dropdown
            document.getElementById("ddlPlans").value = planId;
            
            // Now activate the month
            activateMonthForPlan(planId, selectedMonth);
          } else {
            alert("Error: Could not find newly created plan");
          }
        }).catch((error) => {
          console.error("Error getting plans:", error);
          alert("Error getting plans");
        });
      });
    }).catch((error) => {
      console.error("Error creating plan:", error);
      alert("Error creating monthly plan");
    });
  } else {
    // Plan already exists, just activate the month
    activateMonthForPlan(planId, selectedMonth);
  }
}

function activateMonthForPlan(planId, selectedMonth) {
  console.log("Activating month:", selectedMonth, "for plan:", planId);
  
  // Activate month and create the financial plan
  apiActivateMonth(planId, selectedMonth).then((result) => {
    console.log("Month activation result:", result);
    if (result.success) {
      // Show finance container and enable controls
      document.getElementById("financeContainer").style.display = "block";
      document.getElementById("btnDeletePlan").disabled = false;
      
      // Update just the selected month option to green, don't recreate entire dropdown
      const selectedOption = document.getElementById("ddlMonths").querySelector(`option[value="${selectedMonth}"]`);
      if (selectedOption) {
        selectedOption.textContent = `🟢 ${selectedMonth}`;
        selectedOption.style.backgroundColor = "#90EE90";
        selectedOption.style.color = "black";
        // Make sure this option is selected
        document.getElementById("ddlMonths").value = selectedMonth;
      }
      
      // Load transactions for the newly activated month
      loadTransactions();
      
      // Check if previous month has transactions before asking to copy
      if (result.previous_month) {
        // First check if previous month has an active plan
        apiGetMonthlyPlanMonths(planId).then((months) => {
          const previousMonthData = months ? months.find(m => m.month === result.previous_month) : null;
          const isPreviousMonthActive = previousMonthData && previousMonthData.is_active;
          
          console.log("Previous month:", result.previous_month, "Is active:", isPreviousMonthActive);
          
          // Only check for transactions if previous month is active
          if (isPreviousMonthActive) {
            // Check if previous month has any transactions (income or payments)
            Promise.all([
              apiGetIncomes(planId, result.previous_month),
              apiGetPayments(planId, result.previous_month)
            ]).then(([incomes, payments]) => {
              const hasTransactions = (incomes && incomes.length > 0) || (payments && payments.length > 0);
              
              console.log("Previous month has transactions:", hasTransactions);
              
              if (hasTransactions) {
                if (confirm("Do you want to copy regular transactions from previous month?")) {
                  apiCopyRegularTransactions(planId, result.previous_month, selectedMonth).then(() => {
                    loadTransactions();
                  }).catch((error) => {
                    console.error("Error copying transactions:", error);
                    alert("Error copying transactions");
                  });
                }
              }
            }).catch((error) => {
              console.error("Error checking previous month transactions:", error);
            });
          } else {
            console.log("Previous month is not active, skipping copy prompt");
          }
        }).catch((error) => {
          console.error("Error checking previous month status:", error);
        });
      }
    } else {
      alert("Error starting month");
    }
  }).catch((error) => {
    console.error("Error starting month:", error);
    alert("Error starting month");
  });
}

function generateMonthOptions() {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const ddlMonths = document.getElementById("ddlMonths");
  ddlMonths.innerHTML = '<option value="">-- Select Month --</option>';
  
  months.forEach(month => {
    const option = document.createElement("option");
    option.value = month;
    option.textContent = month;
    ddlMonths.appendChild(option);
  });
}

function loadMonthlyMonths() {
  console.log("=== loadMonthlyMonths START ===");
  console.log("currentPlanId:", currentPlanId, "currentPlanType:", currentPlanType);
  
  if (currentPlanType !== "monthly") {
    console.log("Returning early - not monthly plan");
    return;
  }
  
  console.log("Generating month options...");
  generateMonthOptions(); // Generate month options first
  
  const ddlMonths = document.getElementById("ddlMonths");
  console.log("ddlMonths element:", ddlMonths);
  console.log("ddlMonths options count:", ddlMonths ? ddlMonths.options.length : "not found");
  
  if (!currentPlanId) {
    console.log("No plan selected - showing all months with red icons");
    // If no plan selected, show all months with red icons
    const allOptions = ddlMonths.querySelectorAll("option[value]");
    console.log("Found options to update:", allOptions.length);
    allOptions.forEach((option, index) => {
      console.log(`Updating option ${index}:`, option.value, "->", `🔴 ${option.value}`);
      if (option.value) {
        option.textContent = `🔴 ${option.value}`;
        option.style.backgroundColor = "#D3D3D3";
        option.style.color = "gray";
      }
    });
    console.log("=== loadMonthlyMonths END (no plan) ===");
    return;
  }
  
  console.log("Calling API with planId:", currentPlanId);
  apiGetMonthlyPlanMonths(currentPlanId).then((months) => {
    console.log("API returned months:", months);
    
    // First, set all months to red by default and clear data attributes
    const allOptions = ddlMonths.querySelectorAll("option[value]");
    allOptions.forEach((option) => {
      if (option.value) {
        option.textContent = `🔴 ${option.value}`;
        option.style.backgroundColor = "#D3D3D3";
        option.style.color = "gray";
        option.removeAttribute('data-plan-id');
        option.removeAttribute('data-is-active');
      }
    });
    
    // Then update months that exist in database
    if (months && months.length > 0) {
      console.log("Processing months data...");
      console.log("Available options in dropdown:");
      ddlMonths.querySelectorAll("option[value]").forEach(opt => {
        console.log("  Option:", opt.value, opt.textContent);
      });
      
      months.forEach((monthData) => {
        console.log("Processing month:", monthData.month, "is_active:", monthData.is_active);
        const option = ddlMonths.querySelector(`option[value="${monthData.month}"]`);
        console.log("Found option for", monthData.month, ":", option);
        if (option) {
          // Add data attributes for plan tracking
          option.setAttribute('data-plan-id', currentPlanId);
          option.setAttribute('data-is-active', monthData.is_active);
          console.log("Set data attributes for", monthData.month, "- plan-id:", currentPlanId, "is-active:", monthData.is_active);
          
          // Add icon based on whether month has a plan (exists in monthly_plan_months table)
          const icon = monthData.is_active ? "🟢" : "🔴";
          const newText = `${icon} ${monthData.month}`;
          console.log("Updating option text from:", option.textContent, "to:", newText);
          option.textContent = newText;
          
          if (monthData.is_active) {
            option.style.backgroundColor = "#90EE90";
            option.style.color = "black";
            console.log("Set month", monthData.month, "as active with green icon");
          } else {
            option.style.backgroundColor = "#D3D3D3";
            option.style.color = "gray";
            console.log("Set month", monthData.month, "as inactive with red icon");
          }
        } else {
          console.log("Option not found for month:", monthData.month);
        }
      });
    } else {
      console.log("No months data available - keeping all months as red");
    }
    console.log("=== loadMonthlyMonths END (with API data) ===");
  }).catch((error) => {
    console.error("Error loading months:", error);
    alert("Error loading months: " + error);
  });
}

function updateTransactionTable(details) {
  const tbody = document.getElementById("transactionTableBody");
  tbody.innerHTML = "";
  const symbol = currencySymbols[currentCurrency] || '$';

  if (details && details.length > 0) {
    details.forEach((transaction) => {
      const row = tbody.insertRow();
      const balanceClass = transaction.balance < 0 ? "negative-balance" : "positive-balance";
      const amountClass = transaction.type === "income" ? "income-amount" : "payment-amount";
      const amountDisplay = transaction.type === "income" ? `+${symbol}${transaction.amount.toFixed(2)}` : `-${symbol}${transaction.amount.toFixed(2)}`;
      const typeDisplay = transaction.type === "income" ? "Income" : "Expense";
      const subtypeDisplay = transaction.subtype ? transaction.subtype.charAt(0).toUpperCase() + transaction.subtype.slice(1) : "";
      const formattedDate = formatDateToIsraeli(transaction.date);
      
      row.innerHTML = `
        <td>${formattedDate}</td>
        <td>${transaction.description}</td>
        <td>${typeDisplay}</td>
        <td>${subtypeDisplay}</td>
        <td class="${amountClass}">${amountDisplay}</td>
        <td class="${balanceClass}">${symbol}${transaction.balance.toFixed(2)}</td>
        <td><button onclick="deleteTransaction(${transaction.id}, '${transaction.type}')">Delete</button></td>
      `;
    });
  }
}

function loadPlans() {
  if (!window.pywebview || !window.pywebview.api) {
    console.error("API not available yet");
    return Promise.resolve();
  }

  return apiGetAllPlans().then((plans) => {
    console.log("Plans loaded:", plans);
    const ddl = document.getElementById("ddlPlans");
    ddl.innerHTML = '<option value="">-- Select a Plan --</option>';
    
    if (plans && plans.length > 0) {
      const planType = document.getElementById("ddlPlanType").value;
      console.log("Current plan type:", planType);
      
      // Filter plans based on current mode
      const filteredPlans = planType === "custom" 
        ? plans.filter(plan => !plan.name.includes("Monthly Plan"))
        : plans.filter(plan => plan.name.includes("Monthly Plan"));
      
      console.log("Filtered plans:", filteredPlans);
      
      filteredPlans.forEach((plan) => {
        const option = document.createElement("option");
        option.value = plan.id;
        option.text = plan.name;
        ddl.appendChild(option);
      });
    } else {
      console.log("No plans found in database");
    }
    return plans; // Return plans for chaining
  }).catch((error) => {
    console.error("Error loading plans:", error);
    alert("Error loading plans: " + error);
    return [];
  });
}

function selectPlan() {
  const ddl = document.getElementById("ddlPlans");
  currentPlanId = parseInt(ddl.value) || null;
  
  if (currentPlanId) {
    document.getElementById("financeContainer").style.display = "block";
    document.getElementById("btnDeletePlan").disabled = false;
    
    // Get plan details to determine if it's monthly
    // Note: We'll need to add a method to get plan type
    // For now, assume it's custom if no month data exists
    apiGetMonthlyPlanMonths(currentPlanId).then((months) => {
      if (months && months.length > 0) {
        currentPlanType = "monthly";
        document.getElementById("ddlPlanType").value = "monthly";
        onPlanTypeChange();
        generateMonthOptions(); // Generate month options first
        loadMonthlyMonths();
      } else {
        currentPlanType = "custom";
        document.getElementById("ddlPlanType").value = "custom";
        onPlanTypeChange();
      }
      
      // Load the saved initial balance for this plan
      apiGetPlanInitialBalance(currentPlanId).then((balance) => {
        document.getElementById("txtInitialBalance").value = balance;
        updateBalanceDisplay();
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
      
      loadTransactions();
    }).catch((error) => {
      console.error("Error checking plan type:", error);
    });
  } else {
    document.getElementById("financeContainer").style.display = "none";
    document.getElementById("btnDeletePlan").disabled = true;
    document.getElementById("txtInitialBalance").value = "";
    currentCurrency = 'USD';
    document.getElementById("ddlCurrency").value = 'USD';
    currentPlanType = 'custom';
    document.getElementById("ddlPlanType").value = 'custom';
    onPlanTypeChange();
  }
}

function createPlan() {
  const planName = document.getElementById("txtNewPlanName").value.trim();
  const planType = document.getElementById("ddlPlanType").value;
  if (!planName) {
    alert("Please enter a plan name.");
    return;
  }

  apiCreatePlan(planName, planType).then((response) => {
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
    // Currency saved successfully, no popup needed
  }).catch((error) => {
    console.error("Error saving currency:", error);
    alert("Error saving currency");
  });
}

function loadTransactions(isMonthActive = null) {
  if (!currentPlanId) return;
  
  const initialBalance = parseFloat(document.getElementById("txtInitialBalance").value) || 0;
  
  if (currentPlanType === "monthly") {
    // For monthly plans, load transactions for the selected month
    const selectedMonth = document.getElementById("ddlMonths").value;
    
    // Use the provided isMonthActive parameter, or get it from data attributes if not provided
    let monthIsActive = isMonthActive;
    if (monthIsActive === null) {
      // Get the active status from the selected option's data attribute
      const selectedOption = document.getElementById("ddlMonths").selectedOptions[0];
      if (selectedOption) {
        monthIsActive = selectedOption.getAttribute('data-is-active') === 'true';
      }
    }
    
    console.log("loadTransactions called with monthActive:", monthIsActive);
    
    // Show/hide transaction form based on whether month is active
    const transactionForm = document.querySelector("div[style*='Add Transaction']");
    if (transactionForm) {
      transactionForm.style.display = monthIsActive ? "block" : "none";
    }
    
    if (monthIsActive) {
      console.log("About to call apiGetCashFlowDetails with:", currentPlanId, initialBalance, selectedMonth);
      // Ensure finance container is visible
      document.getElementById("financeContainer").style.display = "block";
      // Load transactions only if month is active
      apiGetCashFlowDetails(currentPlanId, initialBalance, selectedMonth).then((details) => {
        console.log("Transactions loaded:", details);
        updateTransactionTable(details);
        updateBalanceDisplay();
      }).catch((error) => {
        console.error("Error loading monthly transactions:", error);
      });
    } else {
      // Clear transaction table and show message
      document.getElementById("transactionTableBody").innerHTML = '<td colspan="7" style="text-align: center;">Please start this month first to add transactions</td>';
      updateBalanceDisplay();
    }
  } else {
    // For custom plans, load all transactions
    apiGetCashFlowDetails(currentPlanId, initialBalance).then((details) => {
      updateTransactionTable(details);
      updateBalanceDisplay();
    }).catch((error) => {
      console.error("Error loading transactions:", error);
    });
  }
}

function addTransaction() {
  if (!currentPlanId) {
    alert("Please select a plan first.");
    return;
  }
  
  if (currentPlanType === "monthly") {
    const selectedMonth = document.getElementById("ddlMonths").value;
    if (!selectedMonth) {
      alert("Please select a month first.");
      return;
    }
    
    // Check if month is active before allowing transaction addition
    apiGetMonthlyPlanMonths(currentPlanId).then((months) => {
      const monthData = months ? months.find(m => m.month === selectedMonth) : null;
      const isMonthActive = monthData && monthData.is_active;
      
      if (!isMonthActive) {
        alert("Please start this month first before adding transactions.");
        return;
      }
      
      // Proceed with transaction addition
      proceedWithTransactionAddition(selectedMonth);
    }).catch((error) => {
      console.error("Error checking month status:", error);
    });
  } else {
    // For custom plans, proceed directly
    proceedWithTransactionAddition(null);
  }
}

function proceedWithTransactionAddition(month) {
  const type = document.getElementById("ddlTransactionType").value;
  const description = document.getElementById("txtTransactionDescription").value.trim();
  const date = document.getElementById("txtTransactionDate").value;
  const amount = parseFloat(document.getElementById("txtTransactionAmount").value);

  if (!description || !date || isNaN(amount) || amount <= 0) {
    alert("Please enter a valid description, date, and amount.");
    return;
  }

  // Get subtype for monthly plans
  const subtype = currentPlanType === "monthly" ? document.getElementById("ddlTransactionSubtype").value : 'regular';
  const monthParam = currentPlanType === "monthly" ? month : null;

  // HTML date input already returns ISO format (yyyy-mm-dd), so use it directly
  let apiCall;
  if (type === "income") {
    apiCall = apiAddIncome(currentPlanId, description, amount, date, subtype, monthParam);
  } else {
    apiCall = apiAddPayment(currentPlanId, description, amount, date, subtype, monthParam);
  }

  apiCall.then((response) => {
    // Clear form
    document.getElementById("txtTransactionDescription").value = "";
    document.getElementById("txtTransactionDate").value = "";
    document.getElementById("txtTransactionAmount").value = "";
    loadTransactions();
  }).catch((error) => {
    console.error(`Error adding ${type}:`, error);
    alert(`Error adding ${type}`);
  });
}

function deleteTransaction(transactionId, type) {
  if (confirm(`Delete this ${type === 'income' ? 'income' : 'expense'} entry?`)) {
    let apiCall;
    if (type === "income") {
      apiCall = apiDeleteIncome(transactionId);
    } else {
      apiCall = apiDeletePayment(transactionId);
    }
    
    apiCall.then((response) => {
      loadTransactions();
    }).catch((error) => {
      console.error(`Error deleting ${type}:`, error);
      alert(`Error deleting ${type}`);
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
    updateBalanceDisplay();
  }).catch((error) => {
    console.error("Error saving initial balance:", error);
    alert("Error saving initial balance");
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
