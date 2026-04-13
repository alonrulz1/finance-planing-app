class Api:
    def __init__(self, finance_manager):
        self.finance_manager = finance_manager

    def create_plan(self, name, plan_type='custom', initial_balance=0, currency='USD'):
        return self.finance_manager.create_plan(name, plan_type, initial_balance, currency)

    def get_monthly_plan_months(self, plan_id):
        return self.finance_manager.get_monthly_plan_months(plan_id)

    def activate_month(self, plan_id, month):
        return self.finance_manager.activate_month(plan_id, month)

    def copy_regular_transactions(self, plan_id, from_month, to_month):
        return self.finance_manager.copy_regular_transactions(plan_id, from_month, to_month)

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

    def add_income(self, plan_id, description, amount, date, subtype='regular', month=None):
        return self.finance_manager.add_income(plan_id, description, amount, date, subtype, month)

    def add_payment(self, plan_id, description, amount, date, subtype='regular', month=None):
        return self.finance_manager.add_payment(plan_id, description, amount, date, subtype, month)

    def get_incomes(self, plan_id, month=None):
        return self.finance_manager.get_incomes(plan_id, month)

    def get_payments(self, plan_id, month=None):
        return self.finance_manager.get_payments(plan_id, month)

    def delete_plan(self, plan_id):
        return self.finance_manager.delete_plan(plan_id)

    def delete_income(self, income_id):
        return self.finance_manager.delete_income(income_id)

    def delete_payment(self, payment_id):
        return self.finance_manager.delete_payment(payment_id)

    def cleanup_duplicate_monthly_plans(self):
        return self.finance_manager.cleanup_duplicate_monthly_plans()

    def calculate_cash_flow(self, plan_id, initial_balance):
        return self.finance_manager.calculate_cash_flow(plan_id, initial_balance)

    def get_cash_flow_details(self, plan_id, initial_balance, month=None):
        return self.finance_manager.get_cash_flow_details(plan_id, initial_balance, month)

    def get_lib_file(self, filename):
        """Serve files from the libs directory"""
        import os
        base_dir = os.path.dirname(os.path.dirname(__file__))
        frontend_dir = os.path.join(base_dir, 'frontend')
        filepath = os.path.join(frontend_dir, 'libs', filename)
        
        # Security check - ensure the file is within the libs directory
        if os.path.abspath(filepath).startswith(os.path.abspath(os.path.join(frontend_dir, 'libs'))):
            if os.path.exists(filepath):
                with open(filepath, 'r', encoding='utf-8') as f:
                    return f.read()
        return None

    def save_excel_file(self, filename, base64_data):
        """Save an Excel workbook to a file"""
        import os
        import base64
        
        try:
            # Ensure filename ends with .xlsx
            if not filename.endswith('.xlsx'):
                filename = filename + '.xlsx'
            
            # Get default save location (Downloads folder)
            home_dir = os.path.expanduser("~")
            downloads_dir = os.path.join(home_dir, "Downloads")
            
            # Ensure the Downloads directory exists
            os.makedirs(downloads_dir, exist_ok=True)
            
            save_path = os.path.join(downloads_dir, filename)
            
            # Decode base64 data and write to file
            binary_data = base64.b64decode(base64_data)
            
            with open(save_path, 'wb') as f:
                f.write(binary_data)
            
            return {
                "success": True,
                "message": f"File saved successfully",
                "path": save_path
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error saving file: {str(e)}"
            }
