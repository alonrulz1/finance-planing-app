# Frontend Development Quick Reference

## File Structure

```
frontend/
├── constants.js          # All constants and configuration
├── dateUtil.js          # Date formatting and parsing utilities
├── uiManager.js         # DOM manipulation utilities
├── apiUtil.js           # API communication (existing)
├── main.js              # Application logic and event handling
├── style.css            # Styling
├── index.html           # HTML structure
└── libs/
    └── xlsx.full.min.js # Excel export library
```

## Script Load Order (Critical)

The scripts must load in this order in `index.html`:

1. `constants.js` - Defines all constants used by other modules
2. `dateUtil.js` - Date utilities (self-contained)
3. `uiManager.js` - DOM utilities (self-contained)
4. `apiUtil.js` - API utilities (uses window.pywebview)
5. `main.js` - Application logic (depends on all above)

Current order in `index.html`:
```html
<script src="constants.js"></script>
<script src="dateUtil.js"></script>
<script src="uiManager.js"></script>
<script src="apiUtil.js"></script>
<!-- HTML content -->
<script src="main.js"></script>
```

## Common Tasks

### Getting Element Values
```javascript
// Dropdown
const planType = getDropdownValue("ddlPlanType");

// Input field
const planName = getInputValue("txtNewPlanName");

// Selected option text
const planDisplayName = getDropdownSelectedText("ddlPlans");
```

### Setting Element Values
```javascript
setDropdownValue("ddlPlanType", PLAN_TYPES.MONTHLY);
setInputValue("txtInitialBalance", 1000);
setElementText("currentBalanceDisplay", "$1,000.00");
```

### Showing/Hiding Elements
```javascript
setElementVisibility("financeContainer", true);   // Show
setElementVisibility("financeContainer", false);  // Hide
```

### Working with Buttons
```javascript
setButtonState("btnDeletePlan", true);   // Enable
setButtonState("btnDeletePlan", false);  // Disable
```

### Date Handling
```javascript
// ISO to Israeli format
const display = formatDateToIsraeli("2024-04-13");  // "13-04-2024"

// Israeli to ISO format
const iso = parseIsraeliDate("13-04-2024");  // "2024-04-13"
```

### Currency Display
```javascript
const symbol = CURRENCY_SYMBOLS[currentCurrency];  // Get symbol
const display = `${symbol}${amount.toFixed(2)}`;   // "₪1,234.56"
```

### Working with Tables
```javascript
// Clear all rows
clearTableBody("transactionTableBody");

// Show "no data" message
showTableNoData("transactionTableBody", 7, "No transactions");

// Insert new row
const row = insertTableRow("transactionTableBody");
row.innerHTML = "<td>Data</td>";
```

### Dropdown Population
```javascript
// Simple population
populateDropdown("ddlCurrency", ["USD", "EUR", "GBP"], "-- Select Currency --");

// Update option display
const option = findDropdownOption("ddlMonths", "January");
updateDropdownOptionDisplay(option, ICONS.ACTIVE, true);
```

## Global State Variables

```javascript
let currentPlanId = null;              // Currently selected plan ID
let currentPlanType = PLAN_TYPES.CUSTOM;  // Current plan type
let currentCurrency = 'USD';           // Current currency
```

## Plan Types
```javascript
PLAN_TYPES.CUSTOM    // "custom"
PLAN_TYPES.MONTHLY   // "monthly"
```

## Transaction Types
```javascript
TRANSACTION_TYPES.INCOME   // "income"
TRANSACTION_TYPES.PAYMENT  // "payment"
```

## UI Icons
```javascript
ICONS.ACTIVE    // "🟢"
ICONS.INACTIVE  // "🔴"
```

## API Functions (from apiUtil.js)

### Plan Management
```javascript
apiGetAllPlans()
apiCreatePlan(name, type, initialBalance, currency)
apiDeletePlan(planId)
apiGetPlanInitialBalance(planId)
apiSetPlanInitialBalance(planId, balance)
apiGetPlanCurrency(planId)
apiSetPlanCurrency(planId, currency)
```

