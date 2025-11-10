"""
Pattern Identification Scheduler

This module runs pattern identification for all users every 4 hours.
"""

import schedule
import time
from datetime import datetime
from .identifier import CGMPatternIdentifier
import sys
import io

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


def run_pattern_identification():
    """Run pattern identification for all users."""
    print(f"\n{'='*60}")
    print(f"Scheduled Pattern Identification - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}")
    
    try:
        identifier = CGMPatternIdentifier()
        results = identifier.run_pattern_identification_for_all_users()
        
        # Print summary
        total_patterns = sum(r['patterns_detected'] for r in results)
        print(f"\n✓ Successfully completed pattern identification")
        print(f"  - Users processed: {len(results)}")
        print(f"  - Total patterns detected: {total_patterns}")
        
    except Exception as e:
        print(f"\n✗ Error during pattern identification: {e}")
        import traceback
        traceback.print_exc()


def start_scheduler():
    """Start the pattern identification scheduler."""
    print("="*60)
    print("CGM Pattern Identification Scheduler")
    print("="*60)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("Schedule: Every 4 hours")
    print("="*60)
    
    # Schedule the job to run every 4 hours
    schedule.every(4).hours.do(run_pattern_identification)
    
    # Run immediately on startup
    print("\nRunning initial pattern identification...")
    run_pattern_identification()
    
    print(f"\nScheduler is now running. Next run in 4 hours.")
    print("Press Ctrl+C to stop.\n")
    
    # Keep the scheduler running
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    except KeyboardInterrupt:
        print("\n\nScheduler stopped by user.")


if __name__ == '__main__':
    start_scheduler()


