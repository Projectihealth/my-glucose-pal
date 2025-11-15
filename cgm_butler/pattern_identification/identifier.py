"""
CGM Pattern Identification Module

This module identifies common glucose patterns from CGM data and provides
actionable recommendations for each detected pattern.
"""

import sqlite3
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import statistics


class CGMPatternIdentifier:
    """Identifies common glucose patterns from CGM readings."""
    
    # Define 10 most common CGM patterns
    PATTERNS = {
        'post_meal_spike': {
            'name': 'Post-Meal Spike',
            'description': 'Rapid glucose increase after meals',
            'severity': 'medium',
            'category': 'meal'
        },
        'dawn_phenomenon': {
            'name': 'Dawn Phenomenon',
            'description': 'Early morning glucose rise (4-8 AM)',
            'severity': 'medium',
            'category': 'time_of_day'
        },
        'nocturnal_hypoglycemia': {
            'name': 'Nocturnal Hypoglycemia',
            'description': 'Low glucose during night (12-6 AM)',
            'severity': 'high',
            'category': 'time_of_day'
        },
        'afternoon_dip': {
            'name': 'Afternoon Dip',
            'description': 'Glucose drop in afternoon (2-5 PM)',
            'severity': 'low',
            'category': 'time_of_day'
        },
        'high_variability': {
            'name': 'High Glucose Variability',
            'description': 'Frequent fluctuations between high and low',
            'severity': 'high',
            'category': 'variability'
        },
        'sustained_hyperglycemia': {
            'name': 'Sustained Hyperglycemia',
            'description': 'Prolonged high glucose levels (>180 mg/dL)',
            'severity': 'high',
            'category': 'level'
        },
        'frequent_hypoglycemia': {
            'name': 'Frequent Hypoglycemia',
            'description': 'Multiple low glucose episodes (<70 mg/dL)',
            'severity': 'high',
            'category': 'level'
        },
        'post_exercise_drop': {
            'name': 'Post-Exercise Drop',
            'description': 'Glucose decline after physical activity',
            'severity': 'medium',
            'category': 'activity'
        },
        'stress_hyperglycemia': {
            'name': 'Stress-Related Hyperglycemia',
            'description': 'Elevated glucose during stress periods',
            'severity': 'medium',
            'category': 'stress'
        },
        'roller_coaster': {
            'name': 'Roller Coaster Pattern',
            'description': 'Alternating high and low glucose swings',
            'severity': 'high',
            'category': 'variability'
        }
    }
    
    def __init__(self, db_path: str = None):
        """
        Initialize the pattern identifier with database connection.
        
        Args:
            db_path: Path to the database file. If None, uses default path.
        """
        if db_path is None:
            # Default to database/cgm_butler.db relative to project root
            project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            db_path = os.path.join(project_root, 'database', 'cgm_butler.db')
        self.db_path = db_path
    
    def _get_connection(self):
        """Get database connection."""
        return sqlite3.connect(self.db_path)
    
    def get_user_readings(self, user_id: str, hours: int = 168) -> List[Dict]:
        """
        Get CGM readings for a user within the specified time window.
        
        Args:
            user_id: User identifier
            hours: Number of hours to look back (default: 168 = 7 days)
        
        Returns:
            List of reading dictionaries with timestamp and glucose_value
        """
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        cursor.execute('''
            SELECT timestamp, glucose_value
            FROM cgm_readings
            WHERE user_id = ? AND timestamp >= ?
            ORDER BY timestamp ASC
        ''', (user_id, cutoff_time.isoformat()))
        
        readings = [
            {'timestamp': datetime.fromisoformat(row[0]), 'glucose_value': row[1]}
            for row in cursor.fetchall()
        ]
        
        conn.close()
        return readings
    
    def detect_post_meal_spike(self, readings: List[Dict]) -> Optional[Dict]:
        """
        Detect post-meal glucose spikes.
        Criteria: Increase of >50 mg/dL within 2 hours, reaching >140 mg/dL
        """
        if len(readings) < 24:  # Need at least 2 hours of data (5-min intervals)
            return None
        
        spike_count = 0
        max_spike = 0
        
        for i in range(len(readings) - 24):
            window = readings[i:i+24]  # 2-hour window
            start_glucose = window[0]['glucose_value']
            max_glucose = max(r['glucose_value'] for r in window)
            spike = max_glucose - start_glucose
            
            if spike > 50 and max_glucose > 140:
                spike_count += 1
                max_spike = max(max_spike, spike)
        
        if spike_count >= 3:  # At least 3 spikes in the period
            return {
                'pattern_type': 'post_meal_spike',
                'confidence': min(0.9, 0.5 + (spike_count * 0.1)),
                'details': f'Detected {spike_count} post-meal spikes, max spike: {max_spike:.0f} mg/dL',
                'severity': 'high' if max_spike > 80 else 'medium'
            }
        return None
    
    def detect_dawn_phenomenon(self, readings: List[Dict]) -> Optional[Dict]:
        """
        Detect dawn phenomenon (early morning glucose rise).
        Criteria: Glucose increase of >20 mg/dL between 4-8 AM
        """
        morning_rises = []
        
        for reading in readings:
            hour = reading['timestamp'].hour
            if 4 <= hour < 8:
                morning_rises.append(reading['glucose_value'])
        
        if len(morning_rises) < 10:
            return None
        
        # Check if morning readings are consistently higher
        avg_morning = statistics.mean(morning_rises)
        
        # Get overnight readings (12-4 AM)
        overnight_readings = [
            r['glucose_value'] for r in readings
            if 0 <= r['timestamp'].hour < 4
        ]
        
        if not overnight_readings:
            return None
        
        avg_overnight = statistics.mean(overnight_readings)
        rise = avg_morning - avg_overnight
        
        if rise > 20:
            return {
                'pattern_type': 'dawn_phenomenon',
                'confidence': min(0.9, 0.6 + (rise / 100)),
                'details': f'Average glucose rise of {rise:.0f} mg/dL in early morning',
                'severity': 'high' if rise > 40 else 'medium'
            }
        return None
    
    def detect_nocturnal_hypoglycemia(self, readings: List[Dict]) -> Optional[Dict]:
        """
        Detect nocturnal hypoglycemia (low glucose at night).
        Criteria: Glucose <70 mg/dL between 12-6 AM
        """
        night_lows = []
        
        for reading in readings:
            hour = reading['timestamp'].hour
            if (0 <= hour < 6) and reading['glucose_value'] < 70:
                night_lows.append(reading)
        
        if len(night_lows) >= 3:
            min_glucose = min(r['glucose_value'] for r in night_lows)
            return {
                'pattern_type': 'nocturnal_hypoglycemia',
                'confidence': 0.9,
                'details': f'Detected {len(night_lows)} low glucose episodes at night, lowest: {min_glucose} mg/dL',
                'severity': 'high'
            }
        return None
    
    def detect_afternoon_dip(self, readings: List[Dict]) -> Optional[Dict]:
        """
        Detect afternoon glucose dips.
        Criteria: Glucose drops below 80 mg/dL between 2-5 PM
        """
        afternoon_dips = []
        
        for reading in readings:
            hour = reading['timestamp'].hour
            if (14 <= hour < 17) and reading['glucose_value'] < 80:
                afternoon_dips.append(reading)
        
        if len(afternoon_dips) >= 5:
            avg_dip = statistics.mean(r['glucose_value'] for r in afternoon_dips)
            return {
                'pattern_type': 'afternoon_dip',
                'confidence': 0.7,
                'details': f'Detected {len(afternoon_dips)} afternoon dips, average: {avg_dip:.0f} mg/dL',
                'severity': 'low' if avg_dip > 70 else 'medium'
            }
        return None
    
    def detect_high_variability(self, readings: List[Dict]) -> Optional[Dict]:
        """
        Detect high glucose variability.
        Criteria: Coefficient of variation (CV) > 36%
        """
        if len(readings) < 50:
            return None
        
        glucose_values = [r['glucose_value'] for r in readings]
        mean_glucose = statistics.mean(glucose_values)
        std_glucose = statistics.stdev(glucose_values)
        cv = (std_glucose / mean_glucose) * 100
        
        if cv > 36:
            return {
                'pattern_type': 'high_variability',
                'confidence': min(0.9, 0.5 + (cv / 100)),
                'details': f'Glucose variability (CV): {cv:.1f}%, std dev: {std_glucose:.0f} mg/dL',
                'severity': 'high' if cv > 50 else 'medium'
            }
        return None
    
    def detect_sustained_hyperglycemia(self, readings: List[Dict]) -> Optional[Dict]:
        """
        Detect sustained high glucose levels.
        Criteria: >70% of readings above 180 mg/dL
        """
        if len(readings) < 50:
            return None
        
        high_readings = [r for r in readings if r['glucose_value'] > 180]
        percentage = (len(high_readings) / len(readings)) * 100
        
        if percentage > 70:
            avg_high = statistics.mean(r['glucose_value'] for r in high_readings)
            return {
                'pattern_type': 'sustained_hyperglycemia',
                'confidence': 0.9,
                'details': f'{percentage:.0f}% of readings above 180 mg/dL, average: {avg_high:.0f} mg/dL',
                'severity': 'high'
            }
        return None
    
    def detect_frequent_hypoglycemia(self, readings: List[Dict]) -> Optional[Dict]:
        """
        Detect frequent low glucose episodes.
        Criteria: >5% of readings below 70 mg/dL
        """
        if len(readings) < 50:
            return None
        
        low_readings = [r for r in readings if r['glucose_value'] < 70]
        percentage = (len(low_readings) / len(readings)) * 100
        
        if percentage > 5:
            avg_low = statistics.mean(r['glucose_value'] for r in low_readings)
            return {
                'pattern_type': 'frequent_hypoglycemia',
                'confidence': 0.9,
                'details': f'{percentage:.1f}% of readings below 70 mg/dL, average: {avg_low:.0f} mg/dL',
                'severity': 'high'
            }
        return None
    
    def detect_post_exercise_drop(self, readings: List[Dict]) -> Optional[Dict]:
        """
        Detect post-exercise glucose drops.
        Criteria: Rapid drop of >30 mg/dL within 1 hour
        Note: This is a simplified detection without actual exercise data
        """
        if len(readings) < 12:
            return None
        
        rapid_drops = 0
        
        for i in range(len(readings) - 12):
            window = readings[i:i+12]  # 1-hour window
            start_glucose = window[0]['glucose_value']
            min_glucose = min(r['glucose_value'] for r in window)
            drop = start_glucose - min_glucose
            
            if drop > 30 and min_glucose < 100:
                rapid_drops += 1
        
        if rapid_drops >= 3:
            return {
                'pattern_type': 'post_exercise_drop',
                'confidence': 0.6,  # Lower confidence without exercise data
                'details': f'Detected {rapid_drops} rapid glucose drops (possibly after exercise)',
                'severity': 'medium'
            }
        return None
    
    def detect_stress_hyperglycemia(self, readings: List[Dict]) -> Optional[Dict]:
        """
        Detect stress-related hyperglycemia.
        Criteria: Sudden spikes without meal patterns
        Note: Simplified detection without stress data
        """
        if len(readings) < 24:
            return None
        
        sudden_spikes = 0
        
        for i in range(len(readings) - 6):
            window = readings[i:i+6]  # 30-minute window
            start_glucose = window[0]['glucose_value']
            max_glucose = max(r['glucose_value'] for r in window)
            spike = max_glucose - start_glucose
            
            if spike > 40 and start_glucose > 120:  # Spike from already elevated level
                sudden_spikes += 1
        
        if sudden_spikes >= 5:
            return {
                'pattern_type': 'stress_hyperglycemia',
                'confidence': 0.5,  # Lower confidence without stress data
                'details': f'Detected {sudden_spikes} sudden glucose spikes (possibly stress-related)',
                'severity': 'medium'
            }
        return None
    
    def detect_roller_coaster(self, readings: List[Dict]) -> Optional[Dict]:
        """
        Detect roller coaster pattern (alternating highs and lows).
        Criteria: Frequent swings between <80 and >160 mg/dL
        """
        if len(readings) < 50:
            return None
        
        swings = 0
        for i in range(len(readings) - 24):
            window = readings[i:i+24]  # 2-hour window
            min_glucose = min(r['glucose_value'] for r in window)
            max_glucose = max(r['glucose_value'] for r in window)
            
            if min_glucose < 80 and max_glucose > 160:
                swings += 1
        
        if swings >= 5:
            glucose_values = [r['glucose_value'] for r in readings]
            range_glucose = max(glucose_values) - min(glucose_values)
            return {
                'pattern_type': 'roller_coaster',
                'confidence': 0.8,
                'details': f'Detected {swings} glucose swings, range: {range_glucose:.0f} mg/dL',
                'severity': 'high'
            }
        return None
    
    def identify_patterns(self, user_id: str) -> List[Dict]:
        """
        Identify all patterns for a given user.
        
        Args:
            user_id: User identifier
        
        Returns:
            List of detected patterns with details
        """
        readings = self.get_user_readings(user_id, hours=168)  # Last 7 days
        
        if not readings:
            return []
        
        detected_patterns = []
        
        # Run all pattern detection methods
        detection_methods = [
            self.detect_post_meal_spike,
            self.detect_dawn_phenomenon,
            self.detect_nocturnal_hypoglycemia,
            self.detect_afternoon_dip,
            self.detect_high_variability,
            self.detect_sustained_hyperglycemia,
            self.detect_frequent_hypoglycemia,
            self.detect_post_exercise_drop,
            self.detect_stress_hyperglycemia,
            self.detect_roller_coaster
        ]
        
        for method in detection_methods:
            try:
                result = method(readings)
                if result:
                    # Add pattern metadata
                    pattern_type = result['pattern_type']
                    result.update(self.PATTERNS[pattern_type])
                    result['detected_at'] = datetime.now().isoformat()
                    result['user_id'] = user_id
                    detected_patterns.append(result)
            except Exception as e:
                print(f"Error detecting pattern with {method.__name__}: {e}")
        
        return detected_patterns
    
    def save_patterns_to_db(self, patterns: List[Dict]) -> int:
        """
        Save detected patterns to the database.
        
        Args:
            patterns: List of detected patterns
        
        Returns:
            Number of patterns saved
        """
        if not patterns:
            return 0
        
        conn = self._get_connection()
        cursor = conn.cursor()
        
        # Create user_patterns table if it doesn't exist
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_patterns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                pattern_type TEXT NOT NULL,
                pattern_name TEXT NOT NULL,
                description TEXT,
                severity TEXT,
                confidence REAL,
                details TEXT,
                detected_at TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        ''')
        
        saved_count = 0
        for pattern in patterns:
            try:
                cursor.execute('''
                    INSERT INTO user_patterns 
                    (user_id, pattern_type, pattern_name, description, severity, confidence, details, detected_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    pattern['user_id'],
                    pattern['pattern_type'],
                    pattern['name'],
                    pattern['description'],
                    pattern['severity'],
                    pattern['confidence'],
                    pattern['details'],
                    pattern['detected_at']
                ))
                saved_count += 1
            except Exception as e:
                print(f"Error saving pattern: {e}")
        
        conn.commit()
        conn.close()
        
        return saved_count
    
    def run_pattern_identification_for_user(self, user_id: str) -> Dict:
        """
        Run complete pattern identification for a user and save to database.
        
        Args:
            user_id: User identifier
        
        Returns:
            Summary dictionary with results
        """
        print(f"Running pattern identification for user: {user_id}")
        
        patterns = self.identify_patterns(user_id)
        saved_count = self.save_patterns_to_db(patterns)
        
        result = {
            'user_id': user_id,
            'patterns_detected': len(patterns),
            'patterns_saved': saved_count,
            'timestamp': datetime.now().isoformat(),
            'patterns': patterns
        }
        
        print(f"  - Detected {len(patterns)} patterns")
        print(f"  - Saved {saved_count} patterns to database")
        
        return result
    
    def run_pattern_identification_for_all_users(self) -> List[Dict]:
        """
        Run pattern identification for all users in the database.
        
        Returns:
            List of results for each user
        """
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT user_id FROM users')
        user_ids = [row[0] for row in cursor.fetchall()]
        conn.close()
        
        print(f"\n{'='*60}")
        print(f"Starting pattern identification for {len(user_ids)} users")
        print(f"{'='*60}\n")
        
        results = []
        for user_id in user_ids:
            result = self.run_pattern_identification_for_user(user_id)
            results.append(result)
        
        print(f"\n{'='*60}")
        print(f"Pattern identification complete!")
        print(f"Total patterns detected: {sum(r['patterns_detected'] for r in results)}")
        print(f"{'='*60}\n")
        
        return results


if __name__ == '__main__':
    # Test the pattern identifier
    identifier = CGMPatternIdentifier()
    results = identifier.run_pattern_identification_for_all_users()
    
    # Print summary
    for result in results:
        print(f"\nUser: {result['user_id']}")
        print(f"Patterns detected: {result['patterns_detected']}")
        if result['patterns']:
            for pattern in result['patterns']:
                print(f"  - {pattern['name']} (confidence: {pattern['confidence']:.2f})")


