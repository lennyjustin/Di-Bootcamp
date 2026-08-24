import random


class Card:
    def __init__(self, suit, value):
        self.suit = suit
        self.value = value

    def __str__(self):
        return f"{self.value} of {self.suit}"


class Deck:
    def __init__(self):
        suits = ["Hearts", "Diamonds", "Clubs", "Spades"]
        values = ["A", "2", "3", "4", "5", "6", "7",
                  "8", "9", "10", "J", "Q", "K"]

        self.cards = []

        for suit in suits:
            for value in values:
                self.cards.append(Card(suit, value))

    def shuffle(self):
        if len(self.cards) != 52:
            raise ValueError("The deck must have 52 cards.")

        random.shuffle(self.cards)

    def deal(self):
        if not self.cards:
            raise ValueError("No cards left in the deck.")

        return self.cards.pop()


deck = Deck()

deck.shuffle()

card = deck.deal()

print("Dealt:", card)
print("Cards remaining:", len(deck.cards))