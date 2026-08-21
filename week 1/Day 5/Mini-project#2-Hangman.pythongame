import random

wordslist = ['correction', 'childish', 'beach', 'python', 'assertive', 'interference', 'complete', 'share', 'credit card', 'rush', 'south']
word = random.choice(wordslist)

### YOUR CODE STARTS FROM HERE ###

# Modules: we already used random

def display_gallows(wrong_guesses):
    """Function to show gallows using IF-ELSE"""
    stages = [
        """

           | |
               |
               |
               |
               |

        """,
        """

           | |
           O |
               |
               |
               |

        """,
        """

           | |
           O |
           | |
               |
               |

        """,
        """

           | |
           O |
          /| |
               |
               |

        """,
        """

           | |
           O |
          /|\\ |
               |
               |

        """,
        """

           | |
           O |
          /|\\ |
          / |
               |

        """,
        """

           | |
           O |
          /|\\ |
          / \\ |
               |

        """
    ]
    print(stages[wrong_guesses])

def play_hangman():
    # LOOP + CONDITIONALS
    guessed_letters = [] # to track same letter
    wrong_guesses = 0
    max_wrong = 6

    # Create stars for each letter - LOOP
    display_word = []
    for char in word:
        if char == ' ':
            display_word.append(' ') # keep spaces for 'credit card'
        else:
            display_word.append('*')

    print("\n🔥 WELCOME TO HANGMAN 🔥")
    print(f"The word has {len(word)} characters")
    print(''.join(display_word))

    # MAIN GAME LOOP - while loop
    while True:
        print("\n" + "="*30)
        print(f"Guessed letters: {', '.join(guessed_letters)}")
        print(f"Wrong left: {max_wrong - wrong_guesses}")
        display_gallows(wrong_guesses)

        # Input
        guess = input("Guess a letter: ").lower()

        # CONDITIONALS: validation
        if len(guess)!= 1:
            print("❌ Please enter only ONE letter!")
            continue
        if not guess.isalpha():
            print("❌ Only letters allowed!")
            continue
        if guess in guessed_letters:
            print(f"⚠️ You already guessed '{guess}'! Try different.")
            continue

        guessed_letters.append(guess)

        # CONDITIONALS: check if letter in word
        if guess in word:
            print(f"✅ Good! '{guess}' is in the word!")
            # LOOP to fill all correct positions
            for i in range(len(word)): # for loop
                if word[i] == guess:
                    display_word[i] = guess
        else:
            print(f"❌ Nope! '{guess}' not in word.")
            wrong_guesses += 1 # add body part

        # Show current progress
        print("\nWord: " + ''.join(display_word))

        # CONDITIONALS: win / lose check
        if '*' not in display_word:
            print("\n🎉 YOU WIN! YOU SAVED HIM! 🎉")
            print(f"The word was: {word}")
            break

        if wrong_guesses == max_wrong:
            display_gallows(wrong_guesses)
            print("\n💀 GAME OVER! HANGED! 💀")
            print(f"The word was: {word}")
            break

# Function call
play_hangman()