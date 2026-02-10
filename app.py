import webview
import os
import sqlite3

class FinanceManager:
    def __init__(self):
        self.db_path = "finance_plans.db"
        self._initialize_database()

    def _initialize_database(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Create tables if they don't exist
        cursor.execute('''CREATE TABLE IF NOT EXISTS financial_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            initial_balance REAL DEFAULT 0,
            currency TEXT DEFAULT 'USD'
        )''')

        cursor.execute('''CREATE TABLE IF NOT EXISTS incomes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plan_id INTEGER NOT NULL,
            description TEXT,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY(plan_id) REFERENCES financial_plans(id)
        )''')

        cursor.execute('''CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plan_id INTEGER NOT NULL,
            description TEXT,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY(plan_id) REFERENCES financial_plans(id)
        )''')

        conn.commit()
        conn.close()

    def create_plan(self, name):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO financial_plans (name, initial_balance) VALUES (?, ?)", (name, 0))
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

    def get_incomes(self, plan_id):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT id, description, amount, date FROM incomes WHERE plan_id = ? ORDER BY date ASC", (plan_id,))
        incomes = cursor.fetchall()
        conn.close()
        return [{"id": inc[0], "description": inc[1], "amount": inc[2], "date": inc[3]} for inc in incomes]

    def get_payments(self, plan_id):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
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

    def get_cash_flow_details(self, plan_id, initial_balance):
        """Get detailed cash flow with running balance ordered by date"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Get all transactions (incomes and payments) ordered by date
        cursor.execute("""
            SELECT date, description, amount, 'income' as type FROM incomes WHERE plan_id = ?
            UNION ALL
            SELECT date, description, -amount as amount, 'payment' as type FROM payments WHERE plan_id = ?
            ORDER BY date ASC
        """, (plan_id, plan_id))
        
        transactions = cursor.fetchall()
        conn.close()

        # Calculate running balance
        running_balance = initial_balance
        details = []
        
        for transaction in transactions:
            date, description, amount, trans_type = transaction
            running_balance += amount
            details.append({
                "date": date,
                "description": description,
                "amount": amount,
                "type": trans_type,
                "balance": running_balance
            })

        return details

finance_manager = FinanceManager()

class Api:
    def __init__(self, finance_manager):
        self.finance_manager = finance_manager

    def create_plan(self, name):
        return self.finance_manager.create_plan(name)

    def get_all_plans(self):
        return self.finance_manager.get_all_plans()

    def get_plan_initial_balance(self, plan_id):
        return self.finance_manager.get_plan_initial_balance(plan_id)

    def set_plan_initial_balance(self, plan_id, balance):
        return self.finance_manager.set_plan_initial_balance(plan_id, balance)

    def get_plan_currency(self, plan_id):
        return self.finance_manager.get_plan_currency(plan_id)

    def set_plan_currency(self, plan_id, currency):
        return self.finance_manager.set_plan_currency(plan_id, currency)

    def add_income(self, plan_id, description, amount, date):
        return self.finance_manager.add_income(plan_id, description, amount, date)

    def add_payment(self, plan_id, description, amount, date):
        return self.finance_manager.add_payment(plan_id, description, amount, date)

    def get_incomes(self, plan_id):
        return self.finance_manager.get_incomes(plan_id)

    def get_payments(self, plan_id):
        return self.finance_manager.get_payments(plan_id)

    def delete_plan(self, plan_id):
        return self.finance_manager.delete_plan(plan_id)

    def delete_income(self, income_id):
        return self.finance_manager.delete_income(income_id)

    def delete_payment(self, payment_id):
        return self.finance_manager.delete_payment(payment_id)

    def calculate_cash_flow(self, plan_id, initial_balance):
        return self.finance_manager.calculate_cash_flow(plan_id, initial_balance)

    def get_cash_flow_details(self, plan_id, initial_balance):
        return self.finance_manager.get_cash_flow_details(plan_id, initial_balance)

api = Api(finance_manager)

base_dir = os.path.dirname(__file__)

html_file = os.path.join(base_dir, 'index.html')
with open(html_file, 'r', encoding='utf-8') as f:
    html_content = f.read()

js_file = os.path.join(base_dir, 'main.js')
with open(js_file, 'r', encoding='utf-8') as f:
    js_content_main = f.read()

js_file = os.path.join(base_dir, 'apiUtil.js')
with open(js_file, 'r', encoding='utf-8') as f:
    js_content_api = f.read()

css_file = os.path.join(base_dir, 'style.css')
with open(css_file, 'r', encoding='utf-8') as f:
    css_content = f.read()

# Inject JS at the end of <body>
html_content = html_content.replace("</body>", f"<script>{js_content_main} {js_content_api}</script></body>")

html_content = html_content.replace("</head>", f"<style>{css_content}</style></head>")

webview.create_window(
    "Cash Flow Manager",
    html=html_content,
    js_api=api,
    width=800,   # starting width
    height=600,  # starting height
    resizable=True,
    min_size=(500, 500)
)
webview.start(debug=True)
