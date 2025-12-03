#!/usr/bin/env python3
"""
Simple script to update Retell LLM settings
"""
import asyncio
import sys
import os

# Add the src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from routers.intake_phone_agent.service import update_llm_settings, INTAKE_LLM_ID, OLIVER_LLM_ID

async def main():
    print("🚀 Updating Retell LLM settings...\n")

    # Check environment variables
    retell_api_key = os.getenv("RETELL_API_KEY")
    if not retell_api_key:
        print("❌ RETELL_API_KEY not found in environment")
        return

    print(f"✅ RETELL_API_KEY found")
    print(f"✅ Olivia LLM ID: {INTAKE_LLM_ID}")
    print(f"✅ Oliver LLM ID: {OLIVER_LLM_ID}\n")

    try:
        # Update Olivia's LLM
        print("📝 Updating Olivia's LLM settings...")
        result = await update_llm_settings(llm_id=INTAKE_LLM_ID)
        print(f"✅ Olivia LLM updated successfully!")
        print(f"   Updated fields: {result.get('updated_fields', [])}\n")

        # Update Oliver's LLM as well
        print("📝 Updating Oliver's LLM settings...")
        result = await update_llm_settings(llm_id=OLIVER_LLM_ID)
        print(f"✅ Oliver LLM updated successfully!")
        print(f"   Updated fields: {result.get('updated_fields', [])}\n")

        print("🎉 All LLM settings updated successfully!")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
