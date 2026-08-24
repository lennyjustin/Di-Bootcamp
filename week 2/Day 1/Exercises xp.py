# Exercise 1 — Cats
class Cat:
    def __init__(self, cat_name, cat_age):
        self.name = cat_name
        self.age = cat_age


# Create three cat objects
cat1 = Cat("Whiskers", 5)
cat2 = Cat("Luna", 8)
cat3 = Cat("Simba", 3)


# Find the oldest cat
def find_oldest_cat(cat1, cat2, cat3):
    oldest = cat1

    if cat2.age > oldest.age:
        oldest = cat2

    if cat3.age > oldest.age:
        oldest = cat3

    return oldest


# Print oldest cat
oldest_cat = find_oldest_cat(cat1, cat2, cat3)

print(f"The oldest cat is {oldest_cat.name}, and is {oldest_cat.age} years old.")


#Exercise 2 — Dogs
class Dog:
    def __init__(self, name, height):
        self.name = name
        self.height = height

    def bark(self):
        print(f"{self.name} goes woof!")

    def jump(self):
        print(f"{self.name} jumps {self.height * 2} cm high!")


# Create the dogs
davids_dog = Dog("Rex", 50)
sarahs_dog = Dog("Bella", 40)


# Print details and call methods
print(f"David's dog: {davids_dog.name}, {davids_dog.height} cm")
davids_dog.bark()
davids_dog.jump()

print()

print(f"Sarah's dog: {sarahs_dog.name}, {sarahs_dog.height} cm")
sarahs_dog.bark()
sarahs_dog.jump()


# Compare dog sizes
if davids_dog.height > sarahs_dog.height:
    print(f"{davids_dog.name} is taller than {sarahs_dog.name}.")
elif sarahs_dog.height > davids_dog.height:
    print(f"{sarahs_dog.name} is taller than {davids_dog.name}.")
else:
    print("Both dogs are the same height.")
# Exercise 3 — Song
class Song:
    def __init__(self, lyrics):
        self.lyrics = lyrics

    def sing_me_a_song(self):
        for line in self.lyrics:
            print(line)


stairway = Song([
    "There's a lady who's sure",
    "all that glitters is gold",
    "and she's buying a stairway to heaven"
])

stairway.sing_me_a_song()


# Exercise 4 — Zoo
class Zoo:
    def __init__(self, zoo_name):
        self.zoo_name = zoo_name
        self.animals = []
        self.groups = {}

    def add_animal(self, new_animal):
        if new_animal not in self.animals:
            self.animals.append(new_animal)

    def get_animals(self):
        print(self.animals)

    def sell_animal(self, animal_sold):
        if animal_sold in self.animals:
            self.animals.remove(animal_sold)

    def sort_animals(self):
        self.animals.sort()

        self.groups = {}

        for animal in self.animals:
            first_letter = animal[0].upper()

            if first_letter not in self.groups:
                self.groups[first_letter] = []

            self.groups[first_letter].append(animal)

        return self.groups

    def get_groups(self):
        for letter, animals in self.groups.items():
            print(f"{letter}: {animals}")


# Create Zoo
brooklyn_safari = Zoo("Brooklyn Safari")


# Add animals
brooklyn_safari.add_animal("Giraffe")
brooklyn_safari.add_animal("Bear")
brooklyn_safari.add_animal("Baboon")
brooklyn_safari.add_animal("Cat")
brooklyn_safari.add_animal("Cougar")
brooklyn_safari.add_animal("Lion")
brooklyn_safari.add_animal("Zebra")


# Display animals
print("Animals:")
brooklyn_safari.get_animals()


# Sell an animal
brooklyn_safari.sell_animal("Bear")

print("\nAfter selling Bear:")
brooklyn_safari.get_animals()


# Sort and group animals
brooklyn_safari.sort_animals()

print("\nGroups:")
brooklyn_safari.get_groups()

class Zoo:
    def __init__(self, zoo_name: str) -> None:
        self.zoo_name = zoo_name
        self.animals: list[str] = []

    def add_animal(self, *new_animals: str) -> None:
        for animal in new_animals:
            if animal not in self.animals:
                self.animals.append(animal)


brooklyn_safari = Zoo("Brooklyn Safari")

brooklyn_safari.add_animal(
    "Giraffe",
    "Bear",
    "Baboon",
    "Cat",
    "Cougar",
    "Lion",
    "Zebra"
)

print(brooklyn_safari.animals)