### Transactions
```javascript
apiAddIncome(planId, description, amount, date, subtype, month)
apiDeleteIncome(incomeId)
apiAddPayment(planId, description, amount, date, subtype, month)
apiDeletePayment(paymentId)
apiGetIncomes(planId, month)
apiGetPayments(planId, month)
apiGetCashFlowDetails(planId, initialBalance, month)
```

### Monthly Plans
```javascript
apiGetMonthlyPlanMonths(planId)
apiActivateMonth(planId, month)
apiCopyRegularTransactions(planId, fromMonth, toMonth)
```

## Main Functions

### Plan Operations
- `loadPlans()` - Load and display all plans
- `selectPlan()` - Handle plan selection
- `createPlan()` - Create new plan
- `deletePlan()` - Delete current plan
- `saveCurrency()` - Save plan currency
- `saveInitialBalance()` - Save initial balance

### Monthly Plan Operations
- `onPlanTypeChange()` - Switch between custom/monthly modes
- `loadMonthlyMonths()` - Load month data
- `onMonthChange()` - Handle month selection
- `startMonth()` - Activate a month
- `activateMonthForPlan()` - Activate month for specific plan

### Transaction Operations
- `loadTransactions()` - Load transactions for current plan
- `addTransaction()` - Add new transaction
- `deleteTransaction()` - Delete transaction
- `updateTransactionTable()` - Render transaction table
- `updateBalanceDisplay()` - Update balance display

### UI/Display Operations
- `updateTableHeaders()` - Update table column headers
- `formatCurrencyDisplay()` - Format amount as currency
- `getCurrentSelectedMonth()` - Get active month

### Export
- `exportCashFlow()` - Export to Excel

## Debug Tips

### Check Current State
```javascript
console.log(currentPlanId);      // Current plan
console.log(currentPlanType);    // Current mode
console.log(currentCurrency);    // Current currency
```

### API Debugging
All API calls log errors to console:
```javascript
// Check browser console for:
// "Error in apiGetAllPlans: [error message]"
```

### UI Element Debugging
```javascript
// Check if element exists
console.log(document.getElementById("ddlPlans"));

// Check element value
console.log(getDropdownValue("ddlPlans"));
```

## Common Patterns

### Load Data and Update UI
```javascript
apiGetAllPlans()
  .then((plans) => {
    console.log("Plans loaded:", plans);
    populatePlansDropdown(plans);
  })
  .catch((error) => {
    console.error("Error loading plans:", error);
    alert("Error loading plans: " + error);
  });
```

### Handle Form Submission
```javascript
function addTransaction() {
  const description = getInputValue("txtTransactionDescription").trim();
  const amount = parseFloat(getInputValue("txtTransactionAmount"));
  
  if (!description || isNaN(amount) || amount <= 0) {
    alert("Please enter valid data.");
    return;
  }
  
  apiAddTransaction(/* ... */)
    .then(() => {
      clearTransactionForm();
      loadTransactions();
    })
    .catch((error) => {
      alert("Error: " + error);
    });
}
```

### Conditional UI Display
```javascript
if (currentPlanType === PLAN_TYPES.MONTHLY) {
  setElementVisibility("monthlyPlanControls", true);
  setElementVisibility("customPlanControls", false);
} else {
  setElementVisibility("monthlyPlanControls", false);
  setElementVisibility("customPlanControls", true);
}
```

## Performance Notes

- DOM queries are performed each time utility functions are called
- For frequently accessed elements, consider caching the reference
- API calls already have error handling and logging
- State updates trigger full re-renders (consider optimization if needed)

## Adding New Features

1. **Update `constants.js`** if adding new constants
2. **Update `uiManager.js`** if adding new UI utilities
3. **Add functions to `main.js`** in appropriate section
4. **Update event listeners** in `initializeEventListeners()`
5. **Test in browser** - check console for errors

## Related Documentation

- Architecture: `/AGENTS.md`
- UI Guidelines: `/docs/ui-instructions.md`
- Backend: `/docs/backend-instructions.md`
- Refactoring Details: `/REFACTORING_NOTES.md`
