# Global Instructions for Agents

## Project Overview
This is a **Finance Planning Application** - a desktop and web-based tool for managing financial plans, tracking income, payments, and maintaining monthly cash flow projections.

**Application Name:** Cash Flow Manager  
**Stack:** Python (Backend) + JavaScript (Frontend) + SQLite (Database)

---

## Guidelines

Do not create additional md files unless requested to.

**⚠️ CRITICAL: Agents MUST read any relevant referenced documentation files BEFORE touching any code.**

### 1. Backend Development Guidelines
**Reference:** `/docs/backend-instructions.md`

### 2. Frontend/UI Development Guidelines
**Reference:** `/docs/ui-instructions.md`

### 3. Data Integrity Guidelines
**Requirements Before Submitting Changes:**
- ✅ Database schema is updated (if adding new fields)
- ✅ All getter/setter methods in API reflect schema changes
- ✅ Frontend receives and uses new data correctly
- ✅ Error handling is implemented at all layers (DB, API, Frontend)
- ✅ Migrations handle existing data appropriately

### 4. Code Review Checklist

Before touching any code, agents MUST:

1. **Read This Document** (`AGENTS.md`)
   - Understand project architecture
   - Review core features
   - Study development guidelines

2. **Read Relevant Documentation** (in `/docs`)
   - For backend work: Read `/docs/backend-instructions.md`
   - For frontend work: Read `/docs/ui-instructions.md`
   - For both: Read BOTH files

3. **Understand the Data Flow**
   - Frontend → Backend → Database
   - Identify all components that will be affected
   - Plan schema changes if needed

4. **Plan Your Changes**
   - List database schema changes
   - List API method changes
   - List frontend component changes
   - Document any migrations needed

5. **Implement in Correct Order**
   - Database schema (`finance_manager.py`)
   - API methods (`api.py`)
   - API utilities (`apiUtil.js`)
   - Frontend logic (`main.js`)
   - Styling and UI (`style.css`, `index.html`)

6. **Test Before Submitting**
   - Test with existing data
   - Test with new data
   - Verify error handling
   - Check UI state consistency
   - Validate API responses

### 5. Documentation Location Reference

| Document | Location | Focus |
|----------|----------|-------|
| **Global Instructions** | `AGENTS.md` (this file) | Project overview, architecture, feature map, guidelines |
| **Backend Guidelines** | `/docs/backend-instructions.md` | Database, API, data scheme requirements, error handling |
| **UI Guidelines** | `/docs/ui-instructions.md` | Frontend styling, API isolation, component grouping |

---

## Architecture

### Backend (Python)
- **`backend/app.py`** - Main application entry point using PyWebView for desktop UI
- **`backend/api.py`** - API interface exposing methods to frontend
- **`backend/finance_manager.py`** - Core business logic for financial plan management

### Frontend (JavaScript)
- **`frontend/index.html`** - Main HTML structure
- **`frontend/main.js`** - Frontend logic and event handling
- **`frontend/apiUtil.js`** - API utility functions for backend communication
- **`frontend/style.css`** - Styling
- **`frontend/libs/`** - External libraries (xlsx for spreadsheet functionality)

### Data & Configuration
- **`data/finance_plans.db`** - SQLite database storing all financial data
- **`config/translations.json`** - Internationalization strings

---

## Core Features

### 1. **Financial Plans Management**
- Create plans with customizable types (e.g., 'custom', other plan types)
- Set and retrieve initial balance
- Set and retrieve currency (default: USD)
- Get all plans
- Delete plans

**Related Files:**
- `backend/finance_manager.py` - `create_plan()`, `delete_plan()`, `get_all_plans()`
- `backend/api.py` - Plan management endpoints

### 2. **Monthly Planning**
- Activate specific months for a plan
- Get list of months in a monthly plan
- Copy regular transactions between months (for recurring items)
- Manage monthly plan months with active status tracking

**Related Files:**
- `backend/finance_manager.py` - `activate_month()`, `get_monthly_plan_months()`, `copy_regular_transactions()`
- `backend/api.py` - Monthly planning endpoints

### 3. **Income Management**
- Add income transactions with description, amount, and date
- Support different subtypes (e.g., 'regular', other types)
- Month-specific income entries
- Retrieve all incomes for a plan
- Delete income entries

**Related Files:**
- `backend/finance_manager.py` - `add_income()`, `get_incomes()`, `delete_income()`
- `backend/api.py` - Income endpoints

