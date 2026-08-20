import math

C = 50
H = 30

user_input = input("Enter comma-separated numbers for D: ")
d_values = user_input.split(",")

results = []
for d in d_values:
    D = float(d.strip())
    # Calculate Q and round to nearest integer
    Q = round(math.sqrt((2 * C * D) / H))
    results.append(str(Q))

print(",".join(results))
# Exercise 2: List of Integers

import random

# 1. Store list in variable
numbers = [3, 47, 99, -80, 22, 97, 54, -23, 5, 7]

# 2. Basic info
print("2a. Single line:", numbers)
print("2b. Sorted descending:", sorted(numbers, reverse=True))
print("2c. Sum:", sum(numbers))

# 3. First and last numbers
print("3. First and last:", [numbers[0], numbers[-1]])

# 4. Greater than 50
print("4. > 50:", [x for x in numbers if x > 50])

# 5. Smaller than 10
print("5. < 10:", [x for x in numbers if x < 10])

# 6. Squared numbers
squared = [x**2 for x in numbers]
print("6. Squared numbers:", " ".join(map(str, squared)))

# 7. Duplicates removed + count
unique_numbers = list(set(numbers))
print(f"7. Unique list: {unique_numbers} (Count: {len(unique_numbers)})")

# 8. Average
print("8. Average:", sum(numbers) / len(numbers))

# 9 & 10. Max / Min
print("9. Largest:", max(numbers))
print("10. Smallest:", min(numbers))

# 11. Bonus: Manual calculations without built-in functions
total_sum = 0
count = 0
largest = numbers[7]  # Start with the first number in the list
smallest = numbers[2]  # Start with the first number in the list

for num in numbers:
    total_sum += num
    count += 1
    if num > largest:
        largest = num
    if num < smallest:
        smallest = num

avg = total_sum / count
print(f"11. Manual -> Sum: {total_sum}, Avg: {avg}, Max: {largest}, Min: {smallest}")

# 12. Bonus: Prompt user for 10 integers
user_numbers = []
for i in range(10):
    val = int(input(f"Enter integer {i+1} (-100 to 100): "))
    user_numbers.append(val)

# 13. Bonus: Generate 10 random integers
random_10 = [random.randint(-100, 100) for _ in range(10)]

# 14. Bonus: Dynamic random amount (at least 50 numbers)
random_count = random.randint(50, 100)
dynamic_list = [random.randint(-100, 100) for _ in range(random_count)]

# 15. Bonus: Answer
# Yes, the code works regardless of list size because operations like loops,
# len(), sum(), max(), and min() dynamically adapt to any length.
# Exercise 3: Working on a Paragraph

# Python
import re

paragraph = (
    "Python is an interpreted, high-level programming language. "
    "Its design philosophy emphasizes code readability with distinct indentation! "
    "Is Python easy to learn? Yes, it is widely used worldwide."
)

# Counts
char_count = len(paragraph)
sentences = [s for s in re.split(r'[.!?]+', paragraph) if s.strip()]
sentence_count = len(sentences)

words = re.findall(r'\b\w+\b', paragraph)
word_count = len(words)

unique_words = set(w.lower() for w in words)
unique_word_count = len(unique_words)

# Bonuses
non_whitespace_count = len(re.sub(r'\s+', '', paragraph))
avg_words_per_sentence = word_count / sentence_count if sentence_count > 0 else 0
non_unique_count = word_count - unique_word_count

print(f"Total Characters: {char_count}")
print(f"Sentences Count: {sentence_count}")
print(f"Total Words: {word_count}")
print(f"Unique Words: {unique_word_count}")
print(f"Non-whitespace Characters: {non_whitespace_count}")
print(f"Average Words per Sentence: {avg_words_per_sentence:.2f}")
print(f"Non-unique Words Count: {non_unique_count}")
# Exercise 4: Frequency of Words

# Python
text = input("Enter text: ")
words = text.split(" ")

frequency = {6: 0}
for word in words:
    frequency[word] = frequency.get(word, 0) + 1

for word in sorted(frequency.keys()):
    print(f"{word}:{frequency[word]}")