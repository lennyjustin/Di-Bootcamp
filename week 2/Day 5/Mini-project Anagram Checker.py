from pathlib import Path


class AnagramChecker:
    """Load words and find anagrams without requiring another local module."""

    def __init__(self, dictionary_file):
        dictionary_path = Path(__file__).with_name(dictionary_file)
        with dictionary_path.open(encoding="utf-8") as file:
            self.word_list = [word.strip().lower() for word in file if word.strip()]

    def is_valid_word(self, word):
        return word.lower() in self.word_list

    def get_anagrams(self, word):
        normalized_word = word.lower()
        signature = sorted(normalized_word)
        return [
            candidate
            for candidate in self.word_list
            if candidate != normalized_word and sorted(candidate) == signature
        ]

def print_slayer_banner():
    print("""
🔥⚔️  DEMON SLAYER: ANAGRAM BREATH  ⚔️🔥
╔════════════════════════════════════╗
║  Total Concentration...            ║
║  ANAGRAM BREATH - First Form!      ║
║  Find the hidden demon words!      ║
╚════════════════════════════════════╝
    """)

def main():
    checker = AnagramChecker('sowpods.txt')
    print_slayer_banner()
    print(f"🌊 Tanjiro: The demon dictionary has {len(checker.word_list)} words... I can smell them!")

    while True:
        print("\n--- HASHIRA MENU ---")
        print("1. 🔥 Perform Breathing Technique (Check Word)")
        print("2. 🌙 Rest at Butterfly Mansion (Exit)")

        choice = input("Your choice, Slayer > ").strip()

        if choice == '2':
            print("\nNezuko: Mmm! Mmm! (Goodbye!) 🎋")
            print("Zenitsu: DON'T LEAVE ME ALONE WITH DEMONS!! 😭")
            break

        if choice != '1':
            print("❌ Inosuke: YOU'RE DOING IT WRONG, MONJIRO! PICK 1 OR 2! 🐗")
            continue

        user_word = input("\n⚔️ Enter your demon word > ").strip()

        # Validation with Demon Slayer characters
        if len(user_word.split()) > 1:
            print(f"❌ Shinobu: Ara ara~ Only ONE word, with a smile 😊 You typed {len(user_word.split())}")
            continue
        if not user_word.isalpha():
            print("❌ Sanemi: NO SYMBOLS! WIND BREATH DOESN'T LIKE THAT! 💨")
            continue

        # DISPLAY
        print(f"\n{'='*50}")
        print(f"☀️ YOUR WORD: \"{user_word.upper()}\" ☀️")

        if checker.is_valid_word(user_word):
            print(f"✅ Valid! This word exists like a Hashira! It's in the Demon Slayer Corps records! 📜")
        else:
            print(f"⚠️  Not in records... like a demon hiding! Muzan wouldn't know this word!")

        anagrams = checker.get_anagrams(user_word)

        if anagrams:
            print(f"\n🔥 {len(anagrams)} DEMONS FOUND & SLAYED!")
            print(f"⚔️ Anagrams: {', '.join([a.upper() for a in anagrams])}")
            
            # Different reactions based on count
            if len(anagrams) >= 3:
                print(f"   Rengoku: UMAl! {len(anagrams)} demons slain! SET YOUR HEART ABLAZE! 🔥")
            elif len(anagrams) == 2:
                print(f"   Tanjiro: Water Breathing... I can cut both! 🌊")
            else:
                print(f"   Zenitsu: I ONLY GOT ONE! BUT I GAVE IT MY ALL! ⚡ Thunderclap!")
        else:
            print(f"\n🌙 No anagrams... The demon escaped into the night.")
            print(f"   Giyu: ... (says nothing and leaves)")

        print(f"{'='*50}")

if __name__ == "__main__":
    main()