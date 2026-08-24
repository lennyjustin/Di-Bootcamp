# Exercise 1 — exercise1.py
import random


def get_words_from_file(file_path):
    with open(file_path, "r") as file:
        content = file.read()

    words = content.split()
    return words


def get_random_sentence(length):
    words = get_words_from_file("words.txt")

    random_words = []
    for _ in range(length):
        random_words.append(random.choice(words))

    sentence = " ".join(random_words)
    return sentence.lower()


def main():
    print("This program generates a random sentence.")
    print("The sentence will contain between 2 and 20 words.")

    try:
        length = int(input("Enter the sentence length: "))

        if length < 2 or length > 20:
            print("Error: Please enter a number between 2 and 20.")
            return

        sentence = get_random_sentence(length)
        print("Generated sentence:")
        print(sentence)

    except ValueError:
        print("Error: Please enter a valid integer.")


if __name__ == "__main__":
    main()
# Exercise 2 — exercise2.py
import json

sampleJson = """{
   "company": {
      "employee": {
         "name": "emma",
         "payable": {
            "salary": 7000,
            "bonus": 800
         }
      }
   }
}"""

# Convert JSON string into a Python dictionary
data = json.loads(sampleJson)

# Access the salary
salary = data["company"]["employee"]["payable"]["salary"]

# Print the salary
print("Salary:", salary)

# Add birth_date to the employee dictionary
data["company"]["employee"]["birth_date"] = "1995-06-15"

# Save the modified JSON to a file
with open("employee.json", "w") as file:
    json.dump(data, file, indent=4)

print("JSON successfully saved to employee.json")