string = input()
character = input()

count = 0

for char in string:
    if char == character:
        count += 1

print(count)