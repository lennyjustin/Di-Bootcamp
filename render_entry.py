import sys
from pathlib import Path

project_root = Path(__file__).resolve().parent
project_dirs = list((project_root / "week 5" / "Day 5").glob("Hackathon *1"))
if len(project_dirs) != 1:
    raise RuntimeError("Expected exactly one Hackathon 1 project directory.")

sys.path.insert(0, str(project_dirs[0]))
from app import app
