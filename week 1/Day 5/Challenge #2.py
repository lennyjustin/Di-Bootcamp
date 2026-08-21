# 1. Pattern
for i in range(1, 6, 2):
    print(" " * (3 - i // 2) + "*" * i)

# 2. Pattern
for i in range(1, 6):
    print(" " * (5 - i) + "*" * i)

# 3. Pattern
for i in range(1, 6):
    print("*" * i)

for i in range(5, 0, -1):
    print(" " * (5 - i) + "*" * i)

# Exercise 2

# Here is the original code with comments explaining each step:
my_list = [2, 24, 12, 354, 233]  # Original list

for i in range(len(my_list) - 1):  # i goes from 0 to 3
    minimum = i  # Assume the current position has the smallest value

    for j in range(i + 1, len(my_list)):  # Check the remaining values
        if my_list[j] < my_list[minimum]:  # If a smaller value is found
            minimum = j  # Save its position

    if minimum != i:  # If the smallest value is not at position i
        # Swap the two values
        my_list[i], my_list[minimum] = my_list[minimum], my_list[i]

print(my_list)  # Display the sorted list