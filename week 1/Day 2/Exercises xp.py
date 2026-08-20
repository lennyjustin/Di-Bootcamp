# 1: Favorite Numbres.
# Create initial set
my_fav_numbers = {10, 14, 21}

# Add two new numbers
my_fav_numbers.add(42)
my_fav_numbers.add(99)

# Remove the last number added
my_fav_numbers.remove(99)

# Friend's favorite numbers
friend_fav_numbers = {3, 7, 18, 42}
# Combine sets using union
our_fav_numbers = my_fav_numbers.union(friend_fav_numbers)
print(our_fav_numbers)

numbers = (2, 4, 6)

# 2: Tuple
numbers = (2, 4, 6)

# Tuples are immutable, so elements cannot be added directly.
# Attempting to use methods like append() will raise an AttributeError:
# numbers.append(2)  # Raises AttributeError

# To "add" elements, a new tuple must be created via concatenation:
numbers = numbers + (2, 8)
print(numbers)

# 3: List manipulation
basket = ["Banana", "Apples", "Oranges", "Blueberries"]

# Remove items
basket.remove("Banana")
basket.remove("Blueberries")

# Add items
basket.append("kiwi")
basket.insert(0, "Apples")

# Count occurrences of "Apples"
apples_count = basket.count("Apples")
print(f"Apples count: {apples_count}")

# Empty and print final state
basket.clear()
print("Final basket:", basket)

# 4: Floats
float_numbers = [1.5, 2.3, 3.7, 4.1, 5.9]
# Calculate the sum of the float numbers
float_sum = sum(float_numbers)
print(f"Sum of float numbers: {float_sum}")
# 5: For loop
# part 1: Print numbers from 1 to 20
for i in range(1, 21):
    print(i)  # This will print the variable 'i' which is defined in the for loop.
print(numbers)  # This will print the tuple 'numbers' defined earlier.
# part 2: Print numbers from 1 to 20 where the index is even
for num in range(1, 21):
    if num % 2 == 0:
        print(num)

# 6: While loop    
while True:
    name = input("Enter your name: ")
    #check if the input contains digits or is shorter than 3 characters
    if name .isdigit() or len(name) < 3:
        print("Invalid input. Please enter a name with at least 3 characters and no digits.")
    else:
        print(f"thank you, {name}!")
        break
  # 7: Favorite Fruits
favorite_fruits = ["apple", "banana", "cherry", "date", "elderberry"]
user_fruit = input("Enter the name of a fruit: ").lower() 
favorite_fruits_lower = [fruit.lower() for fruit in favorite_fruits]
favorite_fruits_list = user_fruit.split()

# Ask the user for a fruit
chosen_fruit = input("Enter the name of a fruit: ").lower()
# check if the fruit is in the list
if chosen_fruit in favorite_fruits_lower:
    print(f"You chose {chosen_fruit}, which is one of my favorite fruits!")
    
else:
    print(f"You chose {chosen_fruit}, which is not one of my favorite fruits.")

# 8: Pizza toppings
base_price = 10.0  # Base price of the pizza
topping_price = 2.50  # Price per topping
toppings = []

while True:
    topping = input("Enter a pizza topping (or type 'quit' to finish): ").lower()
    if topping == 'quit':
        break
    else:
        toppings.append(topping)
        base_price += topping_price
        print(f"Added {topping}. Current price: ${base_price:.2f}")
        # Calculate the total price of the pizza with toppings
    total_price = base_price
 # Final summary of the pizza order
print("\n-- Pizza Order Summary --")
print(f"Base price: ${base_price:.2f}")
print(f"Total toppings: {len(toppings)}")
print(f"Total price: ${total_price:.2f}")

# 9:Cinema ticket 
age = int(input("Enter your age: "))
if age < 3:
    cost = 0
elif 3 <= age <= 12:
    cost = 10
else:
    cost = 15

total_cost = 0
total_cost += cost
if cost == 0:
    print("Your ticket is free!")
elif cost == 10:
    print("Your ticket costs $10.")
else:
    print("Your ticket costs $15.")
print(f"Total price: ${total_cost:.2f}")

# part 2: Bonus
names = ["kim", "spongBob", "Elves", "King David"]
allowed_attendees = []

for name in names:
    age = int(input(f"Enter age for {name}: "))
    
    if 16 <= age <= 21:
        allowed_attendees.append(name)
    else:
        print(f"{name} is not allowed to watch this movie.")

print(f"Final list of attendees: {allowed_attendees}")
