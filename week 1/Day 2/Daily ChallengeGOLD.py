from datetime import date

# Ask for birthdate
birthdate = input("Enter your birthdate (DD/MM/YYYY): ")

# Convert the input
day, month, year = map(int, birthdate.split("/"))

# Calculate age
today = date.today()
age = today.year - year

if (today.month, today.day) < (month, day):
    age -= 1

# Last digit of age = number of candles
candles = age % 10

# Create cake
cake = f"""
       ___{"i" * candles}___
      |:H:a:p:p:y:|
    __|___________|__
   |^^^^^^^^^^^^^^^^^|
   |:B:i:r:t:h:d:a:y:|
   |                 |
   ~~~~~~~~~~~~~~~~~~~
"""

print(cake)

# Bonus: check if birth year was a leap year
if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0):
    print(cake)