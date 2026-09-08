"""Command-line interface for Rock, Paper, Scissors."""

from Game import Game


def get_user_menu_choice():
    """Display the menu and return a validated choice: 1, 2, or 3."""
    while True:
        print("\n=== Rock, Paper, Scissors ===")
        print("1. Play a new game")
        print("2. Show scores")
        print("3. Quit")
        choice = input("Choose an option: ").strip().lower()

        aliases = {
            "1": "1",
            "play": "1",
            "play a new game": "1",
            "2": "2",
            "scores": "2",
            "show scores": "2",
            "3": "3",
            "quit": "3",
            "exit": "3",
        }
        if choice in aliases:
            return aliases[choice]
        print("Invalid menu choice. Please select 1, 2, or 3.")


def print_results(results):
    """Print the final game totals and thank the user."""
    print("\n=== Game Summary ===")
    print(f"Wins: {results.get('win', 0)}")
    print(f"Losses: {results.get('loss', 0)}")
    print(f"Draws: {results.get('draw', 0)}")
    print("Thanks for playing!")


def main():
    """Run the menu until the user chooses to quit."""
    results = {"win": 0, "loss": 0, "draw": 0}

    while True:
        choice = get_user_menu_choice()

        if choice == "1":
            result = Game().play()
            results[result] += 1
        elif choice == "2":
            print_results(results)
        else:
            print_results(results)
            break


if __name__ == "__main__":
    main()