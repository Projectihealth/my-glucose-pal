"""
Helper script to sync Tavus persona settings from local prompt files.

Kept for compatibility with the original backend layout.
Prefer using apps/backend/cgm_butler/digital_avatar/sync_persona.py
for new work.
"""

from .tavus_client import TavusClient
from .config import AvatarConfig
from .prompt_loader import load_tavus_system_prompt, load_tavus_persona_prompt


def sync_persona() -> None:
    """Update the Tavus persona using local prompt files."""
    client = TavusClient()

    system_prompt = load_tavus_system_prompt()
    persona_prompt = load_tavus_persona_prompt()

    data = {
        "system_prompt": system_prompt,
        "persona_prompt": persona_prompt,
    }

    persona_id = AvatarConfig.TAVUS_PERSONA_ID
    result = client.update_persona(persona_id, data)

    print("✅ Tavus persona synced from local files (legacy path)")
    print(f"Persona ID: {persona_id}")
    print(f"Response: {result}")


if __name__ == "__main__":
    sync_persona()



