#  Concatenate lists

list1 = [1, 2, 3]
list2 = [4, 5, 6]

# Option 1: Using extend()
list1.extend(list2)
print(list1)

# Option 2: Using list unpacking
# combined = [*list1, *list2]

# Range of numbers

for num in range(1500, 2501):
    if num % 5 == 0 and num % 7 == 0:
        print(num)
        
        
  # Check the index

names = ['Samus', 'Cortana', 'V', 'Link', 'Mario', 'Cortana', 'Samus']
user_name = input("Enter your name: ")

if user_name in names:
    print(names.index(user_name))
else:
    print("Name not found in the list.") 
    
   # Greatest Number

num1 = float(input("Input the 1st number: "))
num2 = float(input("Input the 2nd number: "))
num3 = float(input("Input the 3rd number: "))

greatest = max(num1, num2, num3)
print(f"The greatest number is: {int(greatest)}")

# The Alphabet

import string

alphabet = string.ascii_lowercase
vowels = "aeiou"

for letter in alphabet:
    if letter in vowels:
        print(f"'{letter}' is a vowel")
    else:
        print(f"'{letter}' is a consonant")
        
# Words and letters

words = []
for i in range(7):
    word = input(f"Enter word {i + 1}: ")
    words.append(word)

letter = input("Enter a single character: ")

for word in words:
    if letter in word:
        print(f"In '{word}', '{letter}' first appears at index {word.index(letter)}.")
    else:
        print(f"The letter '{letter}' does not appear in '{word}'.")
   
   # Min, Max, Sum
   
numbers = list(range(1, 1000001))

print("Min:", min(numbers))
print("Max:", max(numbers))
print("Sum:", sum(numbers)) 

# List and Tuple

user_input = input("Enter comma-separated numbers: ")

numbers_list = user_input.split(",")
numbers_tuple = tuple(numbers_list)

print(numbers_list)
print(numbers_tuple)

#Random number (with Bonuses)

import random

wins = 0
losses = 0

while True:
    user_input = input("Guess a number between 1 and 9 (or type 'quit' to exit): ")
    
    if user_input.lower() == 'quit':
        break
        
    guess = int(user_input)
    secret_number = random.randint(1, 9)
    
    if guess == secret_number:
        print("Winner!")
        wins += 1
    else:
        print(f"Better luck next time. The number was {secret_number}.")
        losses += 1

print("\n--- Game Results ---")
print(f"Total Wins: {wins}")
print(f"Total Losses: {losses}")  