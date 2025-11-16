#!/usr/bin/env python
# Test imports for dashboard

import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from database import CGMDatabase
    print("[OK] CGMDatabase imported successfully")
except ImportError as e:
    print(f"[ERROR] Failed to import CGMDatabase: {e}")

try:
    from pattern_identification import CGMPatternIdentifier
    print("[OK] CGMPatternIdentifier imported successfully")
except ImportError as e:
    print(f"[ERROR] Failed to import CGMPatternIdentifier: {e}")

try:
    from digital_avatar.api import avatar_bp, init_avatar_api
    print("[OK] digital_avatar.api imported successfully")
except ImportError as e:
    print(f"[ERROR] Failed to import digital_avatar.api: {e}")

print("\nAll imports tested.")

