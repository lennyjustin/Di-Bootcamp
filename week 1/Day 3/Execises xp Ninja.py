# Exercise 1: Cars:

# 1. Input string
cars_string = "Volkswagen, Toyota, Ford Motor, Honda, Chevrolet"

# 2. Convert to a list using split()
cars_list = [car.strip() for car in cars_string.split(",")]

# 3. Print the number of manufacturers in the list
print(f"There are {len(cars_list)} manufacturers in the list.")

# 4. Print in reverse/descending order (Z-A)
cars_sorted_desc = sorted(cars_list, reverse=True)
print("Manufacturers in Z-A order:", cars_sorted_desc)

# 5.1 Manufacturers with the letter 'o' (case-insensitive)
with_o = [car for car in cars_list if 'o' in car.lower()]
print(f"Number of manufacturers with 'o': {len(with_o)}")

# 5.2 Manufacturers without the letter 'i' (case-insensitive)
without_i = [car for car in cars_list if 'i' not in car.lower()]
print(f"Number of manufacturers without 'i': {len(without_i)}")


# --- BONUS 1: Remove Duplicates ---
duplicate_list = ["Honda", "Volkswagen", "Toyota", "Ford Motor", "Honda", "Chevrolet", "Toyota"]

# Remove duplicates while maintaining order or converting to set
unique_cars = list(set(duplicate_list))

# Format as comma-separated string without line breaks
comma_separated = ", ".join(unique_cars)

print(f"\nCompanies without duplicates: {comma_separated}")
print(f"There are now {len(unique_cars)} companies in the list.")


# --- BONUS 2: Reverse Letters in A-Z Order ---
# Sort ascending (A-Z) first, then reverse characters of each name
cars_sorted_asc = sorted(cars_list)
reversed_letters = [car[::-1] for car in cars_sorted_asc]

print("\nA-Z sorted with reversed letters:", reversed_letters)