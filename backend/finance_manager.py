import sqlite3
import os


class FinanceManager:
    def __init__(self):
        # Get the data folder path
        base_dir = os.path.dirname(os.path.dirname(__file__))
        data_dir = os.path.join(base_dir, 'data')
        self.db_path = os.path.join(data_dir, 'finance_plans.db')
        self._initialize_database()

    def _initialize_database(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Create tables if they don't exist
        cursor.execute('''CREATE TABLE IF NOT EXISTS financial_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            plan_type TEXT DEFAULT 'custom',
            initial_balance REAL DEFAULT 0,
            currency TEXT DEFAULT 'USD'
        )''')

        cursor.execute('''CREATE TABLE IF NOT EXISTS incomes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plan_id INTEGER NOT NULL,
            description TEXT,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            subtype TEXT DEFAULT 'regular',
            month TEXT,
            FOREIGN KEY(plan_id) REFERENCES financial_plans(id)
        )''')

        cursor.execute('''CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plan_id INTEGER NOT NULL,
            description TEXT,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            subtype TEXT DEFAULT 'regular',
            month TEXT,
            FOREIGN KEY(plan_id) REFERENCES financial_plans(id)
        )''')

        cursor.execute('''CREATE TABLE IF NOT EXISTS monthly_plan_months (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plan_id INTEGER NOT NULL,
            month TEXT NOT NULL,
            is_active BOOLEAN DEFAULT 0,
            FOREIGN KEY(plan_id) REFERENCES financial_plans(id),
            UNIQUE(plan_id, month)
        )''')

        # Add missing columns for existing databases (migration)
        try:
            # Check if plan_type column exists in financial_plans
            cursor.execute("PRAGMA table_info(financial_plans)")
            columns = [column[1] for column in cursor.fetchall()]
            
            if 'plan_type' not in columns:
                cursor.execute("ALTER TABLE financial_plans ADD COLUMN plan_type TEXT DEFAULT 'custom'")
                print("Added plan_type column to financial_plans table")
            
            # Check if subtype and month columns exist in incomes
            cursor.execute("PRAGMA table_info(incomes)")
            income_columns = [column[1] for column in cursor.fetchall()]
            
            if 'subtype' not in income_columns:
                cursor.execute("ALTER TABLE incomes ADD COLUMN subtype TEXT DEFAULT 'regular'")
                print("Added subtype column to incomes table")
            
            if 'month' not in income_columns:
                cursor.execute("ALTER TABLE incomes ADD COLUMN month TEXT")
                print("Added month column to incomes table")
            
            # Check if subtype and month columns exist in payments
            cursor.execute("PRAGMA table_info(payments)")
            payment_columns = [column[1] for column in cursor.fetchall()]
            
            if 'subtype' not in payment_columns:
                cursor.execute("ALTER TABLE payments ADD COLUMN subtype TEXT DEFAULT 'regular'")
                print("Added subtype column to payments table")
            
            if 'month' not in payment_columns:
                cursor.execute("ALTER TABLE payments ADD COLUMN month TEXT")
                print("Added month column to payments table")
                
        except Exception as e:
            print(f"Migration error: {e}")

        conn.commit()
        conn.close()

    def create_plan(self, name, plan_type='custom'):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO financial_plans (name, plan_type, initial_balance) VALUES (?, ?, ?)", (name, plan_type, 0))
        conn.commit()
        conn.close()
        return {"status": "success", "message": "Plan created successfully."}

    def add_income(self, plan_id, description, amount, date):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO incomes (plan_id, description, amount, date) VALUES (?, ?, ?, ?)", (plan_id, description, amount, date))
        conn.commit()
        conn.close()
        return {"status": "success", "message": "Income added successfully."}

    def add_payment(self, plan_id, description, amount, date):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO payments (plan_id, description, amount, date) VALUES (?, ?, ?, ?)", (plan_id, description, amount, date))
        conn.commit()
        conn.close()
        return {"status": "success", "message": "Payment added successfully."}

    def get_all_plans(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT id, name FROM financial_plans")
        plans = cursor.fetchall()
        conn.close()
        return [{"id": plan[0], "name": plan[1]} for plan in plans]

    def get_plan_initial_balance(self, plan_id):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT initial_balance FROM financial_plans WHERE id = ?", (plan_id,))
        result = cursor.fetchone()
        conn.close()
        return result[0] if result else 0

    def set_plan_initial_balance(self, plan_id, balance):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("UPDATE financial_plans SET initial_balance = ? WHERE id = ?", (balance, plan_id))
        conn.commit()
        conn.close()
        return {"status": "success", "message": "Initial balance saved successfully."}

    def get_plan_currency(self, plan_id):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT currency FROM financial_plans WHERE id = ?", (plan_id,))
        result = cursor.fetchone()
        conn.close()
        return result[0] if result else 'USD'

    def set_plan_currency(self, plan_id, currency):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("UPDATE financial_plans SET currency = ? WHERE id = ?", (currency, plan_id))
        conn.commit()
        conn.close()
        return {"status": "success", "message": "Currency saved successfully."}

    def get_incomes(self, plan_id, month=None):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if month:
            cursor.execute("SELECT id, description, amount, date FROM incomes WHERE plan_id = ? AND month = ? ORDER BY date ASC", (plan_id, month))
        else:
            cursor.execute("SELECT id, description, amount, date FROM incomes WHERE plan_id = ? ORDER BY date ASC", (plan_id,))
            
        incomes = cursor.fetchall()
        conn.close()
        return [{"id": inc[0], "description": inc[1], "amount": inc[2], "date": inc[3]} for inc in incomes]

    def get_payments(self, plan_id, month=None):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if month:
            cursor.execute("SELECT id, description, amount, date FROM payments WHERE plan_id = ? AND month = ? ORDER BY date ASC", (plan_id, month))
        else:
            cursor.execute("SELECT id, description, amount, date FROM payments WHERE plan_id = ? ORDER BY date ASC", (plan_id,))
            
        payments = cursor.fetchall()
        conn.close()
        return [{"id": pay[0], "description": pay[1], "amount": pay[2], "date": pay[3]} for pay in payments]

    def delete_plan(self, plan_id):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM incomes WHERE plan_id = ?", (plan_id,))
        cursor.execute("DELETE FROM payments WHERE plan_id = ?", (plan_id,))
        cursor.execute("DELETE FROM financial_plans WHERE id = ?", (plan_id,))
        conn.commit()
        conn.close()
        return {"status": "success", "message": "Plan deleted successfully."}

    def delete_income(self, income_id):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM incomes WHERE id = ?", (income_id,))
        conn.commit()
        conn.close()
        return {"status": "success", "message": "Income deleted successfully."}

    def delete_payment(self, payment_id):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM payments WHERE id = ?", (payment_id,))
        conn.commit()
        conn.close()
        return {"status": "success", "message": "Payment deleted successfully."}

    def cleanup_duplicate_monthly_plans(self):
        """Clean up duplicate monthly plans, keeping only one plan per month"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Find duplicate monthly plans for the same month
        cursor.execute("""
            SELECT id, name, plan_type, 
                   ROW_NUMBER() OVER (PARTITION BY name ORDER BY id DESC) as rn
            FROM financial_plans 
            WHERE plan_type = 'monthly' AND name LIKE '%Monthly Plan%'
        """)
        monthly_plans = cursor.fetchall()
        
        # Keep only the first (newest) plan for each month
        plans_to_keep = []
        plans_to_delete = []
        
        for plan_id, name, plan_type, rn in monthly_plans:
            month_name = name.replace(' Monthly Plan', '')
            if month_name not in [p[1] for p in plans_to_keep]:
                plans_to_keep.append((month_name, plan_id))
            else:
                plans_to_delete.append(plan_id)
        
        # Delete duplicate plans
        if plans_to_delete:
            cursor.execute(f"DELETE FROM financial_plans WHERE id IN ({','.join(['?'] * len(plans_to_delete))})", plans_to_delete)
            # Also delete related transactions
            cursor.execute(f"DELETE FROM incomes WHERE plan_id IN ({','.join(['?'] * len(plans_to_delete))})", plans_to_delete)
            cursor.execute(f"DELETE FROM payments WHERE plan_id IN ({','.join(['?'] * len(plans_to_delete))})", plans_to_delete)
            cursor.execute(f"DELETE FROM monthly_plan_months WHERE plan_id IN ({','.join(['?'] * len(plans_to_delete))})", plans_to_delete)
        
        conn.commit()
        conn.close()
        
        return {
            "status": "success", 
            "message": f"Cleaned up {len(plans_to_delete)} duplicate monthly plans",
            "kept_plans": len(plans_to_keep),
            "deleted_plans": len(plans_to_delete)
        }

    def calculate_cash_flow(self, plan_id, initial_balance):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("SELECT SUM(amount) FROM incomes WHERE plan_id = ?", (plan_id,))
        total_income = cursor.fetchone()[0] or 0

        cursor.execute("SELECT SUM(amount) FROM payments WHERE plan_id = ?", (plan_id,))
        total_payments = cursor.fetchone()[0] or 0

        conn.close()

        cash_flow = initial_balance + total_income - total_payments
        return {
            "initial_balance": initial_balance,
            "total_income": total_income,
            "total_payments": total_payments,
            "cash_flow": cash_flow
        }

    def get_cash_flow_details(self, plan_id, initial_balance, month=None):
        """Get detailed cash flow with running balance ordered by date"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        if month:
            # For monthly plans, filter by month
            cursor.execute("""
                SELECT id, date, description, amount, subtype, 'income' as type FROM incomes 
                WHERE plan_id = ? AND month = ?
                UNION ALL
                SELECT id, date, description, -amount as amount, subtype, 'payment' as type FROM payments 
                WHERE plan_id = ? AND month = ?
                ORDER BY date ASC
            """, (plan_id, month, plan_id, month))
        else:
            # For custom plans, get all transactions
            cursor.execute("""
                SELECT id, date, description, amount, subtype, 'income' as type FROM incomes WHERE plan_id = ?
                UNION ALL
                SELECT id, date, description, -amount as amount, subtype, 'payment' as type FROM payments WHERE plan_id = ?
                ORDER BY date ASC
            """, (plan_id, plan_id))
        
        transactions = cursor.fetchall()
        conn.close()

        # Calculate running balance
        running_balance = initial_balance
        details = []
        
        for transaction in transactions:
            trans_id, date, description, amount, subtype, trans_type = transaction
            running_balance += amount
            details.append({
                "id": trans_id,
                "date": date,
                "description": description,
                "amount": abs(amount),  # Use absolute amount for display
                "subtype": subtype,
                "type": trans_type,
                "balance": running_balance
            })

        return details

    def get_monthly_plan_months(self, plan_id):
        """Get all months for a monthly plan"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT month, is_active FROM monthly_plan_months WHERE plan_id = ? ORDER BY month", (plan_id,))
        months = cursor.fetchall()
        conn.close()
        return [{"month": month[0], "is_active": bool(month[1])} for month in months]

    def activate_month(self, plan_id, month):
        """Activate a month and optionally copy regular transactions"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Check if there's a previous active month
        cursor.execute("""
            SELECT month FROM monthly_plan_months 
            WHERE plan_id = ? AND is_active = 1 
            ORDER BY month DESC LIMIT 1
        """, (plan_id,))
        previous_month = cursor.fetchone()
        
        # Deactivate all months and activate the new one
        cursor.execute("UPDATE monthly_plan_months SET is_active = 0 WHERE plan_id = ?", (plan_id,))
        cursor.execute("""
            INSERT OR REPLACE INTO monthly_plan_months (plan_id, month, is_active) 
            VALUES (?, ?, 1)
        """, (plan_id, month))
        
        conn.commit()
        conn.close()
        
        return {
            "previous_month": previous_month[0] if previous_month else None,
            "success": True
        }

    def copy_regular_transactions(self, plan_id, from_month, to_month):
        """Copy regular transactions from one month to another"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Copy regular incomes
        cursor.execute("""
            INSERT INTO incomes (plan_id, description, amount, date, subtype, month)
            SELECT ?, description, amount, date, subtype, ? FROM incomes 
            WHERE plan_id = ? AND month = ? AND subtype = 'regular'
        """, (plan_id, to_month, plan_id, from_month))
        
        # Copy regular payments
        cursor.execute("""
            INSERT INTO payments (plan_id, description, amount, date, subtype, month)
            SELECT ?, description, amount, date, subtype, ? FROM payments 
            WHERE plan_id = ? AND month = ? AND subtype = 'regular'
        """, (plan_id, to_month, plan_id, from_month))
        
        conn.commit()
        conn.close()
        return {"status": "success", "message": "Regular transactions copied successfully."}

    def add_income(self, plan_id, description, amount, date, subtype='regular', month=None):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO incomes (plan_id, description, amount, date, subtype, month) 
            VALUES (?, ?, ?, ?, ?, ?)
        """, (plan_id, description, amount, date, subtype, month))
        conn.commit()
        conn.close()
        return {"status": "success", "message": "Income added successfully."}

    def add_payment(self, plan_id, description, amount, date, subtype='regular', month=None):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO payments (plan_id, description, amount, date, subtype, month) 
            VALUES (?, ?, ?, ?, ?, ?)
        """, (plan_id, description, amount, date, subtype, month))
        conn.commit()
        conn.close()
        return {"status": "success", "message": "Payment added successfully."}
