"""
Utility functions for loading Tavus prompt content from local files.

By keeping system prompt / persona prompt in version-controlled files,
we can update Olivia's behavior without manually editing the Tavus UI.
"""

from pathlib import Path
from typing import Optional


BASE_DIR = Path(__file__).resolve().parent
PROMPTS_DIR = BASE_DIR / "prompts"


def _load_text_file(filename: str) -> str:
    """Load a UTF‑8 text file from the prompts directory."""
    path = PROMPTS_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Tavus prompt file not found: {path}")
    return path.read_text(encoding="utf-8").strip()


def load_tavus_system_prompt() -> str:
    """Load the Tavus system prompt used to define the CGM Butler role."""
    return _load_text_file("tavus_system_prompt.md")


def load_tavus_persona_prompt() -> str:
    """Load the Tavus persona prompt (speaking style, tone, personality)."""
    return _load_text_file("tavus_persona_prompt.md")


def build_conversational_context(
    *,
    user_id: str,
    user_name: str,
    health_goal: str,
    conditions: str,
) -> str:
    """
    Construct the full conversational context that will be sent to Tavus
    when creating a conversation.

    This combines:
    - System prompt (role / capabilities)
    - Persona prompt (style / tone)
    - Current user snapshot
    """
    system_prompt = load_tavus_system_prompt()
    persona_prompt = load_tavus_persona_prompt()

    user_block = (
        "## Current User\n"
        f"- Name: {user_name or 'User'}\n"
        f"- Health Goal: {health_goal or 'Manage glucose levels'}\n"
        f"- Conditions: {conditions or 'Not specified'}\n"
        f"- User ID: {user_id}\n"
    )

    return f"{system_prompt}\n\n---\n\n{persona_prompt}\n\n---\n\n{user_block}"


def build_custom_greeting(user_name: str) -> str:
    """
    Build a short, friendly greeting shown at the start of each Tavus call.
    """
    safe_name = user_name or "there"
    return (
        f"Hi {safe_name}! I'm your CGM health butler. "
        "I'm here to help you understand your glucose, daily patterns, and habits. "
        "How are you feeling today?"
    )



