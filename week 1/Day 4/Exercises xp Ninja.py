# 1 what's your name?
def get_full_name(first_name, last_name, middle_name=None):
    if middle_name:
        return f"{first_name.title()} {middle_name.title()} {last_name.title()}"
    else:
        return f"{first_name.title()} {last_name.title()}"


print(get_full_name("john", "lee", "hooker"))
print(get_full_name("bruce", "lee"))


# : 2 English to morse
morse = {
    "A": ".-", "B": "-...", "C": "-.-.", "D": "-..",
    "E": ".", "F": "..-.", "G": "--.", "H": "....",
    "I": "..", "J": ".---", "K": "-.-", "L": ".-..",
    "M": "--", "N": "-.", "O": "---", "P": ".--.",
    "Q": "--.-", "R": ".-.", "S": "...", "T": "-",
    "U": "..-", "V": "...-", "W": ".--", "X": "-..-",
    "Y": "-.--", "Z": "--.."
}


def english_to_morse(text):
    result = []


    for word in text.upper().split():
        result.append(" ".join(morse[letter] for letter in word))


    return " / ".join(result)

def morse_to_english(text):
    reverse = {value: key for key, value in morse.items()}
    result = []

    for word in text.split(" / "):
        result.append("".join(reverse[letter] for letter in word.split()))

    return " ".join(result)

print(english_to_morse("Hello World"))
print(morse_to_english(".... . .-.. .-.. --- / .-- --- .-. .-.. -.."))


# 3 :Box of stars
def box_printer(*strings):
    longest = max(len(string) for string in strings)


    print("*" * (longest + 4))


    for string in strings:
        print(f"* {string:<{longest}} *")


    print("*" * (longest + 4))


box_printer("Hello", "World", "in", "reallylongword", "a", "frame")

#4: Purpose of the code

# The code is an Insertion Sort algorithm. It sorts the list from smallest to largest.

def insertion_sort(alist):
    for index in range(1, len(alist)):
        currentvalue = alist[index]
        position = index


        while position > 0 and alist[position - 1] > currentvalue:
            alist[position] = alist[position - 1]
            position -= 1


        alist[position] = currentvalue


alist = [54, 26, 93, 17, 77, 31, 44, 55, 20]


insertion_sort(alist)


print(alist)