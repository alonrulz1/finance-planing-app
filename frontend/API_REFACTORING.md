# Frontend API Refactoring

## Overview
The frontend code has been refactored to separate API interactions from UI logic.

## File Structure

### `apiUtil.js`
Contains all API wrapper functions that handle communication with the backend. Each function:
- Checks if the API is available
- Wraps the pywebview API calls
- Returns promises for async handling
- Includes JSDoc documentation

**API Functions:**
- `apiGetAllPlans()` - Fetch all financial plans
- `apiCreatePlan(planName)` - Create a new plan
- `apiDeletePlan(planId)` - Delete a plan
- `apiGetPlanInitialBalance(planId)` - Get plan's initial balance
- `apiSetPlanInitialBalance(planId, balance)` - Set plan's initial balance
- `apiGetPlanCurrency(planId)` - Get plan's currency
- `apiSetPlanCurrency(planId, currency)` - Set plan's currency
- `apiGetIncomes(planId)` - Fetch incomes for a plan
- `apiAddIncome(planId, description, amount, date)` - Add income entry
- `apiDeleteIncome(incomeId)` - Delete income entry
- `apiGetPayments(planId)` - Fetch payments for a plan
- `apiAddPayment(planId, description, amount, date)` - Add payment entry
- `apiDeletePayment(paymentId)` - Delete payment entry
- `apiGetCashFlowDetails(planId, initialBalance)` - Get detailed cash flow

### `main.js`
Contains all UI logic and event handling:
- Event setup and tab switching
- Loading and displaying data from the API
- Form validation and user feedback
- UI state management

**Key Functions:**
- `setEvents()` - Setup all event listeners
- `switchTab(tabName)` - Switch between tabs
- `loadPlans()` - Load and display plans dropdown
- `selectPlan()` - Handle plan selection
- `createPlan()` - Create new plan UI logic
- `deletePlan()` - Delete plan UI logic
- `saveCurrency()` - Save currency selection
- `loadIncomes()` - Display incomes in table
- `loadPayments()` - Display payments in table
- `addIncome()` - Add income form handling
- `addPayment()` - Add payment form handling
- `deleteIncome()` - Delete income with confirmation
- `deletePayment()` - Delete payment with confirmation
- `saveInitialBalance()` - Save initial balance
- `calculateCashFlow()` - Display cash flow analysis

## Benefits of This Refactoring

1. **Separation of Concerns** - API logic is separate from UI logic
2. **Maintainability** - Easier to find and update API-related code
3. **Reusability** - API functions can be called from multiple places
4. **Testability** - API functions can be tested independently
5. **Consistency** - All API calls follow the same pattern
6. **Documentation** - JSDoc comments provide clear function descriptions

## Usage Pattern

All API calls in `main.js` now follow this pattern:

```javascript
apiFunction(parameters)
  .then((response) => {
    // Handle success - update UI
  })
  .catch((error) => {
    // Handle error - show user message
  });
```

This is consistent across all API interactions, making the code more predictable and easier to maintain.
