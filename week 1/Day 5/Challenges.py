# Exercise 1
def insert_item(my_list, item, index):
    my_list.insert(index, item)
    return my_list




print(insert_item([1, 2, 4, 5], 3, 2))
# [1, 2, 3, 4, 5]
# Exercise 2
def count_spaces(text):
    count = 0


    for char in text:
        if char == " ":
            count += 1


    return count




print(count_spaces("Hello world how are you"))
# 4
# Exercise 3
def count_case(text):
    upper = 0
    lower = 0


    for char in text:
        if char.isupper():
            upper += 1
        elif char.islower():
            lower += 1


    return upper, lower




print(count_case("Hello WORLD"))
# (6, 5)
# Exercise 4
def my_sum(numbers):
    total = 0


    for number in numbers:
        total += number


    return total




print(my_sum([1, 5, 4, 2]))
# 12
# Exercise 5
def find_max(numbers):
    maximum = numbers[0]


    for number in numbers:
        if number > maximum:
            maximum = number


    return maximum




print(find_max([0, 1, 3, 50]))
# 50
# Exercise 6
def factorial(number):
    result = 1


    for i in range(1, number + 1):
        result *= i


    return result




print(factorial(4))
# 24
# Exercise 7
def list_count(my_list, element):
    count = 0


    for item in my_list:
        if item == element:
            count += 1


    return count




print(list_count(["a", "a", "t", "o"], "a"))
# 2
# Exercise 8
import math


def norm(numbers):
    total = 0


    for number in numbers:
        total += number ** 2


    return math.sqrt(total)




print(norm([1, 2, 2]))
# 3.0
# Exercise 9
def is_mono(numbers):
    increasing = True
    decreasing = True


    for i in range(len(numbers) - 1):
        if numbers[i] > numbers[i + 1]:
            increasing = False


        if numbers[i] < numbers[i + 1]:
            decreasing = False


    return increasing or decreasing




print(is_mono([7, 6, 5, 5, 2, 0]))
# True


print(is_mono([2, 3, 3, 3]))
# True


print(is_mono([1, 2, 0, 4]))
# False
#Exercise 10
def longest_word(words):
    longest = words[0]


    for word in words:
        if len(word) > len(longest):
            longest = word


    print(longest)




longest_word(["cat", "elephant", "dog", "computer"])
# elephant
# Exercise 11
def separate_types(items):
    integers = []
    strings = []


    for item in items:
        if isinstance(item, int) and not isinstance(item, bool):
            integers.append(item)
        elif isinstance(item, str):
            strings.append(item)


    return integers, strings




numbers, words = separate_types([1, "hello", 2, "world", 3])


print(numbers)
# [1, 2, 3]


print(words)
# ['hello', 'world']
# Exercise 12
def is_palindrome(text):
    reversed_text = ""


    for char in text:
        reversed_text = char + reversed_text


    return text == reversed_text




print(is_palindrome("radar"))
# True


print(is_palindrome("John"))
# False
# Exercise 13
def sum_over_k(sentence, k):
    count = 0


    words = sentence.split()


    for word in words:
        if len(word) > k:
            count += 1


    return count




sentence = "Do or do not there is no try"
k = 2


print(sum_over_k(sentence, k))
# 3
# Exercise 14
def dict_avg(dictionary):
    total = 0


    for value in dictionary.values():
        total += value


    return total / len(dictionary)




print(dict_avg({"a": 1, "b": 2, "c": 8, "d": 1}))
# 3.0
#Exercise 15
def common_div(num1, num2):
    divisors = []


    for i in range(1, min(num1, num2) + 1):
        if num1 % i == 0 and num2 % i == 0:
            divisors.append(i)


    return divisors




print(common_div(10, 20))
# [1, 2, 5, 10]

# The exercise's example leaves out 1, but mathematically 1 is also a common divisor.

# Exercise 16
def is_prime(number):
    if number < 2:
        return False


    for i in range(2, number):
        if number % i == 0:
            return False


    return True




print(is_prime(11))
# True


print(is_prime(12))
# False

# Exercise 17
# The wording means: print values that are even and whose indexes are even.

def weird_print(numbers):
    result = []


    for index in range(len(numbers)):
        if index % 2 == 0 and numbers[index] % 2 == 0:
            result.append(numbers[index])


    print(result)




weird_print([1, 2, 2, 3, 4, 5])
# [2, 4]
# Exercise 18
def type_count(**kwargs):
    counts = {}


    for value in kwargs.values():
        type_name = type(value).__name__


        if type_name not in counts:
            counts[type_name] = 0


        counts[type_name] += 1


    for type_name, count in counts.items():
        print(f"{type_name}: {count}")




type_count(a=1, b="string", c=1.0, d=True, e=False)


# Exercise 19
def my_split(text, separator=None):
    words = []
    current = ""


    for char in text:
        if separator is None:
            is_separator = char.isspace()
        else:
            is_separator = char == separator


        if is_separator:
            if current != "":
                words.append(current)
                current = ""
        else:
            current += char


    if current != "":
        words.append(current)


    return words




print(my_split("Hello world Python"))
# ['Hello', 'world', 'Python']


print(my_split("apple,banana,orange", ","))
# ['apple', 'banana', 'orange']
# Exercise 20
def password_format(text):
    result = ""


    for char in text:
        result += "*"


    return result




print(password_format("mypassword"))
# **********

