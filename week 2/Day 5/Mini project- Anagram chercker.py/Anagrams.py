"""Command-line interface for the anagram checker."""

import sys
from pathlib import Path

from Anagram_chercker import AnagramChecker


def main():
    word_list_path = (
        sys.argv[1]
        if len(sys.argv) > 1
        else Path(__file__).with_name("word_list.txt")
    )

    try:
        checker = AnagramChecker(word_list_path)
    except FileNotFoundError:
        print(f"Error: word list not found: {word_list_path}")
        return 1

    print("=== Anagram Checker ===")
    print("Enter a word to check it and find its anagrams.")
    print("Type 'quit' to exit.")

    while True:
        try:
            word = input("\nEnter a word: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye!")
            return 0

        if word.lower() in {"quit", "exit"}:
            print("Goodbye!")
            return 0

        if not word:
            print("Please enter a word.")
            continue

        if not word.isalpha():
            print("Please enter letters only.")
            continue

        is_valid = checker.is_valid_word(word)
        print(f"\nWord: {word}")
        print(f"Valid word: {'Yes' if is_valid else 'No'}")

        if not is_valid:
            print("Anagrams: None (the word is not in the word list)")
            continue

        anagrams = checker.get_anagrams(word)
        print(f"Anagrams: {', '.join(anagrams) if anagrams else 'None found'}")


if __name__ == "__main__":
    raise SystemExit(main())