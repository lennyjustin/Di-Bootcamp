print(("Hello world\n" * 4) + ("I love python\n" * 4).strip())

# 2:What is the season?
month = input("Enter the month 1to12: ")
month = int(month)

if 3 <= month <= 5:
    print("Spring")
elif 6 <= month <= 8:
    print("Summer")
elif 9 <= month <= 11:
    print("Autumn")
elif month == 12 or month == 1 or month == 2:
    print("Winter")
else:
    print("Invalid month! Please enter a number between 1 and 12.")