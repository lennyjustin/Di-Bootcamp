students = []

for i in range(5):
    name = input()
    age = input()
    score = input()
    students.append((name, age, score))

students.sort(key=lambda x: (x[0], x[1], x[2]))

print(students)