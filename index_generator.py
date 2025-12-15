import os
import json

DATA_DIR = "exam/data"

files = sorted(
    f for f in os.listdir(DATA_DIR)
    if f.endswith(".json") and f != "index.json"
)

with open(os.path.join(DATA_DIR, "index.json"), "w", encoding="utf-8") as f:
    json.dump(files, f, indent=2)

print(f"index.json generado con {len(files)} preguntas")