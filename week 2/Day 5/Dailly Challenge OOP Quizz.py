"""Daily challenge: OOP quiz and a deck of cards."""

import random


# Exercise 1: Quiz answers
#
# A class is a blueprint that defines the data and behavior of objects.
# An instance is a concrete object created from a class.
# Encapsulation groups data and methods together and controls access to the data.
# Abstraction exposes essential behavior while hiding implementation details.
# Inheritance lets a class reuse or extend behavior from another class.
# Multiple inheritance lets a class inherit from more than one parent class.
# Polymorphism lets different classes provide their own implementation of the
# same interface or method.
# Method resolution order (MRO) is the order Python follows when looking up a
# method or attribute through a class's inheritance hierarchy.


class Card:
	"""A playing card with a suit and a value."""

	def __init__(self, suit, value):
		self.suit = suit
		self.value = value

	def __repr__(self):
		return f"{self.value} of {self.suit}"


class Deck:
	"""A standard 52-card deck."""

	suits = ["Hearts", "Diamonds", "Clubs", "Spades"]
	values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

	def __init__(self):
		self.cards = []
		self._create_deck()

	def _create_deck(self):
		self.cards = [Card(suit, value) for suit in self.suits for value in self.values]

	def shuffle(self):
		"""Restore a complete deck and rearrange it randomly."""
		if len(self.cards) != 52:
			self._create_deck()
		random.shuffle(self.cards)

	def deal(self):
		"""Deal and remove one card, or return None when the deck is empty."""
		if not self.cards:
			return None
		return self.cards.pop()


if __name__ == "__main__":
	deck = Deck()
	deck.shuffle()
	print(deck.deal())
