{
    "items": [
        {
            "name": "Vegetable soup",
            "price": 30
        },
        {
            "name": "Hamburger",
            "price": 44.9
        },
        {
            "name": "Milkshake",
            "price": 22.5
        },
        {
            "name": "Artichoke",
            "price": 18
        },
        {
            "name": "Beef stew",
            "price": 52.5
        }
    ]
}
import json


class MenuManager:

    def __init__(self):
        with open("restaurant_menu.json", "r") as file:
            data = json.load(file)

        self.menu = data["items"]

    def add_item(self, name, price):
        item = {
            "name": name,
            "price": price
        }

        self.menu.append(item)

    def remove_item(self, name):
        for item in self.menu:
            if item["name"].lower() == name.lower():
                self.menu.remove(item)
                return True

        return False

    def save_to_file(self):
        data = {
            "items": self.menu
        }

        with open("restaurant_menu.json", "w") as file:
            json.dump(data, file, indent=4)
manager = None


def load_manager():
    global manager
    manager = MenuManager()


def show_user_menu():
    while True:
        print("\n===== RESTAURANT MENU MANAGER =====")
        print("1. Show restaurant menu")
        print("2. Add an item")
        print("3. Remove an item")
        print("4. Exit")

        choice = input("Enter your choice: ")

        if choice == "1":
            show_restaurant_menu()

        elif choice == "2":
            add_item_to_menu()

        elif choice == "3":
            remove_item_from_menu()

        elif choice == "4":
            manager.save_to_file()
            print("Menu was saved.")
            print("Goodbye!")
            break

        else:
            print("Invalid choice. Please try again.")


def add_item_to_menu():
    name = input("Enter the item name: ")

    try:
        price = float(input("Enter the item price: "))
    except ValueError:
        print("Invalid price.")
        return

    manager.add_item(name, price)

    print("item was added successfully")


def remove_item_from_menu():
    name = input("Enter the name of the item to remove: ")

    result = manager.remove_item(name)

    if result:
        print("Item was deleted successfully.")
    else:
        print("There was an error. Item was not found.")


def show_restaurant_menu():
    print("\n===== RESTAURANT MENU =====")

    for item in manager.menu:
        print(f"{item['name']} - {item['price']}")


load_manager()
show_user_menu()



import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import urlopen


api_key = "hpvZycW22qCjn5cRM1xtWB8NKq4dQ2My"
search_term = "hilarious"
rating = "g"
limit = 50

url = "https://api.giphy.com/v1/gifs/search?" + urlencode({
    "q": search_term,
    "rating": rating,
    "api_key": api_key,
    "limit": limit,
})

try:
    with urlopen(url) as response:
        data = json.load(response)

except (HTTPError, URLError) as error:
    print("Error:", error)

else:

    gifs = []

    for gif in data["data"]:
        height = int(gif["images"]["original"]["height"])

        if height > 100:
            gifs.append(gif)

    print("Number of GIFs with height bigger than 100:")
    print(len(gifs))

    print("\nFirst 10 GIFs:")

    for gif in gifs[:10]:
        print(gif["url"])
