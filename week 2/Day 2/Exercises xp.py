class Pets:
    def __init__(self, animals):
        self.animals = animals

    def walk(self):
        for animal in self.animals:
            print(animal.walk())


class Cat:
    is_lazy = True

    def __init__(self, name, age):
        self.name = name
        self.age = age

    def walk(self):
        return f"{self.name} is just walking around"


class Bengal(Cat):
    def sing(self, sounds):
        return sounds


class Chartreux(Cat):
    def sing(self, sounds):
        return sounds


# Step 1: Create Siamese class
class Siamese(Cat):
    pass


# Step 2: Create cat instances
bengal_obj = Bengal("Luna", 3)
chartreux_obj = Chartreux("Milo", 5)
siamese_obj = Siamese("Nala", 2)

all_cats = [bengal_obj, chartreux_obj, siamese_obj]


# Step 3: Create Pets instance
sara_pets = Pets(all_cats)


# Step 4: Take cats for a walk
sara_pets.walk()

class Dog:
    def __init__(self, name, age, weight):
        self.name = name
        self.age = age
        self.weight = weight

    def bark(self):
        return f"{self.name} is barking"

    def run_speed(self):
        return self.weight / self.age * 10

    def fight(self, other_dog):
        my_score = self.run_speed() * self.weight
        other_score = other_dog.run_speed() * other_dog.weight

        if my_score > other_score:
            return f"{self.name} won the fight"
        elif other_score > my_score:
            return f"{other_dog.name} won the fight"
        else:
            return "It's a tie"


# Create three dogs
dog1 = Dog("Rex", 4, 20)
dog2 = Dog("Max", 2, 15)
dog3 = Dog("Buddy", 5, 25)


# Test the methods
print(dog1.bark())
print(dog2.run_speed())
print(dog1.fight(dog2))
print(dog2.fight(dog3))

import random


class PetDog(Dog):
    def __init__(self, name, age, weight):
        super().__init__(name, age, weight)
        self.trained = False

    def train(self):
        print(self.bark())
        self.trained = True

    def play(self, *args):
        names = [self.name]

        for dog in args:
            names.append(dog.name)

        print(f"{', '.join(names)} all play together")

    def do_a_trick(self):
        if self.trained:
            tricks = [
                "does a barrel roll",
                "stands on his back legs",
                "shakes your hand",
                "plays dead"
            ]

            trick = random.choice(tricks)
            print(f"{self.name} {trick}")


# Create PetDog objects
dog1 = PetDog("Fido", 2, 10)
dog2 = PetDog("Buddy", 3, 15)
dog3 = PetDog("Max", 4, 20)


# Test train()
dog1.train()

# Test play()
dog1.play(dog2, dog3)

# Test trick
dog1.do_a_trick()

class Person:
    def __init__(self, first_name, age):
        self.first_name = first_name
        self.age = age
        self.last_name = ""

    def is_18(self):
        return self.age >= 18


class Family:
    def __init__(self, last_name):
        self.last_name = last_name
        self.members = []

    def born(self, first_name, age):
        person = Person(first_name, age)

        person.last_name = self.last_name

        self.members.append(person)

    def check_majority(self, first_name):
        for person in self.members:
            if person.first_name == first_name:

                if person.is_18():
                    print(
                        "You are over 18, your parents Jane and John "
                        "accept that you will go out with your friends"
                    )
                else:
                    print(
                        "Sorry, you are not allowed to go out with your friends."
                    )

                return

    def family_presentation(self):
        print(f"Family name: {self.last_name}")

        for person in self.members:
            print(f"{person.first_name}, {person.age}")


# Create a family
my_family = Family("Smith")


# Add family members
my_family.born("John", 45)
my_family.born("Jane", 43)
my_family.born("Tom", 20)
my_family.born("Emma", 15)


# Check majority
my_family.check_majority("Tom")
my_family.check_majority("Emma")


# Display family
my_family.family_presentation()
