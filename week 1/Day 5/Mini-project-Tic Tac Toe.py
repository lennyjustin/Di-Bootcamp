import tkinter as tk
import random

# Game data - like your project
board = [' ']*9
NARUTO = "🍥"
SASUKE = "🔴"

wins = [(0,1,2),(3,4,5),(6,7,8),(0,3,6),(1,4,7),(2,5,8),(0,4,8),(2,4,6)]

def check_win(p):
    for a,b,c in wins:
        if board[a]==board[b]==board[c]==p:
            return True
    return False

def get_empty():
    empty = []
    for i in range(9):
        if board[i]==' ':
            empty.append(i)
    return empty

def reset_board():
    global board
    board = [' ']*9
    for b in buttons:
        b.config(text=" ", bg="#E6E6FA")
    status.config(text="NARUTO'S TURN 🍥")

def button_click(i):
    if board[i]!=' ':
        return

    # Naruto move
    board[i]=NARUTO
    buttons[i].config(text=NARUTO, bg="#FFB347")

    if check_win(NARUTO):
        status.config(text="NARUTO WINS! BELIEVE IT! 🍜")
        window.after(1500, reset_board)
        return

    if not get_empty():
        status.config(text="DRAW! Final Valley...")
        window.after(1500, reset_board)
        return

    # Sasuke move
    status.config(text="SASUKE THINKING... 🔴")
    window.after(500, computer_move)

def computer_move():
    empty = get_empty()

    # 1. Try to win
    for m in empty:
        board[m]=SASUKE
        if check_win(SASUKE):
            buttons[m].config(text=SASUKE, bg="#9370DB")
            status.config(text="SASUKE WINS! Chidori! ⚡")
            window.after(1500, reset_board)
            return
        board[m]=' '

    # 2. Block Naruto
    for m in empty:
        board[m]=NARUTO
        if check_win(NARUTO):
            board[m]=SASUKE
            buttons[m].config(text=SASUKE, bg="#9370DB")
            status.config(text="NARUTO'S TURN 🍥")
            return
        board[m]=' '

    # 3. Random
    if empty:
        m = random.choice(empty)
        board[m]=SASUKE
        buttons[m].config(text=SASUKE, bg="#9370DB")

    if check_win(SASUKE):
        status.config(text="SASUKE WINS! Hn... 🔴")
        window.after(1500, reset_board)
        return

    status.config(text="NARUTO'S TURN 🍥")

# Create window - looks like the game image
window = tk.Tk()
window.title("Naruto vs Sasuke")
window.config(bg="#2E1A47")
window.geometry("360x480")

tk.Label(window, text="NARUTO VS SASUKE", font=("Arial Black", 16), bg="#2E1A47", fg="#FFD700").pack(pady=10)

# Avatars
top = tk.Frame(window, bg="#2E1A47")
top.pack()
tk.Label(top, text="🍥", font=("Arial", 40), bg="#2E1A47").pack(side="left", padx=20)
tk.Label(top, text="VS", font=("Arial", 12, "bold"), bg="#2E1A47", fg="white").pack(side="left")
tk.Label(top, text="🔴", font=("Arial", 40), bg="#2E1A47").pack(side="left", padx=20)

status = tk.Label(window, text="NARUTO'S TURN 🍥", font=("Arial", 10, "bold"), bg="#FFDAB9", width=28)
status.pack(pady=10)

# Board - glowing like image
frame = tk.Frame(window, bg="#2E1A47")
frame.pack()

buttons = []
for i in range(9):
    b = tk.Button(frame, text=" ", font=("Arial", 24), width=3, height=1, bg="#E6E6FA", command=lambda x=i: button_click(x))
    b.grid(row=i//3, column=i%3, padx=5, pady=5)
    buttons.append(b)

tk.Label(window, text="GET 3 IN A ROW TO WIN!", bg="#2E1A47", fg="white", font=("Arial", 9)).pack(pady=10)

window.mainloop()
