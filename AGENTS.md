# Global Instructions for Agents

## 🚀 BEFORE YOU START

**Cash Flow Manager** - A Finance Planning Application (Python Backend + JavaScript Frontend + SQLite)

### Read These FIRST (in order):
1. `/docs/backend-instructions.md` - If working on backend/database
2. `/docs/ui-instructions.md` - If working on frontend
3. Both - If working on full-stack features

**DO NOT code until you've read the relevant docs.**

---

## Implementation Checklist

Before touching code:
1. ✅ Read relevant documentation files
2. ✅ Plan database schema changes (if needed)
3. ✅ List API method changes
4. ✅ List frontend component changes

Implement in order:
1. Database schema (`finance_manager.py`)
2. API methods (`api.py`)
3. API utilities (`apiUtil.js`)
4. Frontend logic (`main.js`)
5. Styling (`style.css`, `index.html`)

Data Integrity Requirements:
- ✅ Database schema updated (if new fields)
- ✅ API methods reflect schema changes
- ✅ Frontend receives and uses new data
- ✅ Error handling at all layers
- ✅ Migrations handle existing data

---

## Architecture

**Backend:** Python  
- `backend/app.py` - Application entry point  
- `backend/api.py` - API interface  
- `backend/finance_manager.py` - Business logic

**Frontend:** JavaScript  
- `frontend/index.html` - HTML structure  
- `frontend/main.js` - Logic and events  
- `frontend/apiUtil.js` - Backend communication  
- `frontend/style.css` - Styling

**Data:**  
- `data/finance_plans.db` - SQLite database  
- `config/translations.json` - Translations

---

## Core Features

1. **Financial Plans** - Create, retrieve, delete plans with balance and currency
2. **Monthly Planning** - Activate months, copy transactions between months
3. **Income Management** - Add, retrieve, delete income transactions
4. **Payment Management** - Add, retrieve, delete payment transactions
5. **Data Persistence** - SQLite with automatic schema migrations
