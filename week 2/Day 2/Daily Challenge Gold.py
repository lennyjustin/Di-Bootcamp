import random


# -------------------------
# Base class
# -------------------------

class Mutable:
    def mutate(self):
        raise NotImplementedError


# -------------------------
# Gene
# -------------------------

class Gene(Mutable):
    def __init__(self, value=None):
        self.value = random.randint(0, 1) if value is None else value

    def mutate(self):
        self.value = 1 - self.value

    def __str__(self):
        return str(self.value)


# -------------------------
# Chromosome
# -------------------------

class Chromosome(Mutable):
    def __init__(self):
        self.genes = [Gene() for _ in range(10)]

    def mutate(self):
        # Each gene has a 50% chance of flipping
        for gene in self.genes:
            if random.random() < 0.5:
                gene.mutate()

    def is_perfect(self):
        return all(gene.value == 1 for gene in self.genes)

    def __str__(self):
        return "".join(str(gene) for gene in self.genes)


# -------------------------
# DNA
# -------------------------

class DNA(Mutable):
    def __init__(self):
        self.chromosomes = [Chromosome() for _ in range(10)]

    def mutate(self):
        # Each chromosome has a 50% chance of mutating
        for chromosome in self.chromosomes:
            if random.random() < 0.5:
                chromosome.mutate()

    def is_perfect(self):
        return all(
            chromosome.is_perfect()
            for chromosome in self.chromosomes
        )

    def __str__(self):
        return "\n".join(str(chromosome) for chromosome in self.chromosomes)


# -------------------------
# Organism
# -------------------------

class Organism:
    def __init__(self, dna, environment):
        self.dna = dna
        self.environment = environment

    def mutate(self):
        # Environment controls probability of DNA mutation
        if random.random() < self.environment:
            self.dna.mutate()

    def is_perfect(self):
        return self.dna.is_perfect()


# -------------------------
# Experiment
# -------------------------

def experiment(number_of_organisms, environment):
    organisms = [
        Organism(DNA(), environment)
        for _ in range(number_of_organisms)
    ]

    generation = 0

    while True:
        generation += 1

        for organism in organisms:
            organism.mutate()

            if organism.is_perfect():
                return generation, organism


# -------------------------
# Run
# -------------------------

number_of_organisms = 100
environment = 0.5

generation, organism = experiment(
    number_of_organisms,
    environment
)

print("Perfect organism found!")
print("Generations:", generation)
print("\nDNA:")
print(organism.dna)
