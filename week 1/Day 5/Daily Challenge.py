# Challenge 1
words = input()


words = words.split(",")


words.sort()


words = ",".join(words)


print(words)
# Challenge 2
def longest_word(sentence):
    words = sentence.split()


    longest = words[0]


    for word in words:
        if len(word) > len(longest):
            longest = word


    return longest




print(longest_word("Margaret's toy is a pretty doll."))
print(longest_word("A thing of beauty is a joy forever."))
print(longest_word("Forgetfulness is by all means powerless!"))

