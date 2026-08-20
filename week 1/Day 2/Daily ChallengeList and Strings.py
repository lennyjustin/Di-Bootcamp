from datetime import datetime

# 1. Ask the user for their birthdate
birthdate_str = input("Enter your birthdate (DD/MM/YYYY): ")

# 2. Parse the input and calculate age
birthdate = datetime.strptime(birthdate_str, "%d/%m/%Y")
today = datetime.today()

# Calculate age considering if birthday hasn't occurred yet this year
age = today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))

# 3. Determine candle count from the last digit of the age
last_digit = age % 10
candles = "i" * last_digit

# Dynamic top of the cake centered around candles (total width 11 chars)
cake_top = f"___{candles}___".center(11)

cake = f"""
       {cake_top}
      |:H:a:p:p:y:|
    __|___________|__
   |^^^^^^^^^^^^^^^^^|
   |:B:i:r:t:h:d:a:y:|
   |                 |
   ~~~~~~~~~~~~~~~~~~~
"""

# 4. Check for leap year
year = birthdate.year
is_leap_year = (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)

# Display one or two cakes depending on leap year
if is_leap_year:
    print(cake * 2)
else:
    print(cake)