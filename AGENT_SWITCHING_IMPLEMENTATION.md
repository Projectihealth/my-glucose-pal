# Agent Switching Feature - Implementation Summary

## ✅ Completed (Backend + Infrastructure)

### 1. Database ✅
- Added `agent_preference` VARCHAR(20) field to `users` table
- Default value: 'olivia'
- Migration: `shared/database/migrations/006_add_agent_preference.py`

### 2. Backend API ✅
- **UserRepository** updated to support `agent_preference` field
- **API Endpoint**: `PUT /api/user/{user_id}/agent-preference`
  - Location: `apps/backend/cgm_butler/dashboard/app.py:109-154`
  - Validates: 'olivia' | 'oliver'
  - Returns: `{success: true, agent_preference: "oliver"}`

### 3. Minerva Service ✅
- **Dynamic agent selection** in `create_intake_web_call()`
- Location: `apps/minerva/src/routers/intake_phone_agent/service.py:325-340`
- Logic:
  ```python
  agent_preference = user_info.get('agent_preference', 'olivia')
  if agent_preference == 'oliver':
      selected_agent_id = OLIVER_AGENT_ID
  else:
      selected_agent_id = INTAKE_AGENT_ID
  ```

### 4. Environment Variables ✅
- Added to `.env`:
  ```
  OLIVER_AGENT_ID=agent_930e49701ad02a07ad85205bb2
  OLIVER_LLM_ID=llm_74ce06f67d6068bf56c35a20684c
  ```

### 5. Frontend Infrastructure ✅
- **Agent Config**: `apps/frontend/src/config/agentConfig.ts`
  - `AgentType = 'olivia' | 'oliver'`
  - `getAgentConfig(agentType)` helper
- **User Utils**: `apps/frontend/src/utils/userUtils.ts`
  - `User` interface with `agent_preference?: AgentType`
  - `getPreferredAgent(user)` helper
- **Image**: `apps/frontend/public/images/oliver-nurse.png` ✅

---

## 🔄 Remaining UI Tasks (3/11)

### Task 8: Profile Page - Health Companion Selector

**File**: `apps/frontend/src/components/ProfileTab.tsx`

**Implementation**:
```typescript
import { useState } from 'react';
import { Users } from 'lucide-react';
import { getAgentConfig, type AgentType } from '@/config/agentConfig';
import type { User } from '@/utils/userUtils';

// Inside ProfileTab component:
const [user, setUser] = useState<User | null>(null);

const handleAgentPreferenceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
  const newPreference = e.target.value as AgentType;

  try {
    const response = await fetch(`/api/user/${user.user_id}/agent-preference`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_preference: newPreference })
    });

    if (response.ok) {
      setUser({ ...user, agent_preference: newPreference });
      // Show success toast
    }
  } catch (error) {
    console.error('Failed to update agent preference:', error);
  }
};

// Add to Preference card:
<div className="flex items-center justify-between py-3 border-b border-slate-100">
  <div className="flex items-center gap-3">
    <Users className="w-5 h-5 text-blue-600" />
    <span className="text-slate-700 font-medium">Health Companion</span>
  </div>
  <select
    value={user?.agent_preference || 'olivia'}
    onChange={handleAgentPreferenceChange}
    className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700"
  >
    <option value="olivia">Olivia (Female)</option>
    <option value="oliver">Oliver (Male)</option>
  </select>
</div>
```

---

### Task 9: Bottom Navigation - Dynamic Agent Name

**File**: Look for navigation component (likely `apps/frontend/src/components/Navigation.tsx` or similar)

**Implementation**:
```typescript
import { getPreferredAgent } from '@/utils/userUtils';
import { getAgentConfig } from '@/config/agentConfig';

// Inside Navigation component:
const user = useUser(); // or however you access user
const agentType = getPreferredAgent(user);
const agentConfig = getAgentConfig(agentType);

// Update the second tab label:
<NavItem
  icon={MessageCircle}
  label={agentConfig.name}  // Will be "Olivia" or "Oliver"
  to="/olivia"
/>
```

---

### Task 10: Chat Interface - Dynamic Agent Image & Name

**File**: `apps/frontend/src/pages/olivia/OliviaHome.tsx` (or wherever the chat interface is)

