import random


def number_guessing_game():
	random_number = random.randint(1, 100)
	max_attempts = 7
	guessed_correctly = False

	for attempt in range(max_attempts):
		guess = int(input(f"Attempt {attempt + 1}/{max_attempts} - guess a number between 1 and 100: "))

		if guess < random_number:
			print("Too low!")
		elif guess > random_number:
			print("Too high!")
		else:
			print("Congratulations! You guessed the number!")
			guessed_correctly = True
			break

	if not guessed_correctly:
		print(f"You ran out of attempts. The number was {random_number}.")


if __name__ == "__main__":
	number_guessing_game()
