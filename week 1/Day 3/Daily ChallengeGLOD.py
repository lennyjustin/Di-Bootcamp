message = input("Enter your message: ")
choice = input("Do you want to encrypt or decrypt? ").lower()
shift = int(input("Enter the shift: "))

result = ""

for letter in message:
    if letter.isalpha():
        if choice == "encrypt":
            result += chr((ord(letter) - ord('a') + shift) % 26 + ord('a'))
        elif choice == "decrypt":
            result += chr((ord(letter) - ord('a') - shift) % 26 + ord('a'))
    else:
        result += letter

print("Result:", result)