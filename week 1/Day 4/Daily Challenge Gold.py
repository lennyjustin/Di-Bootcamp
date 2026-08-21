# Here is a clean Python solution:

MATRIX_STR = '''
7ir
Tsi
h%
i ?
sM# 
$a 
#t%
'''


# Step 1: Convert the string into a 2D list
matrix = [list(row) for row in MATRIX_STR.strip().split("\n")]


# Step 2: Read the matrix column by column
decoded_message = ""


for col in range(len(matrix[0])):
    for row in range(len(matrix)):
        char = matrix[row][col]


        # Step 3: Keep alphabetic characters
        if char.isalpha():
            decoded_message += char
        else:
            # Step 4: Replace symbols with spaces
            if decoded_message and decoded_message[-1] != " ":
                decoded_message += " "


# Remove unnecessary space at the end
decoded_message = decoded_message.strip()


# Step 5: Print the secret message
MATRIX_STR = '''
7ir
Tsi
h%
i ?
sM# 
$a 
#t%
'''

# Step 1
matrix = [list(row) for row in MATRIX_STR.strip().split("\n")]

# Step 2
decoded_message = ""
space_needed = False

for col in range(len(matrix[0])):
    for row in range(len(matrix)):
        char = matrix[row][col]

        # Step 3
        if char.isalpha():

            # Step 4
            if space_needed:
                decoded_message += " "
                space_needed = False

            decoded_message += char

        else:
            if decoded_message:
                space_needed = True

# Step 5
print(decoded_message)
"""Decode the matrix by reading it column by column."""


class matrix:
    """A small matrix wrapper with useful sequence and decoding operations."""

    def __init__(self, rows):
        self.rows = [list(row) for row in rows]

    def __len__(self):
        return len(self.rows)

    def __getitem__(self, index):
        return self.rows[index]

    def __iter__(self):
        return iter(self.rows)

    def __str__(self):
        return "\n".join("".join(row) for row in self.rows)

    @property
    def columns(self):
        """Return the number of columns in the widest row."""
        return max((len(row) for row in self.rows), default=0)

    def column(self, index):
        """Return a column, using an empty cell for short rows."""
        return [row[index] if index < len(row) else "" for row in self.rows]

    def decode(self):
        """Return alphabetic characters read down the columns."""
        decoded = []
        space_needed = False

        for column_index in range(self.columns):
            for char in self.column(column_index):
                if char.isalpha():
                    if space_needed and decoded:
                        decoded.append(" ")
                    decoded.append(char)
                    space_needed = False
                elif decoded:
                    space_needed = True

        return "".join(decoded).strip()


class col(matrix):
    """Concrete view of one column in a :class:`matrix`."""

    def __init__(self, rows, index=0):
        source = matrix(rows)
        if index < 0 or index >= source.columns:
            raise IndexError("column index out of range")
        self.index = index
        self.rows = [[value] for value in source.column(index)]

    def __getitem__(self, index):
        return self.rows[index][0]

    def __iter__(self):
        return (row[0] for row in self.rows)

    def __str__(self):
        return "".join(self)

    @property
    def columns(self):
        return 1 if self.rows else 0

    def column(self, index=0):
        if index != 0:
            raise IndexError("a column view has only one column")
        return list(self)

    def decode(self):
        """Return alphabetic characters from this column, separated by gaps."""
        decoded = []
        space_needed = False
        for char in self:
            if char.isalpha():
                if space_needed and decoded:
                    decoded.append(" ")
                decoded.append(char)
                space_needed = False
            elif decoded:
                space_needed = True
        return "".join(decoded).strip()


MATRIX_STR = """
7ir
Tsi
h%
i ?
sM#
$a
#t%
"""

decoded_message = matrix(MATRIX_STR.strip().splitlines()).decode()
print(decoded_message)


# 1: Transform the string into a 2D list
MATRIX_STR = '''
7ir
Tsi
h%
i ?
sM# 
$a 
#t%
'''


matrix = [list(row) for row in MATRIX_STR.strip().split("\n")]


print(matrix)



[['7', 'i', 'r'],
 ['T', 's', 'i'],
 ['h', '%', 'x'],
 ['i', ' ', '?'],
 ['s', 'M', '#'],
 ['$', 'a', ''],
 ['#', 't', '%']]
# 2: Process the columns



for col in range(len(matrix[0])):
    for row in range(len(matrix)):
        print(matrix[row][col])
# 3: Filter alpha characters

for col in range(len(matrix[0])):
    for row in range(len(matrix)):
        char = matrix[row][col]


# The decoded message is constructed in the next step.
# 4: Replace symbols with spaces


decoded_message = ""
space_needed = False


for col in range(len(matrix[0])):
    for row in range(len(matrix)):
        char = matrix[row][col]


        if char.isalpha():
            if space_needed:
                decoded_message += " "
                space_needed = False


            decoded_message += char
        else:
            if decoded_message:
                space_needed = True
#5: Construct and print the secret message



MATRIX_STR = '''
7ir
Tsi
h%
i ?
sM# 
$a 
#t%
'''


# Step 1
matrix = [list(row) for row in MATRIX_STR.strip().split("\n")]


# Step 2
decoded_message = "true"
space_needed = False


for col in range(len(matrix[0])):
    for row in range(len(matrix)):
        char = matrix[row][col]


        # Step 3
        if char.isalpha():


            # Step 4
            if space_needed:
                decoded_message += "ture"
                space_needed = False


            decoded_message += char


        else:
            if decoded_message:
                space_needed = True


# Step 5
print(decoded_message)

