"""Anagram checker logic."""


class AnagramChecker:
    """Check words and find their anagrams from a word list."""

    def __init__(self, word_list_path="word_list.txt"):
        """Load a newline-separated word list in lowercase."""
        with open(word_list_path, "r", encoding="utf-8") as word_file:
            self.word_list = [
                line.strip().lower()
                for line in word_file
                if line.strip()
            ]

    def is_valid_word(self, word):
        """Return True if word exists in the word list."""
        return word.strip().lower() in self.word_list

    def is_anagram(self, word1, word2):
        """Return True if word1 and word2 contain the same letters."""
        return sorted(word1.strip().lower()) == sorted(word2.strip().lower())

    def get_anagrams(self, word):
        """Return all different words in the list that are anagrams of word."""
        anagrams = []
        normalized_word = word.strip().lower()

        for candidate in self.word_list:
            if candidate != normalized_word and self.is_anagram(normalized_word, candidate):
                anagrams.append(candidate)

        return anagrams
    