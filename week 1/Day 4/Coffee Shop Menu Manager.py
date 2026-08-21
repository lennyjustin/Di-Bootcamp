# Coffee Shop Menu Manager

menu = {
    "espresso": 7.0,
    "latte": 12.0,
    "cappuccino": 10.0
}


def show_menu(menu_dict):
    if not menu_dict:
        print("The menu is empty.")
        return

    print("Current menu:")
    for drink, price in menu_dict.items():
        print(f"{drink} - {price}₪")


def add_item(menu_dict):
    drink = input("Enter new drink name: ")

    if drink in menu_dict:
        print("Item already exists!")
        return

    price = float(input("Enter price: "))
    menu_dict[drink] = price

    print(f'"{drink}" added!')


def update_price(menu_dict):
    drink = input("Which drink do you want to update? ")

    if drink not in menu_dict:
        print("Item not found.")
        return

    price = float(input("Enter the new price: "))
    menu_dict[drink] = price

    print("Price updated!")


def delete_item(menu_dict):
    drink = input("Which drink do you want to delete? ")

    if drink not in menu_dict:
        print("Item not found.")
        return

    del menu_dict[drink]
    print("Item deleted.")


def show_options():
    print("What would you like to do?")
    print("1. Show menu")
    print("2. Add item")
    print("3. Update price")
    print("4. Delete item")
    print("5. Exit")


def run_coffee_shop():
    while True:
        show_options()
        choice = input("> ")

        if choice == "1":
            show_menu(menu)

        elif choice == "2":
            add_item(menu)

        elif choice == "3":
            update_price(menu)

        elif choice == "4":
            delete_item(menu)

        elif choice == "5":
            print("Goodbye!")
            break

        else:
            print("Invalid choice, try again.")


run_coffee_shop()