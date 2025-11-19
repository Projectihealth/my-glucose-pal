"""
Helper script to sync Tavus persona settings from local prompt files.

Usage (from project root, with backend venv activated and env vars set):

    python -m apps.backend.cgm_butler.digital_avatar.sync_persona
"""

from .tavus_client import TavusClient
from .config import AvatarConfig
from .prompt_loader import load_tavus_system_prompt, load_tavus_persona_prompt


def sync_persona() -> None:
    """
    Update the configured Tavus persona using local prompt files.

    NOTE: The exact field names in `data` may need to be adjusted
    to match the latest Tavus API schema. This function assumes
    Tavus accepts `system_prompt` and `persona_prompt` style fields.
    """
    client = TavusClient()

    system_prompt = load_tavus_system_prompt()
    persona_prompt = load_tavus_persona_prompt()

    data = {
        # These keys may need to be aligned with Tavus docs
        "system_prompt": system_prompt,
        "persona_prompt": persona_prompt,
    }

    persona_id = AvatarConfig.TAVUS_PERSONA_ID
    result = client.update_persona(persona_id, data)

    print("✅ Tavus persona synced from local files")
    print(f"Persona ID: {persona_id}")
    print(f"Response: {result}")


if __name__ == "__main__":
    sync_persona()



