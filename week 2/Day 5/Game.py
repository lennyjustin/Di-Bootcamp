"""Game logic for Rock, Paper, Scissors."""

import random


class Game:
    ITEMS = ("rock", "paper", "scissors")
    WINNING_MOVES = {
        "rock": "scissors",
        "paper": "rock",
        "scissors": "paper",
    }

    def get_user_item(self):
        """Prompt until the user enters rock, paper, or scissors."""
        while True:
            item = input("Choose rock, paper, or scissors: ").strip().lower()
            if item in self.ITEMS:
                return item
            print("Invalid choice. Please choose rock, paper, or scissors.")

    def get_computer_item(self):
        """Return a random item for the computer."""
        return random.choice(self.ITEMS)

    def get_game_result(self, user_item, computer_item):
        """Return win, draw, or loss for the user's choices."""
        user_item = user_item.strip().lower()
        computer_item = computer_item.strip().lower()

        if user_item not in self.ITEMS or computer_item not in self.ITEMS:
            raise ValueError("Items must be rock, paper, or scissors.")
        if user_item == computer_item:
            return "draw"
        if self.WINNING_MOVES[user_item] == computer_item:
            return "win"
        return "loss"

    def play(self):
        """Play one round, print its outcome, and return the result."""
        user_item = self.get_user_item()
        computer_item = self.get_computer_item()
        result = self.get_game_result(user_item, computer_item)

        print(f"You chose: {user_item}")
        print(f"Computer chose: {computer_item}")
        print(f"Result: {result}")
        return result
    