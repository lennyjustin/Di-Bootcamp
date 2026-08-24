class Farm:
    def __init__(self, farm_name):
        self.name = farm_name
        self.animals = {}

    def add_animal(self, animal_type=None, count=1, **kwargs):
        # Add a single animal
        if animal_type is not None:
            if animal_type in self.animals:
                self.animals[animal_type] += count
            else:
                self.animals[animal_type] = count

        # Add multiple animals using kwargs
        for animal, quantity in kwargs.items():
            if animal in self.animals:
                self.animals[animal] += quantity
            else:
                self.animals[animal] = quantity

    def get_info(self):
        result = f"{self.name}'s farm\n\n"

        for animal, count in self.animals.items():
            result += f"{animal} : {count}\n"

        result += "\n    E-I-E-I-0!"

        return result

    def get_animal_types(self):
        return sorted(self.animals.keys())

    def get_short_info(self):
        animals = []

        for animal in self.get_animal_types():
            if self.animals[animal] > 1:
                animals.append(animal + "s")
            else:
                animals.append(animal)

        if len(animals) == 1:
            animal_text = animals[0]
        elif len(animals) == 2:
            animal_text = f"{animals[0]} and {animals[1]}"
        else:
            animal_text = ", ".join(animals[:-1]) + f" and {animals[-1]}"

        return f"{self.name}'s farm has {animal_text}."


# Test
macdonald = Farm("McDonald")

macdonald.add_animal("cow", 5)
macdonald.add_animal("sheep")
macdonald.add_animal("sheep")
macdonald.add_animal("goat", 12)

print(macdonald.get_info())
print(macdonald.get_animal_types())
print(macdonald.get_short_info())

# Step 8 example
macdonald.add_animal(cow=2, pig=3, horse=1)

print(macdonald.get_info())