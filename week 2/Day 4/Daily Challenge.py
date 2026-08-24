import string
import re


# Part I: Text Analysis
class Text:
    def __init__(self, text):
        self.text = text

    # Step 2: Word frequency
    def word_frequency(self, word):
        words = self.text.split()
        count = words.count(word)

        if count == 0:
            return None

        return count

    # Step 3: Most common word
    def most_common_word(self):
        words = self.text.split()

        if not words:
            return None

        frequencies = {}

        for word in words:
            frequencies[word] = frequencies.get(word, 0) + 1

        return max(frequencies, key=frequencies.get)

    # Step 4: Unique words
    def unique_words(self):
        words = self.text.split()
        return list(set(words))

    # Step 5: Read text from a file
    @classmethod
    def from_file(cls, file_path):
        with open(file_path, "r", encoding="utf-8") as file:
            text = file.read()

        return cls(text)


# Part II: Text Modification
class TextModification(Text):

    # Step 7: Remove punctuation
    def remove_punctuation(self):
        punctuation = string.punctuation

        self.text = self.text.translate(
            str.maketrans("", "", punctuation)
        )

        return self.text

    # Step 8: Remove stop words
    def remove_stop_words(self):
        stop_words = {
            "a", "an", "the", "and", "or", "but",
            "is", "are", "was", "were", "am",
            "be", "been", "being", "to", "of",
            "in", "on", "at", "for", "with",
            "as", "by", "from", "that", "this",
            "these", "those", "it", "its",
            "i", "you", "he", "she", "we",
            "they", "me", "him", "her", "us", "them"
        }

        words = self.text.split()

        filtered_words = []

        for word in words:
            if word.lower() not in stop_words:
                filtered_words.append(word)

        self.text = " ".join(filtered_words)

        return self.text

    # Step 9: Remove special characters
    def remove_special_characters(self):
        self.text = re.sub(r"[^a-zA-Z0-9\s]", "", self.text)

        return self.text


# --------------------------------
# Testing the Text class
# --------------------------------

text = Text("hello world hello python python python")

print("Word frequency:")
print(text.word_frequency("hello"))
# Output: 2

print("\nMost common word:")
print(text.most_common_word())
# Output: python

print("\nUnique words:")
print(text.unique_words())
# Output: ['hello', 'world', 'python']


# --------------------------------
# Testing TextModification class
# --------------------------------

modified_text = TextModification(
    "Hello, world! Python is great. @Python #coding"
)

print("\nOriginal text:")
print(modified_text.text)

print("\nAfter removing punctuation:")
print(modified_text.remove_punctuation())

print("\nAfter removing stop words:")
print(modified_text.remove_stop_words())

print("\nAfter removing special characters:")
print(modified_text.remove_special_characters())