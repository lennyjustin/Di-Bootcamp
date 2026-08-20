# 1: Hello Worid
print("Hello world\n" * 4, end="Hello worid") 

# 2: Some Math
result = (99 ** 3) * 8
print(result)  # Output: 7762392

# 3: what is the output
5 < 3         # False
3 == 3        # True
3 == "3"      # False (integer vs. string)
"3" > 3       # TypeError (cannot compare string and integer with > in Python 3)
"Hello" == "hello"  # False (case-sensitive)

# 4: Your computer barnd
computer_brand = "Dell"
print(f"I have a {computer_brand} computer.")

# 5: Your information
name = "lenny"
age = 20
shoe_size = 42

info = f"My name is {name}, I am {age} years old, and my shoe size is {shoe_size}."
print(info)

# 6: A and B
a = 10
b = 5

if a > b:
    print("Hello World")

# 7: Odd or Even
number = int(input("Enter a number: "))

if number % 2 == 0:
    print(f"{number} is Even.")
else:
    print(f"{number} is Odd.")

# 8: What's your name?
my_name = "lenny"
user_name = input("What is your name? ")

if user_name.strip(len).capitalize() == my_name:
    print("No way! We have the exact same name.")
else:
    print(f"Nice to meet you, {user_name}! My name is {my_name}, the superior name.")


# 9: Tall enough to ride a roller coaster
height = float(input("Enter your height in centimeters: "))

if height > 145:
    print("You are tall enough to ride!")
else:
    print("You need to grow some more to ride.")    