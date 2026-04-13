// ============================================================================
// Global Constants and Configuration
// ============================================================================

const CURRENCY_SYMBOLS = {
  'USD': '$',
  'ILS': '₪',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥'
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const PLAN_TYPES = {
  CUSTOM: 'custom',
  MONTHLY: 'monthly'
};

const TRANSACTION_TYPES = {
  INCOME: 'income',
  PAYMENT: 'payment'
};

const TRANSACTION_SUBTYPES = {
  REGULAR: 'regular'
};

const ICONS = {
  ACTIVE: '🟢',
  INACTIVE: '🔴'
};

// ============================================================================
// Global State Management
// ============================================================================

let currentPlanId = null;
let currentPlanType = 'custom'; // Default to custom plan type
let currentCurrency = 'USD';

// ============================================================================
// Application Initialization
// ============================================================================

/**
 * Initialize the application
 */
function initializeApp() {
  initializeEventListeners();
  loadPlans();
}

/**
 * Wait for PyWebView API to be available, then initialize
 */
window.addEventListener('pywebviewready', function() {
  initializeApp();
});

/**
 * Set up all event listeners for the application
 */
function initializeEventListeners() {
  // Plan management events
  document.getElementById("btnCreatePlan").onclick = createPlan;
  document.getElementById("btnDeletePlan").onclick = deletePlan;
  document.getElementById("ddlPlans").onchange = selectPlan;
  
  // Plan configuration events
  document.getElementById("btnSaveCurrency").onclick = saveCurrency;
  document.getElementById("btnSaveInitialBalance").onclick = saveInitialBalance;
  document.getElementById("ddlPlanType").onchange = onPlanTypeChange;
  
  // Monthly plan events
  document.getElementById("ddlMonths").onchange = onMonthChange;
  document.getElementById("btnStartMonth").onclick = startMonth;
  
  // Transaction events
  document.getElementById("btnAddTransaction").onclick = addTransaction;
  
  // Export events
  const exportBtn = document.getElementById("btnExportCashFlow");
  if (exportBtn) {
    exportBtn.onclick = exportCashFlow;
  }
  
  // Initialize table headers (guard against missing PLAN_TYPES)
  if (typeof PLAN_TYPES !== 'undefined') {
    updateTableHeaders();
  }
}



// ============================================================================
// Balance and Transaction Display
// ============================================================================

/**
 * Update the current balance display and transaction table
 */
function updateBalanceDisplay() {
  const initialBalance = parseFloat(getInputValue("txtInitialBalance")) || 0;
  
  if (!currentPlanId) {
    setElementText("currentBalanceDisplay", formatCurrencyDisplay(0));
    return;
  }

  // Get detailed cash flow to calculate current balance
  apiGetCashFlowDetails(currentPlanId, initialBalance, getCurrentSelectedMonth()).then((details) => {
    if (details && details.length > 0) {
      const lastTransaction = details[details.length - 1];
      setElementText("currentBalanceDisplay", formatCurrencyDisplay(lastTransaction.balance));
      updateTransactionTable(details);
    } else {
      setElementText("currentBalanceDisplay", formatCurrencyDisplay(initialBalance));
      const colspanValue = currentPlanType === PLAN_TYPES.MONTHLY ? 7 : 6;
      showTableNoData("transactionTableBody", colspanValue, "No transactions");
    }
  }).catch((error) => {
    console.error("Error updating balance display:", error);
  });
}

/**
 * Format a number as currency with appropriate symbol
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrencyDisplay(amount) {
  const symbol = CURRENCY_SYMBOLS[currentCurrency] || '$';
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Get the currently selected month (for monthly plans)
 * @returns {string|null} The selected month or null if not applicable
 */
function getCurrentSelectedMonth() {
  if (currentPlanType === PLAN_TYPES.MONTHLY) {
    return getDropdownValue("ddlMonths");
  }
  return null;
}

/**
 * Update transaction table with details
 * @param {Array} details - Array of transaction detail objects
 */
function updateTransactionTable(details) {
  clearTableBody("transactionTableBody");
  const symbol = CURRENCY_SYMBOLS[currentCurrency] || '$';

  if (details && details.length > 0) {
    details.forEach((transaction) => {
      const row = insertTableRow("transactionTableBody");
      
      const balanceClass = transaction.balance < 0 ? "negative-balance" : "positive-balance";
      const amountClass = transaction.type === TRANSACTION_TYPES.INCOME ? "income-amount" : "payment-amount";
      const amountDisplay = transaction.type === TRANSACTION_TYPES.INCOME 
        ? `+${symbol}${transaction.amount.toFixed(2)}` 
        : `-${symbol}${transaction.amount.toFixed(2)}`;
      const typeDisplay = transaction.type === TRANSACTION_TYPES.INCOME ? "Income" : "Expense";
      const subtypeDisplay = transaction.subtype ? capitalizeString(transaction.subtype) : "";
      const formattedDate = formatDateToIsraeli(transaction.date);
      
      // Build row HTML based on plan type
      let rowHTML = `
        <td>${formattedDate}</td>
        <td>${transaction.description}</td>
        <td>${typeDisplay}</td>`;
      
      // Only add subtype column for monthly plans
      if (currentPlanType === PLAN_TYPES.MONTHLY) {
        rowHTML += `<td>${subtypeDisplay}</td>`;
      }
      
      rowHTML += `
        <td class="${amountClass}">${amountDisplay}</td>
        <td class="${balanceClass}">${symbol}${transaction.balance.toFixed(2)}</td>
        <td><button onclick="deleteTransaction(${transaction.id}, '${transaction.type}')">Delete</button></td>
      `;
      
      row.innerHTML = rowHTML;
    });
  }
  
  // Update table headers dynamically
  updateTableHeaders();
}

/**
 * Capitalize first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeString(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Update table headers based on current plan type
 */
function updateTableHeaders() {
  const thead = document.querySelector("table thead tr");
  if (!thead) return;
  
  // Clear existing headers
  thead.innerHTML = '';
  
  // Add standard columns
  const headerCells = ["Date", "Description", "Type"];
  
  // Add subtype only for monthly plans (guard against missing PLAN_TYPES)
  if (typeof PLAN_TYPES !== 'undefined' && currentPlanType === PLAN_TYPES.MONTHLY) {
    headerCells.push("Subtype");
  }
  
  // Add remaining columns
  headerCells.push("Amount", "Balance", "Action");
  
  // Create header cells
  headerCells.forEach(headerText => {
    const th = document.createElement("th");
    th.textContent = headerText;
    thead.appendChild(th);
  });
}



// ============================================================================
// Plan Type Management
// ============================================================================

/**
 * Handle plan type change (between custom and monthly)
 */
function onPlanTypeChange() {
  console.log("=== onPlanTypeChange START ===");
  const planType = getDropdownValue("ddlPlanType");
  console.log("Plan type changed to:", planType);
  
  currentPlanType = planType;
  
  if (planType === PLAN_TYPES.MONTHLY) {
    enableMonthlyMode();
  } else {
    enableCustomMode();
  }
  
  console.log("=== onPlanTypeChange END ===");
}

/**
 * Switch UI to monthly plan mode
 */
function enableMonthlyMode() {
  console.log("Switching to monthly mode");
  
  setElementVisibility("customPlanSelection", false);
  setElementVisibility("monthlyPlanSelection", true);
  setElementVisibility("customPlanControls", false);
  setElementVisibility("monthlyPlanControls", true);
  
  document.getElementById("ddlTransactionSubtype").style.display = "inline-block";
  
  // Generate month options
  populateMonthDropdown();
  
  // Auto-select first monthly plan if no plan is selected
  if (!currentPlanId) {
    selectFirstMonthlyPlan();
  } else {
    loadMonthlyMonths();
  }
}

/**
 * Switch UI to custom plan mode
 */
function enableCustomMode() {
  console.log("Switching to custom mode");
  
  setElementVisibility("customPlanSelection", true);
  setElementVisibility("monthlyPlanSelection", false);
  setElementVisibility("customPlanControls", true);
  setElementVisibility("monthlyPlanControls", false);
  
  document.getElementById("ddlTransactionSubtype").style.display = "none";
  
  // Auto-select first custom plan if no plan is selected
  if (!currentPlanId) {
    selectFirstCustomPlan();
  }
}

/**
 * Populate month dropdown with all months
 */
function populateMonthDropdown() {
  console.log("Generating month options...");
  populateDropdown("ddlMonths", MONTHS, "-- Select Month --");
}

/**
 * Find and select first monthly plan
 */
function selectFirstMonthlyPlan() {
  console.log("No plan selected, looking for first monthly plan...");
  apiGetAllPlans().then((plans) => {
    const monthlyPlan = plans.find(p => p.name.includes("Monthly Plan"));
    if (monthlyPlan) {
      console.log("Found monthly plan:", monthlyPlan);
      currentPlanId = monthlyPlan.id;
      setDropdownValue("ddlPlans", monthlyPlan.id);
    }
    loadMonthlyMonths();
  }).catch((error) => {
    console.error("Error getting plans:", error);
  });
}

/**
 * Find and select first custom plan
 */
function selectFirstCustomPlan() {
  console.log("No plan selected, looking for first custom plan...");
  apiGetAllPlans().then((plans) => {
    const customPlan = plans.find(p => !p.name.includes("Monthly Plan"));
    if (customPlan) {
      console.log("Found custom plan:", customPlan);
      currentPlanId = customPlan.id;
      setDropdownValue("ddlPlans", customPlan.id);
    }
  }).catch((error) => {
    console.error("Error getting plans:", error);
  });
}



// ============================================================================
// Monthly Plan Management
// ============================================================================

/**
 * Handle month selection change
 */
function onMonthChange() {
  const selectedMonth = getDropdownValue("ddlMonths");
  if (!selectedMonth) return;
  
  const planId = getSelectedOptionDataAttribute("ddlMonths", "plan-id");
  const isActive = getSelectedOptionDataAttribute("ddlMonths", "is-active") === 'true';
  
  console.log("Month changed to:", selectedMonth, "- Active:", isActive);
  
  if (!planId) {
    showMonthNotStartedMessage();
    return;
  }
  
  // Update currentPlanId if different
  if (planId !== currentPlanId.toString()) {
    currentPlanId = parseInt(planId);
  }
  
  // Load transactions based on whether month is active
  if (isActive) {
    loadTransactions(true);
  } else {
    showMonthNotStartedMessage();
  }
}

/**
 * Show message that month hasn't been started yet
 */
function showMonthNotStartedMessage() {
  showTableNoData("transactionTableBody", 7, "Please start this month first to add transactions");
  setElementVisibility("financeContainer", false);
}

/**
 * Start/activate a month for the current plan
 */
function startMonth() {
  const selectedMonth = getDropdownValue("ddlMonths");
  if (!selectedMonth) {
    alert("Please select a month first.");
    return;
  }
  
  let planId = currentPlanId;
  
  // If no plan is selected, create a new monthly plan first
  if (!planId) {
    createNewMonthlyPlanAndStart(selectedMonth);
  } else {
    activateMonthForPlan(planId, selectedMonth);
  }
}

/**
 * Create a new monthly plan and activate the selected month
 * @param {string} selectedMonth - The month to activate
 */
function createNewMonthlyPlanAndStart(selectedMonth) {
  const planName = `${selectedMonth} ${new Date().getFullYear()} Monthly Plan`;
  console.log("Creating new monthly plan:", planName);
  
  apiCreatePlan(planName, PLAN_TYPES.MONTHLY).then((response) => {
    console.log("Plan created:", response);
    loadPlans().then(() => {
      apiGetAllPlans().then((plans) => {
        const newPlan = plans.find(p => p.name === planName);
        if (newPlan) {
          currentPlanId = newPlan.id;
          setDropdownValue("ddlPlans", newPlan.id);
          activateMonthForPlan(newPlan.id, selectedMonth);
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
}

/**
 * Activate a month for a specific plan
 * @param {number} planId - The plan ID
 * @param {string} selectedMonth - The month to activate
 */
function activateMonthForPlan(planId, selectedMonth) {
  console.log("Activating month:", selectedMonth, "for plan:", planId);
  
  apiActivateMonth(planId, selectedMonth).then((result) => {
    console.log("Month activation result:", result);
    if (result.success) {
      handleSuccessfulMonthActivation(selectedMonth, result);
    } else {
      alert("Error starting month");
    }
  }).catch((error) => {
    console.error("Error starting month:", error);
    alert("Error starting month");
  });
}

/**
 * Handle successful month activation
 * @param {string} selectedMonth - The activated month
 * @param {object} result - The activation result from API
 */
function handleSuccessfulMonthActivation(selectedMonth, result) {
  // Show finance container and enable delete button
  setElementVisibility("financeContainer", "block");
  setButtonState("btnDeletePlan", true);
  
  // Update the month option display to green
  const option = findDropdownOption("ddlMonths", selectedMonth);
  if (option) {
    updateDropdownOptionDisplay(option, ICONS.ACTIVE, true);
    setDropdownValue("ddlMonths", selectedMonth);
  }
  
  // Load transactions for the newly activated month
  loadTransactions();
  
  // Ask about copying transactions from previous month
  if (result.previous_month) {
    askAboutCopyingPreviousMonthTransactions(planId, result.previous_month, selectedMonth);
  }
}

/**
 * Check previous month and ask if user wants to copy transactions
 * @param {number} planId - The plan ID
 * @param {string} previousMonth - The previous month
 * @param {string} selectedMonth - The current month
 */
function askAboutCopyingPreviousMonthTransactions(planId, previousMonth, selectedMonth) {
  apiGetMonthlyPlanMonths(currentPlanId).then((months) => {
    const previousMonthData = months ? months.find(m => m.month === previousMonth) : null;
    const isPreviousMonthActive = previousMonthData && previousMonthData.is_active;
    
    console.log("Previous month:", previousMonth, "Is active:", isPreviousMonthActive);
    
    if (isPreviousMonthActive) {
      checkPreviousMonthTransactionsAndCopy(planId, previousMonth, selectedMonth);
    }
  }).catch((error) => {
    console.error("Error checking previous month status:", error);
  });
}

/**
 * Check if previous month has transactions and ask to copy them
 * @param {number} planId - The plan ID
 * @param {string} previousMonth - The previous month
 * @param {string} selectedMonth - The current month
 */
function checkPreviousMonthTransactionsAndCopy(planId, previousMonth, selectedMonth) {
  Promise.all([
    apiGetIncomes(planId, previousMonth),
    apiGetPayments(planId, previousMonth)
  ]).then(([incomes, payments]) => {
    const hasTransactions = (incomes && incomes.length > 0) || (payments && payments.length > 0);
    
    console.log("Previous month has transactions:", hasTransactions);
    
    if (hasTransactions && confirm("Do you want to copy regular transactions from previous month?")) {
      apiCopyRegularTransactions(planId, previousMonth, selectedMonth).then(() => {
        loadTransactions();
      }).catch((error) => {
        console.error("Error copying transactions:", error);
        alert("Error copying transactions");
      });
    }
  }).catch((error) => {
    console.error("Error checking previous month transactions:", error);
  });
}

/**
 * Load and display monthly plan months with their active status
 */
function loadMonthlyMonths() {
  console.log("=== loadMonthlyMonths START ===");
  
  if (currentPlanType !== PLAN_TYPES.MONTHLY) {
    console.log("Returning early - not monthly plan");
    return;
  }
  
  // Generate month options first
  populateMonthDropdown();
  
  if (!currentPlanId) {
    setAllMonthsToInactive();
    return;
  }
  
  console.log("Calling API with planId:", currentPlanId);
  apiGetMonthlyPlanMonths(currentPlanId).then((months) => {
    console.log("API returned months:", months);
    updateMonthlyPlansDisplay(months);
    console.log("=== loadMonthlyMonths END (with API data) ===");
  }).catch((error) => {
    console.error("Error loading months:", error);
    alert("Error loading months: " + error);
  });
}

/**
 * Set all months to inactive display
 */
function setAllMonthsToInactive() {
  console.log("Setting all months to inactive");
  const options = getDropdownOptions("ddlMonths");
  options.forEach((option) => {
    if (option.value) {
      updateDropdownOptionDisplay(option, ICONS.INACTIVE, false);
      option.removeAttribute('data-plan-id');
      option.removeAttribute('data-is-active');
    }
  });
}

/**
 * Update the display of monthly plans based on their active status
 * @param {Array} months - Array of month objects from API
 */
function updateMonthlyPlansDisplay(months) {
  // First, set all months to inactive by default
  const options = getDropdownOptions("ddlMonths");
  options.forEach((option) => {
    if (option.value) {
      updateDropdownOptionDisplay(option, ICONS.INACTIVE, false);
      option.removeAttribute('data-plan-id');
      option.removeAttribute('data-is-active');
    }
  });
  
  // Then update months that exist in database
  if (months && months.length > 0) {
    months.forEach((monthData) => {
      console.log("Processing month:", monthData.month, "is_active:", monthData.is_active);
      const option = findDropdownOption("ddlMonths", monthData.month);
      if (option) {
        // Add data attributes for plan tracking
        option.setAttribute('data-plan-id', currentPlanId);
        option.setAttribute('data-is-active', monthData.is_active);
        
        // Update display
        updateDropdownOptionDisplay(option, 
          monthData.is_active ? ICONS.ACTIVE : ICONS.INACTIVE, 
          monthData.is_active);
      }
    });
  }
}


// ============================================================================
// Plan Management
// ============================================================================

/**
 * Load all plans and populate the plan dropdown
 */
function loadPlans() {
  if (!window.pywebview || !window.pywebview.api) {
    console.error("API not available yet");
    return;
  }

  apiGetAllPlans().then((plans) => {
    console.log("Plans loaded:", plans);
    
    const planType = getDropdownValue("ddlPlanType");
    console.log("Current plan type:", planType);
    
    // Filter plans based on current mode
    const filteredPlans = planType === PLAN_TYPES.CUSTOM 
      ? plans.filter(plan => !plan.name.includes("Monthly Plan"))
      : plans.filter(plan => plan.name.includes("Monthly Plan"));
    
    console.log("Filtered plans:", filteredPlans);
    populatePlansDropdown(filteredPlans);
    
    return plans;
  }).catch((error) => {
    console.error("Error loading plans:", error);
    alert("Error loading plans: " + error);
    return [];
  });
}

/**
 * Populate the plans dropdown with available plans
 * @param {Array} plans - Array of plan objects
 */
function populatePlansDropdown(plans) {
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
}

/**
 * Handle plan selection
 */
function selectPlan() {
  currentPlanId = parseInt(getDropdownValue("ddlPlans")) || null;
  
  if (currentPlanId) {
    loadSelectedPlanDetails();
  } else {
    clearPlanSelection();
  }
}

/**
 * Load currency and balance for selected plan
 */
function loadSelectedPlanDetails() {
  setElementVisibility("financeContainer", true);
  setButtonState("btnDeletePlan", true);
  
  // Load plan details
  Promise.all([
    apiGetPlanCurrency(currentPlanId),
    apiGetPlanInitialBalance(currentPlanId)
  ]).then(([currency, initialBalance]) => {
    currentCurrency = currency;
    setDropdownValue("ddlCurrency", currency);
    setInputValue("txtInitialBalance", initialBalance);
    
    // Determine plan type (monthly or custom) based on existing months
    return apiGetMonthlyPlanMonths(currentPlanId);
  }).then((months) => {
    if (months && months.length > 0) {
      currentPlanType = PLAN_TYPES.MONTHLY;
      setDropdownValue("ddlPlanType", PLAN_TYPES.MONTHLY);
      onPlanTypeChange();
    } else {
      currentPlanType = PLAN_TYPES.CUSTOM;
      setDropdownValue("ddlPlanType", PLAN_TYPES.CUSTOM);
      onPlanTypeChange();
    }
    
    // Finally load transactions
    loadTransactions();
  }).catch((error) => {
    console.error("Error loading plan details:", error);
  });
}

/**
 * Clear plan selection and reset UI
 */
function clearPlanSelection() {
  setElementVisibility("financeContainer", false);
  setButtonState("btnDeletePlan", false);
  setInputValue("txtInitialBalance", "");
  currentCurrency = 'USD';
  setDropdownValue("ddlCurrency", 'USD');
  currentPlanType = PLAN_TYPES.CUSTOM;
  setDropdownValue("ddlPlanType", PLAN_TYPES.CUSTOM);
  onPlanTypeChange();
}

/**
 * Create a new plan
 */
function createPlan() {
  const planName = getInputValue("txtNewPlanName").trim();
  const planType = getDropdownValue("ddlPlanType");
  const initialBalance = parseFloat(getInputValue("txtInitialBalance")) || 0;
  const currency = getDropdownValue("ddlCurrency") || 'USD';
  
  if (!planName) {
    alert("Please enter a plan name.");
    return;
  }

  apiCreatePlan(planName, planType, initialBalance, currency).then((response) => {
    clearInput("txtNewPlanName");
    loadPlans();
  }).catch((error) => {
    console.error("Error creating plan:", error);
    alert("Error creating plan");
  });
}

/**
 * Delete the current plan
 */
function deletePlan() {
  if (!currentPlanId) return;
  
  if (confirm("Are you sure you want to delete this plan? This action cannot be undone.")) {
    apiDeletePlan(currentPlanId).then((response) => {
      currentPlanId = null;
      setDropdownValue("ddlPlans", "");
      clearPlanSelection();
      loadPlans();
    }).catch((error) => {
      console.error("Error deleting plan:", error);
      alert("Error deleting plan");
    });
  }
}

/**
 * Save plan currency
 */
function saveCurrency() {
  if (!currentPlanId) {
    alert("Please select a plan first.");
    return;
  }

  const currency = getDropdownValue("ddlCurrency");
  currentCurrency = currency;

  apiSetPlanCurrency(currentPlanId, currency).then((response) => {
    // Currency saved successfully
    updateBalanceDisplay();
  }).catch((error) => {
    console.error("Error saving currency:", error);
    alert("Error saving currency");
  });
}

/**
 * Save initial balance for plan
 */
function saveInitialBalance() {
  if (!currentPlanId) {
    alert("Please select a plan first.");
    return;
  }

  const initialBalance = parseFloat(getInputValue("txtInitialBalance"));

  if (isNaN(initialBalance)) {
    alert("Please enter a valid initial balance.");
    return;
  }

  if (initialBalance < 0) {
    alert("Initial balance cannot be negative.");
    return;
  }

  apiSetPlanInitialBalance(currentPlanId, initialBalance).then((response) => {
    updateBalanceDisplay();
  }).catch((error) => {
    console.error("Error saving initial balance:", error);
    alert("Error saving initial balance");
  });
}



// ============================================================================
// Transaction Management
// ============================================================================

/**
 * Load transactions for the current plan
 * @param {boolean} isMonthActive - Whether the current month is active (for monthly plans)
 */
function loadTransactions(isMonthActive = null) {
  if (!currentPlanId) return;
  
  const initialBalance = parseFloat(getInputValue("txtInitialBalance")) || 0;
  
  if (currentPlanType === PLAN_TYPES.MONTHLY) {
    loadMonthlyTransactions(initialBalance, isMonthActive);
  } else {
    loadCustomTransactions(initialBalance);
  }
}

/**
 * Load transactions for a monthly plan
 * @param {number} initialBalance - The initial balance
 * @param {boolean} isMonthActive - Whether the month is active
 */
function loadMonthlyTransactions(initialBalance, isMonthActive) {
  const selectedMonth = getDropdownValue("ddlMonths");
  
  // Determine if month is active
  let monthIsActive = isMonthActive;
  if (monthIsActive === null) {
    const activeAttr = getSelectedOptionDataAttribute("ddlMonths", "is-active");
    monthIsActive = activeAttr === 'true';
  }
  
  console.log("Loading monthly transactions - Month active:", monthIsActive);
  
  // Show/hide transaction form based on active status
  const transactionForm = document.querySelector("div[style*='Add Transaction']");
  if (transactionForm) {
    transactionForm.style.display = monthIsActive ? "block" : "none";
  }
  
  if (monthIsActive) {
    setElementVisibility("financeContainer", true);
    apiGetCashFlowDetails(currentPlanId, initialBalance, selectedMonth).then((details) => {
      console.log("Monthly transactions loaded:", details);
      updateTransactionTable(details);
      updateBalanceDisplay();
    }).catch((error) => {
      console.error("Error loading monthly transactions:", error);
    });
  } else {
    showTableNoData("transactionTableBody", 7, "Please start this month first to add transactions");
    updateBalanceDisplay();
  }
}

/**
 * Load transactions for a custom plan
 * @param {number} initialBalance - The initial balance
 */
function loadCustomTransactions(initialBalance) {
  apiGetCashFlowDetails(currentPlanId, initialBalance).then((details) => {
    updateTransactionTable(details);
    updateBalanceDisplay();
  }).catch((error) => {
    console.error("Error loading transactions:", error);
  });
}

/**
 * Add a new transaction (income or expense)
 */
function addTransaction() {
  if (!currentPlanId) {
    alert("Please select a plan first.");
    return;
  }
  
  if (currentPlanType === PLAN_TYPES.MONTHLY) {
    const selectedMonth = getDropdownValue("ddlMonths");
    if (!selectedMonth) {
      alert("Please select a month first.");
      return;
    }
    
    checkMonthActiveAndAddTransaction(selectedMonth);
  } else {
    proceedWithTransactionAddition(null);
  }
}

/**
 * Check if month is active before allowing transaction addition
 * @param {string} selectedMonth - The selected month
 */
function checkMonthActiveAndAddTransaction(selectedMonth) {
  apiGetMonthlyPlanMonths(currentPlanId).then((months) => {
    const monthData = months ? months.find(m => m.month === selectedMonth) : null;
    const isMonthActive = monthData && monthData.is_active;
    
    if (!isMonthActive) {
      alert("Please start this month first before adding transactions.");
      return;
    }
    
    proceedWithTransactionAddition(selectedMonth);
  }).catch((error) => {
    console.error("Error checking month status:", error);
  });
}

/**
 * Proceed with adding a transaction
 * @param {string} month - The month (null for custom plans)
 */
function proceedWithTransactionAddition(month) {
  const type = getDropdownValue("ddlTransactionType");
  const description = getInputValue("txtTransactionDescription").trim();
  const date = getInputValue("txtTransactionDate");
  const amount = parseFloat(getInputValue("txtTransactionAmount"));

  if (!description || !date || isNaN(amount) || amount <= 0) {
    alert("Please enter a valid description, date, and amount.");
    return;
  }

  // Get subtype for monthly plans
  const subtype = currentPlanType === PLAN_TYPES.MONTHLY 
    ? getDropdownValue("ddlTransactionSubtype") 
    : TRANSACTION_SUBTYPES.REGULAR;

  // Add transaction via API
  const apiCall = type === TRANSACTION_TYPES.INCOME
    ? apiAddIncome(currentPlanId, description, amount, date, subtype, month)
    : apiAddPayment(currentPlanId, description, amount, date, subtype, month);

  apiCall.then((response) => {
    clearTransactionForm();
    loadTransactions();
  }).catch((error) => {
    console.error(`Error adding ${type}:`, error);
    alert(`Error adding ${type}`);
  });
}

/**
 * Clear the transaction input form
 */
function clearTransactionForm() {
  clearInput("txtTransactionDescription");
  clearInput("txtTransactionDate");
  clearInput("txtTransactionAmount");
}

/**
 * Delete a transaction
 * @param {number} transactionId - The transaction ID
 * @param {string} type - The transaction type (income or payment)
 */
function deleteTransaction(transactionId, type) {
  const typeLabel = type === TRANSACTION_TYPES.INCOME ? 'income' : 'expense';
  if (confirm(`Delete this ${typeLabel} entry?`)) {
    const apiCall = type === TRANSACTION_TYPES.INCOME
      ? apiDeleteIncome(transactionId)
      : apiDeletePayment(transactionId);
    
    apiCall.then((response) => {
      loadTransactions();
    }).catch((error) => {
      console.error(`Error deleting ${type}:`, error);
      alert(`Error deleting ${type}`);
    });
  }
}



// ============================================================================
// Export and Reporting
// ============================================================================

/**
 * Export cash flow details to an Excel file
 */
function exportCashFlow() {
  if (!currentPlanId) {
    alert("Please select a plan first.");
    return;
  }

  const initialBalance = parseFloat(getInputValue("txtInitialBalance"));

  if (isNaN(initialBalance)) {
    alert("Please enter a valid initial balance.");
    return;
  }

  try {
    // Load XLSX library first, then proceed with export
    loadXLSXLibrary().then(() => {
      performCashFlowExport(initialBalance);
    }).catch((error) => {
      console.error("Error loading XLSX library:", error);
      alert("Error loading XLSX library: " + error);
    });
  } catch (error) {
    console.error("Export error:", error);
    alert("Error during export: " + error.message);
  }
}

/**
 * Perform the actual cash flow export
 * @param {number} initialBalance - The initial balance
 */
function performCashFlowExport(initialBalance) {
  apiGetCashFlowDetails(currentPlanId, initialBalance).then((details) => {
    if (!details || details.length === 0) {
      alert("No cash flow data to export. Please add some transactions first.");
      return;
    }
    
    const planName = getDropdownSelectedText("ddlPlans");
    const symbol = CURRENCY_SYMBOLS[currentCurrency] || '$';
    
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
}
