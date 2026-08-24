import os
import time


# =========================
# CELL CLASSES
# =========================

class Cell:
    def __init__(self, alive=False):
        self.alive = alive

    def display(self):
        return "🟩" if self.alive else "⬜"


class AliveCell(Cell):
    def __init__(self):
        super().__init__(True)


class DeadCell(Cell):
    def __init__(self):
        super().__init__(False)


# =========================
# GAME OF LIFE
# =========================

class GameOfLife:
    def __init__(self, width, height, alive_cells=None):
        self.width = width
        self.height = height

        self.grid = [
            [DeadCell() for _ in range(width)]
            for _ in range(height)
        ]

        if alive_cells:
            for row, col in alive_cells:
                if 0 <= row < height and 0 <= col < width:
                    self.grid[row][col] = AliveCell()

    # Display the current grid
    def display(self):
        for row in self.grid:
            print(" ".join(cell.display() for cell in row))

    # Count the 8 neighbours of a cell
    def count_neighbors(self, row, col):
        count = 0

        for row_change in [-1, 0, 1]:
            for col_change in [-1, 0, 1]:

                # Don't count the cell itself
                if row_change == 0 and col_change == 0:
                    continue

                new_row = row + row_change
                new_col = col + col_change

                # Fixed borders
                if (
                    0 <= new_row < self.height
                    and 0 <= new_col < self.width
                ):
                    if self.grid[new_row][new_col].alive:
                        count += 1

        return count

    # Create the next generation
    def next_generation(self):
        new_grid = [
            [DeadCell() for _ in range(self.width)]
            for _ in range(self.height)
        ]

        for row in range(self.height):
            for col in range(self.width):

                neighbors = self.count_neighbors(row, col)
                current_cell = self.grid[row][col]

                # Rule 1:
                # Live cell with fewer than 2 neighbours dies
                if current_cell.alive and neighbors < 2:
                    new_grid[row][col] = DeadCell()

                # Rule 2:
                # Live cell with 2 or 3 neighbours survives
                elif current_cell.alive and neighbors in (2, 3):
                    new_grid[row][col] = AliveCell()

                # Rule 3:
                # Live cell with more than 3 neighbours dies
                elif current_cell.alive and neighbors > 3:
                    new_grid[row][col] = DeadCell()

                # Rule 4:
                # Dead cell with exactly 3 neighbours becomes alive
                elif not current_cell.alive and neighbors == 3:
                    new_grid[row][col] = AliveCell()

        self.grid = new_grid

    # Run the game
    def run(self, generations=20, delay=0.5):
        for generation in range(generations):

            os.system("cls" if os.name == "nt" else "clear")

            print(f"Generation {generation}")
            print("=" * 40)

            self.display()

            self.next_generation()

            time.sleep(delay)


# =========================
# EXAMPLES
# =========================

# 1. BLINKER
# Oscillates between horizontal and vertical.

blinker = [
    (4, 4),
    (4, 5),
    (4, 6)
]

game = GameOfLife(
    width=10,
    height=10,
    alive_cells=blinker
)

game.run(20, 0.3)