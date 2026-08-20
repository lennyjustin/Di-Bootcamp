# 1: Use the terminal & PATH

print(3 <= 3 < 9)
print(3 == 3 == 3)
print(bool(0))
print(bool(5 == "5"))
print(bool(4 == 4) == bool("4" == "4"))
print(bool(bool(None)))

# For the remaining snippet:
x = (1 == True)      # True because True evaluates as integer 1
y = (1 == False)     # False
a = True + 4         # 5 (True converts to 1: 1 + 4)
b = False + 10       # 10 (False converts to 0: 0 + 10)

print("x is", x)
print("y is", y)
print("a:", a)
print("b:", b)

# Exercise 4: How many characters in a sentence?
my_text = """Lorem ipsum dolor sit amet, consectetur adipiscing elit,
           sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
           Ut enim ad minim veniam, quis nostrud exercitation ullamco
           laboris nisi ut aliquip ex ea commodo consequat.
           Duis aute irure dolor in reprehenderit in voluptate velit
           esse cillum dolore eu fugiat nulla pariatur.
           Excepteur sint occaecat cupidatat non proident,
           sunt in culpa qui officia deserunt mollit anim id est laborum."""

# Single line of code to print character length:
print(len(my_text))

# Exercise 5: Longest sentence without 'A'
longest_length = 0

while True:
    user_input = input("Enter a sentence without the letter 'A' (or type 'quit' to exit): ")

    if user_input.lower() == 'quit':
        break

    if 'a' in user_input.lower():
        print("Your sentence contains the letter 'A'! Try again.")
    else:
        current_length = len(user_input)
        if current_length > longest_length:
            longest_length = current_length
            print(f"Congratulations! New record length: {longest_length} characters!")
        else:
            print("Valid sentence, but not a new record.")

print(f"The longest valid sentence had {longest_length} characters.")
