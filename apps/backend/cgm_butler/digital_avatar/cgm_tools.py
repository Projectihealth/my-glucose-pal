"""
CGM Data Tools for Digital Avatar

This module provides tool functions that the digital avatar can call
to retrieve CGM data, patterns, and recommendations.
"""

import os
import sys
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import CGMDatabase
from pattern_identification import CGMPatternIdentifier


class CGMTools:
    """Tools for retrieving CGM data for digital avatar conversations."""
    
    def __init__(self, db_path: Optional[str] = None):
        """
        Initialize CGM tools.
        
        Args:
            db_path: Path to CGM database. If None, uses environment variable or default.
        """
        if db_path is None:
            # 优先使用环境变量
            db_path = os.getenv('CGM_DB_PATH')
            if db_path is None:
                # 回退到默认路径
                project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                db_path = os.path.join(project_root, 'database', 'cgm_butler.db')
        
        self.db_path = db_path
        self.pattern_identifier = CGMPatternIdentifier(db_path=db_path)
    
    def get_latest_glucose(self, user_id: str) -> Dict[str, Any]:
        """
        Get user's latest glucose reading.
        
        Args:
            user_id: User identifier
        
        Returns:
            Latest glucose reading with status
        """
        with CGMDatabase(self.db_path) as db:
            reading = db.get_latest_reading(user_id)
            
            if not reading:
                return {
                    "success": False,
                    "message": "No glucose readings found"
                }
            
            glucose = reading['glucose_value']
            timestamp = reading['timestamp']
            
            # Determine status
            if glucose < 70:
                status = "Low"
                status_emoji = "⚠️"
            elif glucose > 180:
                status = "High"
                status_emoji = "⚠️"
            elif glucose > 140:
                status = "Elevated"
                status_emoji = "⚡"
            else:
                status = "Normal"
                status_emoji = "✅"
            
            return {
                "success": True,
                "glucose_value": glucose,
                "unit": "mg/dL",
                "status": status,
                "status_emoji": status_emoji,
                "timestamp": timestamp,
                "message": f"Your current glucose is {glucose} mg/dL ({status}) {status_emoji}"
            }
    
    def get_glucose_statistics(self, user_id: str, hours: int = 24) -> Dict[str, Any]:
        """
        Get glucose statistics for a time period.
        
        Args:
            user_id: User identifier
            hours: Number of hours to look back (default: 24)
        
        Returns:
            Glucose statistics
        """
        with CGMDatabase(self.db_path) as db:
            # Calculate time range
            end_time = datetime.now()
            start_time = end_time - timedelta(hours=hours)
            
            stats = db.get_glucose_statistics(
                user_id,
                start_time=start_time.isoformat(),
                end_time=end_time.isoformat()
            )
            
            tir = db.get_time_in_range(
                user_id,
                start_time=start_time.isoformat(),
                end_time=end_time.isoformat()
            )
            
            if not stats or stats.get('count', 0) == 0:
                return {
                    "success": False,
                    "message": f"No data available for the last {hours} hours"
                }
            
            return {
                "success": True,
                "time_period": f"Last {hours} hours",
                "average_glucose": round(stats['avg_glucose'], 1),
                "min_glucose": stats['min_glucose'],
                "max_glucose": stats['max_glucose'],
                "time_in_range": round(tir, 1),
                "reading_count": stats['count'],
                "message": f"In the last {hours} hours: Average {stats['avg_glucose']:.1f} mg/dL, Time in Range {tir:.1f}%"
            }
    
    def get_recent_patterns(self, user_id: str, hours: int = 24) -> Dict[str, Any]:
        """
        Get recently detected glucose patterns.
        
        Args:
            user_id: User identifier
            hours: Number of hours to look back (default: 24)
        
        Returns:
            Detected patterns
        """
        with CGMDatabase(self.db_path) as db:
            patterns = db.get_latest_patterns(user_id, hours=hours)
            
            if not patterns:
                return {
                    "success": True,
                    "pattern_count": 0,
                    "patterns": [],
                    "message": f"No significant patterns detected in the last {hours} hours. Your glucose control looks good! ✅"
                }
            
            # Format patterns for conversation
            pattern_summaries = []
            high_severity_count = 0
            
            for pattern in patterns:
                if pattern['severity'] == 'high':
                    high_severity_count += 1
                
                pattern_summaries.append({
                    "name": pattern['pattern_name'],
                    "description": pattern['description'],
                    "severity": pattern['severity'],
                    "confidence": round(pattern['confidence'] * 100, 1),
                    "details": pattern['details']
                })
            
            # Generate message
            if high_severity_count > 0:
                message = f"⚠️ Found {len(patterns)} patterns in the last {hours} hours, including {high_severity_count} that need attention."
            else:
                message = f"Found {len(patterns)} patterns in the last {hours} hours. Let me explain them to you."
            
            return {
                "success": True,
                "pattern_count": len(patterns),
                "high_severity_count": high_severity_count,
                "patterns": pattern_summaries,
                "message": message
            }
    
    def get_pattern_actions(self, user_id: str) -> Dict[str, Any]:
        """
        Get recommended actions based on detected patterns.
        
        Args:
            user_id: User identifier
        
        Returns:
            Recommended actions
        """
        with CGMDatabase(self.db_path) as db:
            # Get recent patterns
            patterns = db.get_latest_patterns(user_id, hours=24)
            
            if not patterns:
                return {
                    "success": True,
                    "action_count": 0,
                    "actions": [],
                    "message": "No specific actions needed at this time. Keep up the good work!"
                }
            
            # Get all pattern-action mappings
            all_actions = db.get_pattern_actions()
            
            # Match patterns to actions
            recommended_actions = []
            pattern_types = set(p['pattern_type'] for p in patterns)
            
            for action in all_actions:
                # Check if action is relevant to detected patterns
                # (You may need to add pattern_type field to cgm_pattern_actions table)
                if action['priority'] >= 4:  # High priority actions
                    recommended_actions.append({
                        "title": action['action_title'],
                        "detail": action['action_detail'],
                        "category": action['category'],
                        "priority": action['priority']
                    })
            
            # Sort by priority
            recommended_actions.sort(key=lambda x: x['priority'], reverse=True)
            
            # Limit to top 5
            recommended_actions = recommended_actions[:5]
            
            return {
                "success": True,
                "action_count": len(recommended_actions),
                "actions": recommended_actions,
                "message": f"I have {len(recommended_actions)} recommendations to help improve your glucose control."
            }
    
    def get_user_info(self, user_id: str) -> Dict[str, Any]:
        """
        Get user information.
        
        Args:
            user_id: User identifier
        
        Returns:
            User information
        """
        with CGMDatabase(self.db_path) as db:
            user = db.get_user(user_id)
            
            if not user:
                return {
                    "success": False,
                    "message": "User not found"
                }
            
            return {
                "success": True,
                "user_id": user['user_id'],
                "name": user['name'],
                "health_goal": user.get('health_goal', 'Not specified'),
                "conditions": user.get('conditions', 'Not specified'),
                "cgm_device": user.get('cgm_device_type', 'Not specified'),
                "message": f"Hello {user['name']}! I'm here to help you with your glucose management."
            }
    
    def run_pattern_identification(self, user_id: str) -> Dict[str, Any]:
        """
        Run pattern identification for a user.
        
        Args:
            user_id: User identifier
        
        Returns:
            Pattern identification results
        """
        try:
            result = self.pattern_identifier.run_pattern_identification_for_user(user_id)
            
            return {
                "success": True,
                "patterns_detected": result['patterns_detected'],
                "patterns_saved": result['patterns_saved'],
                "message": f"I've analyzed your glucose data and found {result['patterns_detected']} patterns."
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error analyzing patterns: {str(e)}"
            }


