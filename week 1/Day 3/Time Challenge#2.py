x = int(input("Enter the Number:"))

# Find all proper divisors (excluding x itself) and sum them up
divisors_sum = sum(i for i in range(1, x) if x % i == 0)

# Check if the sum of divisors equals the original number
if divisors_sum == x:
    print(True)
else:
    print(False)