french_words = ["Bonjour", "Au revoir", "Bienvenue", "A bientôt"]

translations: dict[str, str] = {
    "Bonjour": "Hello",
    "Au revoir": "Goodbye",
    "Bienvenue": "Welcome",
    "A bientôt": "See you soon",
}

result = {word: translations[word] for word in french_words}

print(result)