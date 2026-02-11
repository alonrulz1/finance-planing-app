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
