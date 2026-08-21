# 1: Birthday Look-up

birthdays = {
    "Alice": "1995/04/12",
    "Bob": "1988/11/23",
    "Charlie": "2001/01/05",
    "Diana": "1992/07/19",
    "Evan": "1999/09/30"
}

print("Welcome!")
print("You can look up the birthdays of the people in the list!")

name = input("Enter a person's name: ")
birthday = birthdays.get(name)

if birthday:
    print(f"{name}'s birthday is on {birthday}.")
# 2: Birthdays Advanced

birthdays = {
    "Alice": "1995/04/12",
    "Bob": "1988/11/23",
    "Charlie": "2001/01/05",
    "Diana": "1992/07/19",
    "Evan": "1999/09/30"
}

print("Welcome!")
print("Here are the names available in our dictionary:")
for name in birthdays.keys():
    print(f"- {name}")

search_name = input("Enter a person's name to look up: ")

if search_name in birthdays:
    print(f"{search_name}'s birthday is on {birthdays[search_name]}.")
else:
    print(f"Sorry, we don't have the birthday information for {search_name}")
# 3: Add Your Own Birthday

birthdays = {
    "Alice": "1995/04/12",
    "Bob": "1988/11/23",
    "Charlie": "2001/01/05",
    "Diana": "1992/07/19",
    "Evan": "1999/09/30"
}

# 1. Ask user to add a new birthday first
new_name = input("Add a person's name: ")
new_birthday = input("Add their birthday (YYYY/MM/DD): ")
birthdays[new_name] = new_birthday

# 2. Display all names in the updated dictionary
print("\nHere are all available names:")
for name in birthdays.keys():
    print(f"- {name}")

# 3. Look up a birthday
search_name = input("\nEnter a person's name to look up: ")

if search_name in birthdays:
    print(f"{search_name}'s birthday is on {birthdays[search_name]}.")
else:
    print(f"Sorry, we don't have the birthday information for {search_name}")
# 4: Fruit Shop

# Part 1: Items and prices
simple_items = {
    "banana": 4,
    "apple": 2,
    "orange": 1.5,
    "pear": 3
}

for item, price in simple_items.items():
    print(f"A {item} costs ${price}.")

# Part 2: Calculate total stock value
stock_items = {
    "banana": {"price": 4, "stock": 10},
    "apple": {"price": 2, "stock": 5},
    "orange": {"price": 1.5, "stock": 24},
    "pear": {"price": 3, "stock": 1}
}

total_cost = 0
for details in stock_items.values():
    total_cost += details["price"] * details["stock"]

print(f"Total cost to buy everything in stock: ${total_cost}")