#1: Letter Index Dictionary
word = input("Enter a word: ")


letter_indices = {}


for index, letter in enumerate(word):
    if letter in letter_indices:
        letter_indices[letter].append(index)
    else:
        letter_indices[letter] = [index]


print(letter_indices)



{'d': [0, 2], 'o': [1, 3]}


#2: Affordable Items
items_purchase = {
    "Water": "$1",
    "Bread": "$3",
    "TV": "$1,000",
    "Fertilizer": "$20"
}


wallet = "$300"


wallet = int(wallet.replace("$", "").replace(",", ""))


basket = []


for item, price in items_purchase.items():
    price = int(price.replace("$", "").replace(",", ""))


    if price <= wallet:
        basket.append(item)
        wallet -= price


if basket:
    print(sorted(basket))
else:
    print("Nothing")



['Bread', 'Fertilizer', 'Water']



items_purchase = {
    "Apple": "$4",
    "Honey": "$3",
    "Fan": "$14",
    "Bananas": "$4",
    "Pan": "$100",
    "Spoon": "$2"
}


wallet = "$100"


wallet = int(wallet.replace("$", "").replace(",", ""))


basket = []


for item, price in items_purchase.items():
    price = int(price.replace("$", "").replace(",", ""))


    if price <= wallet:
        basket.append(item)
        wallet -= price


if basket:
    print(sorted(basket))
else:
    print("Nothing")

Output # type: ignore

['Apple', 'Bananas', 'Fan', 'Honey', 'Spoon']

