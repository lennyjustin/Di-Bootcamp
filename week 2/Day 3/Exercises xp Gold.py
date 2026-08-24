
import datetime


def kenya_public_holidays(year):
    """Return Kenya's fixed-date public holidays for the given year."""
    return {
        datetime.date(year, 1, 1): "New Year's Day",
        datetime.date(year, 5, 1): "Labour Day",
        datetime.date(year, 6, 1): "Madaraka Day",
        datetime.date(year, 10, 20): "Mashujaa Day",
        datetime.date(year, 12, 12): "Jamhuri Day",
        datetime.date(year, 12, 25): "Christmas Day",
        datetime.date(year, 12, 26): "Boxing Day",
    }


def upcoming_holiday():
    today = datetime.date.today()
    print("Today's date:", today)

    public_holidays = {}
    for year in (today.year, today.year + 1):
        public_holidays.update(kenya_public_holidays(year))

    upcoming_holidays = [
        (date, name)
        for date, name in public_holidays.items()
        if date >= today
    ]

    upcoming_holidays.sort()

    next_date, next_name = upcoming_holidays[0]

    days_left = (next_date - today).days

    print(f"The next holiday is {next_name}.")
    print(f"It is in {days_left} days.")


upcoming_holiday()

def calculate_age(age_in_seconds):
    earth_year = 31557600

    planets = {
        "Earth": 1,
        "Mercury": 0.2408467,
        "Venus": 0.61519726,
        "Mars": 1.8808158,
        "Jupiter": 11.862615,
        "Saturn": 29.447498,
        "Uranus": 84.016846,
        "Neptune": 164.79132
    }

    earth_age = age_in_seconds / earth_year

    for planet, orbital_period in planets.items():
        age = earth_age / orbital_period
        print(f"{planet}: {age:.2f} years")


age = float(input("Enter your age in seconds: "))
calculate_age(age)

import re


def return_numbers(text):
    numbers = re.findall(r"\d", text)
    return "".join(numbers)


print(return_numbers("k5k3q2g5z6x9bn"))

import re


def check_name(name):
    pattern = r"^[A-Z][a-z]+ [A-Z][a-z]+$"

    return bool(re.fullmatch(pattern, name))


name = input("Enter your full name: ")

if check_name(name):
    print("Valid name!")
else:
    print("Invalid name!")

import string
import secrets


SPECIAL_CHARACTERS = "!@#$%^_&*"


def generate_password(length):
    lowercase = string.ascii_lowercase
    uppercase = string.ascii_uppercase
    digits = string.digits
    special = SPECIAL_CHARACTERS

    password = [
        secrets.choice(lowercase),
        secrets.choice(uppercase),
        secrets.choice(digits),
        secrets.choice(special)
    ]

    all_characters = lowercase + uppercase + digits + special

    for _ in range(length - 4):
        password.append(secrets.choice(all_characters))

    for i in range(len(password) - 1, 0, -1):
        j = secrets.randbelow(i + 1)
        password[i], password[j] = password[j], password[i]

    return "".join(password)


def test_password(password, length):
    return (
        len(password) == length
        and any(c.isdigit() for c in password)
        and any(c.islower() for c in password)
        and any(c.isupper() for c in password)
        and any(c in SPECIAL_CHARACTERS for c in password)
    )


def run_tests():
    for i in range(100):
        length = 6 + (i % 25)

        password = generate_password(length)

        if not test_password(password, length):
            print("Test failed!")
            return False

    print("All 100 tests passed!")
    return True


run_tests()


while True:
    try:
        length = int(input("Enter password length (6-30): "))

        if 6 <= length <= 30:
            break

        print("Please enter a number between 6 and 30.")

    except ValueError:
        print("Please enter a valid number.")


password = generate_password(length)

print("\nYour generated password is:")
print(password)
print("\nKeep your password in a safe place!")