### 4. **Payment Management**
- Add payment transactions with description, amount, and date
- Support different subtypes (e.g., 'regular', other types)
- Month-specific payments
- Retrieve payments for a plan (with optional month filter)
- Delete payment entries

**Related Files:**
- `backend/finance_manager.py` - `add_payment()`, `get_payments()`, `delete_payment()`
- `backend/api.py` - Payment endpoints

### 5. **Data Persistence**
- SQLite database with proper schema and migrations
- Support for currency and balance tracking
- Automatic database initialization and schema creation

**Database Tables:**
- `financial_plans` - Main plans with name, type, initial balance, currency
- `incomes` - Income transactions
- `payments` - Payment transactions
- `monthly_plan_months` - Monthly tracking with active status

---

## Key Data Structures

### Financial Plan Object
```
{
  id: integer,
  name: string,
  plan_type: string (default: 'custom'),
  initial_balance: float (default: 0),
  currency: string (default: 'USD')
}
```

### Transaction Objects (Income/Payment)
```
{
  id: integer,
  plan_id: integer,
  description: string,
  amount: float,
  date: string,
  subtype: string (default: 'regular'),
  month: string (optional)
}
```

### Monthly Plan Month Object
```
{
  id: integer,
  plan_id: integer,
  month: string,
  is_active: boolean (default: false)
}
```

---

## API Communication Pattern

### Backend → Frontend Communication
1. Frontend calls methods on the Python API object through PyWebView
2. API methods delegate to FinanceManager
3. FinanceManager handles database operations
4. Results are returned to frontend as JSON

### Example Flow
```
Frontend (apiUtil.js) 
  → Backend (api.py endpoint) 
  → Backend (finance_manager.py method) 
  → Database (SQLite) 
  → Response back to Frontend
```

---

## Development Guidelines

### When Working on Feature Enhancements

1. **Identify the Feature Scope:**
   - Does it involve plan management?
   - Does it involve transactions (income/payments)?
   - Does it involve monthly planning?
   - Does it require new database tables or columns?

2. **Update Components in Order:**
   - Database layer (`finance_manager.py`)
   - API layer (`api.py`)
   - Frontend utilities (`apiUtil.js`)
   - UI/UX (`main.js`, `index.html`, `style.css`)

3. **Follow Data Flow:**
   - Ensure all new data attributes are properly persisted
   - Maintain consistency between database schema and object structures
   - Handle migrations for existing databases

4. **Testing Considerations:**
   - Test database operations with existing and new data
   - Verify API endpoints return correct data
   - Validate frontend UI responds appropriately to new data

---

## Referenced Documentation

For specific feature details, review the following resources:

- **Feature-specific docs:** Check `/docs` folder for detailed feature documentation
- **Translations:** See `config/translations.json` for supported languages and UI strings
- **Database schema:** See initialization code in `backend/finance_manager.py`

### How Agents Should Use This Document

1. **Initial Review:** Read this document to understand project structure and core features
2. **Feature Identification:** Identify which components your task affects
3. **Referenced Docs:** Look for specific feature documentation in the `/docs` folder
4. **Implementation:** Follow the architecture pattern established in the codebase
5. **Testing:** Ensure changes maintain data integrity and API contracts

---

## Common Tasks Reference

| Task | Primary Files | Key Methods |
|------|---------------|-------------|
| Add new transaction type | `finance_manager.py`, `api.py`, `main.js` | `add_income()`, `add_payment()` |
| Create new plan type | `finance_manager.py`, `api.py`, frontend | `create_plan()` |
| Add monthly feature | `finance_manager.py`, `api.py`, `monthly_plan_months` table | `activate_month()`, `get_monthly_plan_months()` |
| Modify plan properties | `finance_manager.py`, `api.py` | Getter/setter methods |
| Export data | `frontend/libs/xlsx.full.min.js` | Spreadsheet integration |
| Add translations | `config/translations.json` | UI string updates |

---

## Important Constraints

- **Desktop Environment:** Application runs in PyWebView (embedded Chromium)
- **Database:** SQLite with automatic schema migrations
- **Frontend Framework:** Vanilla JavaScript (no framework dependencies)
- **File Security:** File serving has security checks to prevent path traversal
- **Default Currency:** USD (can be customized per plan)

---

## Error Handling Guidelines

- Database errors should be caught and logged
- API errors should return meaningful messages to frontend
- Frontend should gracefully handle API failures
- User feedback should be provided for all operations (success/error states)

---

**Last Updated:** April 2026  
**For Questions:** Review corresponding documentation in `/docs` folder or examine code examples in related files.