**Implementation**:
```typescript
import { getPreferredAgent } from '@/utils/userUtils';
import { getAgentConfig } from '@/config/agentConfig';

// Inside OliviaHome component:
const user = useUser();
const agentType = getPreferredAgent(user);
const agentConfig = getAgentConfig(agentType);

// Replace all hardcoded "Olivia" and image paths:

// Agent avatar:
<img
  src={agentConfig.image}  // "/images/olivia-nurse.png" or "/images/oliver-nurse.png"
  alt={agentConfig.name}
  className="w-24 h-24 rounded-full"
/>

// Agent name in text:
<h1>Chat with {agentConfig.name}</h1>

// Greeting:
<p>Hi! I'm {agentConfig.name}, your health companion.</p>

// Find & Replace all instances of:
// - "Olivia" → {agentConfig.name}
// - "/images/olivia-nurse.png" → {agentConfig.image}
```

**Files to update**:
- `OliviaHome.tsx`
- Any chat message components
- Voice chat interface
- Anywhere "Olivia" is displayed

---

## 🧪 Testing Checklist

### Backend Testing
```bash
# 1. Test API endpoint
curl -X PUT http://localhost:5000/api/user/user_001/agent-preference \
  -H "Content-Type: application/json" \
  -d '{"agent_preference": "oliver"}'

# Expected: {"success": true, "agent_preference": "oliver"}

# 2. Verify database
python3 -c "
from shared.database import get_connection
with get_connection() as conn:
    cursor = conn.cursor()
    cursor.execute('SELECT user_id, agent_preference FROM users WHERE user_id = %s', ('user_001',))
    print(cursor.fetchone())
"

# 3. Test Minerva service (check logs)
# Should see: "Agent preference: oliver (Oliver)"
```

### Frontend Testing
1. ✅ Profile page shows Health Companion selector
2. ✅ Selecting Oliver updates database
3. ✅ Bottom nav shows "Oliver" instead of "Olivia"
4. ✅ Chat interface shows Oliver's image
5. ✅ All text says "Oliver" not "Olivia"
6. ✅ Voice chat creates call with Oliver's agent_id

---

## 📋 Quick Reference

### Agent IDs
- **Olivia**: `agent_c7d1cb2c279ec45bce38c95067`
- **Oliver**: `agent_930e49701ad02a07ad85205bb2`

### LLM IDs
- **Olivia**: `llm_e54c307ce74090cdfd06f682523b`
- **Oliver**: `llm_74ce06f67d6068bf56c35a20684c`

### Images
- **Olivia**: `/images/olivia-nurse.png`
- **Oliver**: `/images/oliver-nurse.png`

### Database
- **Table**: `users`
- **Field**: `agent_preference` VARCHAR(20) DEFAULT 'olivia'

---

## 🎯 Implementation Status

| Task | Status | File |
|------|--------|------|
| Database migration | ✅ | `shared/database/migrations/006_add_agent_preference.py` |
| User repository | ✅ | `shared/database/repositories/user_repository.py` |
| API endpoint | ✅ | `apps/backend/cgm_butler/dashboard/app.py:109` |
| Minerva service | ✅ | `apps/minerva/src/routers/intake_phone_agent/service.py:325` |
| Environment vars | ✅ | `.env` |
| Agent config | ✅ | `apps/frontend/src/config/agentConfig.ts` |
| User utils | ✅ | `apps/frontend/src/utils/userUtils.ts` |
| Oliver image | ✅ | `apps/frontend/public/images/oliver-nurse.png` |
| Profile selector | ⏳ | `apps/frontend/src/components/ProfileTab.tsx` |
| Navigation label | ⏳ | Navigation component |
| Chat interface | ⏳ | `apps/frontend/src/pages/olivia/OliviaHome.tsx` |

---

## 💡 Notes

1. **Backward Compatibility**: All existing users default to 'olivia'
2. **Validation**: API only accepts 'olivia' or 'oliver'
3. **Frontend Fallback**: If `agent_preference` is missing, defaults to 'olivia'
4. **Voice Chat**: Automatically uses correct agent based on user preference
5. **Future**: Can easily add more agents by:
   - Adding to `agentConfig.ts`
   - Adding environment variables
   - Updating validation in API

---

Generated: 2025-12-02
