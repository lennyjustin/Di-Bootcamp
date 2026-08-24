import json
import re

FILE_NAME = "menu.json"


def load_menu():
    try:
        with open(FILE_NAME, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        return {}


def save_menu(menu):
    with open(FILE_NAME, "w") as file:
        json.dump(menu, file, indent=4)


def validate_item_name(name):
    words = name.split()

    if not words:
        return False

    # First word must start with capital V
    if not words[0].startswith("V"):
        return False

    # Name must contain at least two e's
    if name.lower().count("e") < 2:
        return False

    # Name must not contain numbers
    if re.search(r"\d", name):
        return False

    # Connection words must be lowercase
    connection_words = {"of", "and", "with", "in", "on", "for", "the"}

    for word in words:
        clean_word = word.strip(".,!?-")

        if not clean_word:
            continue

        if clean_word.lower() in connection_words:
            if not clean_word.islower():
                return False
        else:
            if not clean_word[0].isupper():
                return False

    return True


def validate_price(price):
    pattern = r"^\d{2},14$"
    return re.fullmatch(pattern, price) is not None


def display_heart():
    print("  **     **  ")
    print(" ****   **** ")
    print("****** ******")
    print(" *********** ")
    print("  *********  ")
    print("   *******   ")
    print("    *****    ")
    print("     ***     ")
    print("      *      ")


def display_menu(menu):
    print("\n========== MENU ==========")

    for category, items in menu.items():
        print(f"\n{category.upper()}:")

        if isinstance(items, list):
            for item in items:
                if isinstance(item, dict):
                    print(f"{item['name']} - {item['price']}")
                else:
                    print(item)

    print()
    display_heart()


def main():
    menu = load_menu()

    # Create Valentine's list if it doesn't already exist
    if "valentines_items" not in menu:
        menu["valentines_items"] = []

    print("================================")
    print(" Valentine's Day Menu Manager")
    print("================================")

    item_name = input("Enter a Valentine's item: ")

    if not validate_item_name(item_name):
        print("\nInvalid item name!")
        print("Make sure:")
        print("- The first word starts with V.")
        print("- Every normal word starts with a capital letter.")
        print("- Connection words are lowercase.")
        print("- The name contains at least two 'e' letters.")
        print("- The name contains no numbers.")
        return

    price = input("Enter the price (XX,14): ")

    if not validate_price(price):
        print("\nInvalid price!")
        print("The price must have the format XX,14.")
        return

    new_item = {
        "name": item_name,
        "price": price
    }

    menu["valentines_items"].append(new_item)

    save_menu(menu)

    print("\nValentine's item added successfully!")

    display_menu(menu)


if __name__ == "__main__":
    main()
    
import random
import json


class Character:
    def __init__(self, name, age):
        self.name = name
        self.age = age

        self.strength = self.generate_stat()
        self.dexterity = self.generate_stat()
        self.constitution = self.generate_stat()
        self.intelligence = self.generate_stat()
        self.wisdom = self.generate_stat()
        self.charisma = self.generate_stat()

    def generate_stat(self):
        dice = []

        # Roll four 6-sided dice
        for _ in range(4):
            dice.append(random.randint(1, 6))

        # Remove the smallest die
        dice.remove(min(dice))

        # Add the three highest dice
        return sum(dice)

    def to_dict(self):
        return {
            "name": self.name,
            "age": self.age,
            "strength": self.strength,
            "dexterity": self.dexterity,
            "constitution": self.constitution,
            "intelligence": self.intelligence,
            "wisdom": self.wisdom,
            "charisma": self.charisma
        }


class Game:
    def __init__(self):
        self.characters = []

    def create_characters(self):
        while True:
            try:
                number_of_players = int(
                    input("How many players are playing? ")
                )

                if number_of_players < 1:
                    print("Please enter at least 1 player.")
                else:
                    break

            except ValueError:
                print("Please enter a valid number.")

        for player in range(number_of_players):
            print(f"\n========== PLAYER {player + 1} ==========")

            name = input("Enter your character's name: ")

            while True:
                try:
                    age = int(input("Enter your character's age: "))

                    if age < 0:
                        print("Age cannot be negative.")
                    else:
                        break

                except ValueError:
                    print("Please enter a valid age.")

            character = Character(name, age)
            self.characters.append(character)

            print(f"\nCharacter {name} created successfully!")

    def display_characters(self):
        print("\n================================")
        print("       CREATED CHARACTERS")
        print("================================")

        for number, character in enumerate(self.characters, 1):
            print(f"\nCharacter {number}")
            print(f"Name: {character.name}")
            print(f"Age: {character.age}")
            print(f"Strength: {character.strength}")
            print(f"Dexterity: {character.dexterity}")
            print(f"Constitution: {character.constitution}")
            print(f"Intelligence: {character.intelligence}")
            print(f"Wisdom: {character.wisdom}")
            print(f"Charisma: {character.charisma}")

    def export_to_json(self):
        data = []

        for character in self.characters:
            data.append(character.to_dict())

        with open("characters.json", "w") as file:
            json.dump(data, file, indent=4)

        print("\ncharacters.json created successfully!")

    def export_to_txt(self):
        with open("characters.txt", "w") as file:

            for number, character in enumerate(self.characters, 1):
                file.write(
                    f"========== CHARACTER {number} ==========\n"
                )
                file.write(f"Name: {character.name}\n")
                file.write(f"Age: {character.age}\n")
                file.write(f"Strength: {character.strength}\n")
                file.write(f"Dexterity: {character.dexterity}\n")
                file.write(f"Constitution: {character.constitution}\n")
                file.write(f"Intelligence: {character.intelligence}\n")
                file.write(f"Wisdom: {character.wisdom}\n")
                file.write(f"Charisma: {character.charisma}\n")
                file.write("\n")

        print("characters.txt created successfully!")


def main():
    game = Game()

    game.create_characters()

    game.display_characters()

    game.export_to_json()
    game.export_to_txt()

    print("\nAll characters have been saved!")


if __name__ == "__main__":
    main()  