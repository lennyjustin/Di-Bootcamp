class BankAccount:
    def __init__(self, balance, username, password):
        self.balance = balance
        self.username = username
        self.password = password
        self.authenticated = False

    def authenticate(self, username, password):
        if username == self.username and password == self.password:
            self.authenticated = True
            return True
        return False

    def deposit(self, amount):
        if not self.authenticated:
            raise Exception("You must be authenticated.")

        if not isinstance(amount, int) or amount <= 0:
            raise Exception("Deposit must be a positive integer.")

        self.balance += amount

    def withdraw(self, amount):
        if not self.authenticated:
            raise Exception("You must be authenticated.")

        if not isinstance(amount, int) or amount <= 0:
            raise Exception("Withdrawal must be a positive integer.")

        if amount > self.balance:
            raise Exception("Insufficient funds.")

        self.balance -= amount


class MinimumBalanceAccount(BankAccount):
    def __init__(self, balance, username, password, minimum_balance=0):
        super().__init__(balance, username, password)
        self.minimum_balance = minimum_balance

    def withdraw(self, amount):
        if not self.authenticated:
            raise Exception("You must be authenticated.")

        if not isinstance(amount, int) or amount <= 0:
            raise Exception("Withdrawal must be a positive integer.")

        if self.balance - amount <= self.minimum_balance:
            raise Exception("Minimum balance requirement would be violated.")

        self.balance -= amount


class ATM:
    def __init__(self, account_list, try_limit):
        # Check account_list
        if not isinstance(account_list, list):
            raise Exception("account_list must be a list.")

        for account in account_list:
            if not isinstance(account, BankAccount):
                raise Exception(
                    "account_list must contain BankAccount objects."
                )

        self.account_list = account_list

        # Check try_limit
        try:
            if try_limit <= 0:
                raise Exception("try_limit must be positive.")

            self.try_limit = try_limit

        except Exception:
            print("Invalid try limit. Setting it to 2.")
            self.try_limit = 2

        self.current_tries = 0

        self.show_main_menu()

    def show_main_menu(self):
        while True:
            print("\n===== ATM MENU =====")
            print("1. Log in")
            print("2. Exit")

            choice = input("Choose an option: ")

            if choice == "1":
                username = input("Username: ")
                password = input("Password: ")

                self.log_in(username, password)

            elif choice == "2":
                print("Thank you for using the ATM.")
                break

            else:
                print("Invalid choice.")

    def log_in(self, username, password):
        for account in self.account_list:
            if account.authenticate(username, password):
                print("Login successful!")
                self.current_tries = 0
                self.show_account_menu(account)
                return

        self.current_tries += 1

        print("Incorrect username or password.")
        print(f"Attempt {self.current_tries}/{self.try_limit}")

        if self.current_tries >= self.try_limit:
            print("You have reached the maximum number of tries.")
            print("ATM shutting down.")
            raise SystemExit

    def show_account_menu(self, account):
        while True:
            print("\n===== ACCOUNT MENU =====")
            print(f"Current balance: {account.balance}")
            print("1. Deposit")
            print("2. Withdraw")
            print("3. Exit")

            choice = input("Choose an option: ")

            if choice == "1":
                try:
                    amount = int(input("Enter amount to deposit: "))
                    account.deposit(amount)
                    print(f"Deposit successful!")
                    print(f"New balance: {account.balance}")
                except Exception as e:
                    print(f"Error: {e}")

            elif choice == "2":
                try:
                    amount = int(input("Enter amount to withdraw: "))
                    account.withdraw(amount)
                    print(f"Withdrawal successful!")
                    print(f"New balance: {account.balance}")
                except Exception as e:
                    print(f"Error: {e}")

            elif choice == "3":
                account.authenticated = False
                print("Logged out.")
                break

            else:
                print("Invalid choice.")


# =========================
# TESTING THE PROGRAM
# =========================

account1 = BankAccount(
    balance=1000,
    username="john",
    password="1234"
)

account2 = MinimumBalanceAccount(
    balance=2000,
    username="jane",
    password="5678",
    minimum_balance=500
)

accounts = [account1, account2]

atm = ATM(accounts, 3)