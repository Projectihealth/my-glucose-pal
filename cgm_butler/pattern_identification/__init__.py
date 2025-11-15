"""
CGM Pattern Identification Module

This module provides pattern identification functionality for CGM Butler.
It can be used as a standalone module or integrated with other components
such as conversational agents, dashboards, and analytics tools.

Main Components:
- CGMPatternIdentifier: Core pattern detection class
- Scheduler: Automated pattern identification scheduler

Usage:
    from pattern_identification import CGMPatternIdentifier
    
    identifier = CGMPatternIdentifier()
    patterns = identifier.identify_patterns('user_001')
"""

from .identifier import CGMPatternIdentifier

__all__ = ['CGMPatternIdentifier']
__version__ = '1.0.0'


