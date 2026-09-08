def display_board(board):
    """Display the current 3x3 game board."""
    print("\n    1   2   3")
    print("  -------------")

    for index, row in enumerate(board, start=1):
        print(f"{index} | " + " | ".join(row) + " |")
        print("  -------------")


def player_input(player, board):
    """Ask the player for a valid row and column."""
    while True:
        choice = input(
            f"Player {player}, enter row and column "
            "(for example, 1 3): "
        ).strip().split()

        if len(choice) != 2:
            print("Please enter two numbers, such as: 1 3")
            continue

        try:
            row, column = map(int, choice)
        except ValueError:
            print("Both values must be numbers.")
            continue

        if not (1 <= row <= 3 and 1 <= column <= 3):
            print("Row and column must be between 1 and 3.")
            continue

        row -= 1
        column -= 1

        if board[row][column] != " ":
            print("That position is already taken.")
            continue

        return row, column


def check_win(board, player):
    """Return True if the player has three symbols in a row."""
    rows = board

    columns = [
        [board[0][column], board[1][column], board[2][column]]
        for column in range(3)
    ]

    diagonals = [
        [board[0][0], board[1][1], board[2][2]],
        [board[0][2], board[1][1], board[2][0]]
    ]

    winning_lines = rows + columns + diagonals

    return any(
        all(position == player for position in line)
        for line in winning_lines
    )


def check_tie(board):
    """Return True if every board position is filled."""
    return all(
        position != " "
        for row in board
        for position in row
    )


def play():
    """Run the Tic Tac Toe game."""
    board = [
        [" ", " ", " "],
        [" ", " ", " "],
        [" ", " ", " "]
    ]

    current_player = "X"

    print("Welcome to Tic Tac Toe!")
    print("Enter moves using the format: row column")

    while True:
        display_board(board)

        row, column = player_input(current_player, board)
        board[row][column] = current_player

        if check_win(board, current_player):
            display_board(board)
            print(f"Player {current_player} wins!")
            break

        if check_tie(board):
            display_board(board)
            print("The game is a tie!")
            break

        if current_player == "X":
            current_player = "O"
        else:
            current_player = "X"


play()