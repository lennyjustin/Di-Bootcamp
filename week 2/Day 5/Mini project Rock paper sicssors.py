import random

class Game:
    def __init__(self):
        # Mapping breathing to classic RPS
        self.items = ["rock", "paper", "scissors"]
        self.breathing_names = {
            "rock": "Water Breathing 🌊 - Tanjiro",
            "paper": "Beast Breathing 🐗 - Inosuke",
            "scissors": "Thunder Breathing ⚡ - Zenitsu"
        }

    def get_user_item(self):
        print("\nChoose your Breathing Style:")
        print(" [rock] = Water Breathing - Tanjiro 🌊")
        print(" [paper] = Beast Breathing - Inosuke 🐗")
        print(" [scissors] = Thunder Breathing - Zenitsu ⚡")

        while True:
            user_item = input("Your Breathing > ").lower().strip()
            # Allow typing breathing name too
            if user_item in ["water", "tanjiro"]:
                user_item = "rock"
            if user_item in ["beast", "inosuke"]:
                user_item = "paper"
            if user_item in ["thunder", "zenitsu"]:
                user_item = "scissors"

            if user_item in self.items:
                return user_item
            print("Invalid! Choose rock/paper/scissors or water/beast/thunder")

    def get_computer_item(self):
        # Demon chooses randomly
        return random.choice(self.items)

    def get_game_result(self, user_item, computer_item):
        if user_item == computer_item:
            return "draw"
        if (user_item == "rock" and computer_item == "scissors") or \
           (user_item == "scissors" and computer_item == "paper") or \
           (user_item == "paper" and computer_item == "rock"):
            return "win"
        else:
            return "loss"

    def play(self):
        user_item = self.get_user_item()
        computer_item = self.get_computer_item()
        result = self.get_game_result(user_item, computer_item)

        print(f"\n{'='*45}")
        print(f"⚔️ You: {self.breathing_names[user_item]}")
        print(f"👹 Demon: {self.breathing_names[computer_item]}")

        if result == "win":
            print("🔥 RENGOKU: UMAI! YOU SLAYED THE DEMON! 🔥")
        elif result == "draw":
            print("🌙 Tanjiro: Draw... Total Concentration, try again!")
        else:
            print("💀 Muzan: Weak... a Hashira would never lose!")

        print(f"{'='*45}")
        return result
    
def get_user_menu_choice():
    print("\n🔥 DEMON SLAYER: BREATHING BATTLE 🔥")
    print("(g) Start Slayer Mission")
    print("(x) Show Corps Records (Scores)")
    print("(q) Return to Butterfly Mansion (Quit)")

    while True:
        choice = input("Hashira Choice > ").lower().strip()
        if choice in ["g", "x", "q"]:
            return choice
        print("Inosuke: WRONG! PICK g, x, or q!")

def print_results(results):
    print("\n📜 FINAL MISSION REPORT - Demon Slayer Corps")
    print(f"Demons Slain (Wins): {results['win']}")
    print(f"Missions Failed (Losses): {results['loss']}")
    print(f"Draws - Demon Escaped: {results['draw']}")

    if results['win'] > results['loss']:
        print("\n🎉 You are now a HASHIRA! Oyakata is proud!")
    elif results['win'] == 0 and results['loss'] == 0 and results['draw'] == 0:
        print("\n🦋 Kanao:...")
    else:
        print("\n💪 Keep training! Water Breathing - 10th Form!")

    print("Thank you for protecting humanity! ☀️")

def main():
    results = {"win": 0, "loss": 0, "draw": 0}

    print("🌊 Welcome to Demon Slayer Corps! Muzan's demons await...")

    while True:
        choice = get_user_menu_choice()

        if choice == "g":
            game = Game()
            result = game.play()
            results[result] += 1

        elif choice == "x":
            print_results(results)

        elif choice == "q":
            print_results(results)
            print("\nNezuko: Mmm! (Goodbye!) 🎋")
            break

if __name__ == "__main__":
    main()
    