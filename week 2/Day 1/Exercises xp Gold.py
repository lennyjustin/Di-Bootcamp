# Exercise 1 — Geometry
import math


class Circle:
    def __init__(self, radius=1.0):
        self.radius = radius

    def perimeter(self):
        return 2 * math.pi * self.radius

    def area(self):
        return math.pi * self.radius ** 2

    def definition(self):
        print(
            f"A circle is a geometrical shape where every point "
            f"on its circumference is the same distance from its center. "
            f"The radius is {self.radius}."
        )


# Test
circle1 = Circle()
circle2 = Circle(5)

print("Circle 1 perimeter:", circle1.perimeter())
print("Circle 1 area:", circle1.area())

print("Circle 2 perimeter:", circle2.perimeter())
print("Circle 2 area:", circle2.area())

circle2.definition()
# Exercise 2 — Custom List Class
import random


class MyList:
    def __init__(self, letters):
        self.letters = letters

    def reversed_list(self):
        return self.letters[::-1]

    def sorted_list(self):
        return sorted(self.letters)

    def random_numbers(self):
        return [random.randint(1, 100) for _ in self.letters]


# Test
mylist = MyList(["d", "a", "c", "b"])

print("Original list:", mylist.letters)
print("Reversed list:", mylist.reversed_list())
print("Sorted list:", mylist.sorted_list())
print("Random numbers:", mylist.random_numbers())
# Exercise 3 — menu_manager.py


class MenuManager:

    def __init__(self):
        self.menu = [
            {
                "name": "Soup",
                "price": 10,
                "spice": "B",
                "gluten": False
            },
            {
                "name": "Hamburger",
                "price": 15,
                "spice": "A",
                "gluten": True
            },
            {
                "name": "Salad",
                "price": 18,
                "spice": "A",
                "gluten": False
            },
            {
                "name": "French Fries",
                "price": 5,
                "spice": "C",
                "gluten": False
            },
            {
                "name": "Beef bourguignon",
                "price": 25,
                "spice": "B",
                "gluten": True
            }
        ]

    def add_item(self, name, price, spice, gluten):
        new_item = {
            "name": name,
            "price": price,
            "spice": spice,
            "gluten": gluten
        }

        self.menu.append(new_item)
        print(f"{name} was added to the menu.")

    def update_item(self, name, price, spice, gluten):
        for item in self.menu:
            if item["name"].lower() == name.lower():
                item["price"] = price
                item["spice"] = spice
                item["gluten"] = gluten

                print(f"{name} was updated.")
                return

        print(f"{name} is not in the menu.")

    def remove_item(self, name):
        for item in self.menu:
            if item["name"].lower() == name.lower():
                self.menu.remove(item)

                print(f"{name} was removed from the menu.")
                print("Updated menu:")
                print(self.menu)
                return

        print(f"{name} is not in the menu.")

manager = MenuManager()

print(manager.menu)

manager.add_item("Pizza", 20, "B", True)

manager.update_item("Pizza", 25, "A", True)

manager.remove_item("Pizza")

manager.update_item("Pasta", 15, "A", False)

manager.remove_item("Pasta")