# 1: when will l retire ?
def get_age(year, month, day):
    current_year = 2026
    current_month = 8

    age = current_year - year

    if month > current_month:
        age -= 1
    elif month == current_month and day > 21:
        age -= 1

    return age


def can_retire(gender, date_of_birth):
    year, month, day = map(int, date_of_birth.split("/"))

    age = get_age(year, month, day)

    if gender == "m":
        return age >= 67
    elif gender == "f":
        return age >= 62

# 2 : sum
gender = input("Enter your gender (m/f): ").lower()
date_of_birth = input("Enter your date of birth (yyyy/mm/dd): ")

if can_retire(gender, date_of_birth):
    print("You can retire!")
else:
    print("You cannot retire yet.")
    
    def sum_numbers(x):
        x = str(x)

        return int(x) + int(x * 2) + int(x * 3) + int(x * 4)

print(sum_numbers(3)) # type: ignore

import random
# 3: Double dice

def throw_dice():
    return random.randint(1, 6)


def throw_until_doubles():
    count = 0

    while True:
        dice1 = throw_dice()
        dice2 = throw_dice()

        count += 1

        if dice1 == dice2:
            return count


def main():
    results = []

    for i in range(100):
        throws = throw_until_doubles()
        results.append(throws)

    total_throws = sum(results)
    average_throws = total_throws / 100

    print(f"Total throws: {total_throws}")
    print(f"Average throws to reach doubles: {average_throws:.2f}")


main()