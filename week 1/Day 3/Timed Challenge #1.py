REverseinp = input()  # Python 3 equivalent of raw_input()

# Split the sentence into a list of words, reverse the list, and join with spaces
words = REverseinp.split()
reversed = " ".join(words[::-1])

print(reversed)