# Function call definitions for LLM integration
FUNCTION_DEFINITIONS = [
    {
        "name": "get_latest_glucose",
        "description": "Get the user's most recent glucose reading with status",
        "parameters": {
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "description": "The user identifier (e.g., 'user_001')"
                }
            },
            "required": ["user_id"]
        }
    },
    {
        "name": "get_glucose_statistics",
        "description": "Get glucose statistics for a time period (average, min, max, time in range)",
        "parameters": {
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "description": "The user identifier"
                },
                "hours": {
                    "type": "integer",
                    "description": "Number of hours to look back (default: 24)",
                    "default": 24
                }
            },
            "required": ["user_id"]
        }
    },
    {
        "name": "get_recent_patterns",
        "description": "Get recently detected glucose patterns (e.g., post-meal spikes, dawn phenomenon)",
        "parameters": {
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "description": "The user identifier"
                },
                "hours": {
                    "type": "integer",
                    "description": "Number of hours to look back (default: 24)",
                    "default": 24
                }
            },
            "required": ["user_id"]
        }
    },
    {
        "name": "get_pattern_actions",
        "description": "Get recommended actions based on detected glucose patterns",
        "parameters": {
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "description": "The user identifier"
                }
            },
            "required": ["user_id"]
        }
    },
    {
        "name": "get_user_info",
        "description": "Get user's basic information and health goals",
        "parameters": {
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "description": "The user identifier"
                }
            },
            "required": ["user_id"]
        }
    }
]


if __name__ == '__main__':
    # Test the tools
    tools = CGMTools()
    
    user_id = 'user_001'
    
    print("=== Latest Glucose ===")
    print(tools.get_latest_glucose(user_id))
    
    print("\n=== Statistics (24h) ===")
    print(tools.get_glucose_statistics(user_id, hours=24))
    
    print("\n=== Recent Patterns ===")
    print(tools.get_recent_patterns(user_id, hours=24))
    
    print("\n=== Recommended Actions ===")
    print(tools.get_pattern_actions(user_id))


