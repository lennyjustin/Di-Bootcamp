# Multiply of a Number
# Get input from the user and convert it to an integer
number = int(input("Enter a number: "))
length = int(input("Enter the length: "))

# Generate list using a loop
multiples = []
for i in range(1, length + 1):
    multiples.append(number * i)

print(multiples) 
