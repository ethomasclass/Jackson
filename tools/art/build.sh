#!/bin/sh
# Regenerate every asset from source.
cd "$(dirname "$0")"
python3 portraits.py && python3 tiles.py && python3 sprites.py && python3 buildings.py && python3 evidence.py
