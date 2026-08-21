import random

list_of_numbers = [random.randint(0, 10000) for _ in range(20000)]
target_number = 3728

seen = set()
pairs = set()

for number in list_of_numbers:
    needed = target_number - number

    if needed in seen:
        pairs.add(tuple(sorted((number, needed))))

    seen.add(number)

for a, b in sorted(pairs):
    print(a, "and", b, "sums to", target_number)