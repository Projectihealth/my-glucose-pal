# Call Page Redesign - Testing Guide

## 🎯 Quick Test

### 1. Start the Application

```bash
# Terminal 1: Start backend
cd /Users/yijialiu/Desktop/my-glucose-pal
source venv/bin/activate
python apps/backend/cgm_butler/dashboard/app.py

# Terminal 2: Start frontend
cd /Users/yijialiu/Desktop/my-glucose-pal/apps/frontend
npm run dev
```

### 2. Navigate to Call Page

1. Open browser: `http://localhost:5173`
2. Go to Olivia page
3. Click "Start Voice Call" button

### 3. Visual Checks

#### ✅ Header Section
- [ ] Call duration displays in top-left (format: `M:SS`)
- [ ] Red "Recording" badge shows in top-right with pulsing dot

#### ✅ Avatar Section (Center)
- [ ] Avatar image loads correctly
- [ ] Avatar floats up and down smoothly
- [ ] Pulsing glow effect visible behind avatar
- [ ] 3 expanding rings animate outward
- [ ] "Olivia" badge appears below avatar
- [ ] Badge pulses when Olivia is speaking

#### ✅ Live Caption
- [ ] Glassmorphism card appears below avatar
- [ ] Shows speaker name (Olivia or your name)
- [ ] Text updates as conversation progresses
- [ ] Smooth fade-in/fade-out transitions

#### ✅ Control Buttons (Bottom)
- [ ] Mute button (left): White with gray border
- [ ] End Call button (center): Red gradient with shadow
- [ ] Mute button turns red when muted
- [ ] Buttons are large and easy to tap

#### ✅ Floating Transcript Button
- [ ] Circular button visible in bottom-right corner
- [ ] Shows message square icon
- [ ] Has glassmorphism effect

### 4. Interaction Tests

#### Test Mute Functionality
1. Click mute button
2. **Expected**: 
   - Button turns red
   - Icon changes to `MicOff`
   - Microphone is muted
3. Click again to unmute
4. **Expected**: 
   - Button turns white
   - Icon changes to `Mic`
   - Microphone is active

#### Test Transcript Drawer
1. Click floating transcript button (bottom-right)
2. **Expected**: 
   - Drawer slides up from bottom
   - Shows "Live Transcript" header
   - Displays all messages in conversation
   - Coach messages on left (gray bubbles)
   - User messages on right (blue bubbles)
3. Scroll through messages
4. Click X button or tap outside to close
5. **Expected**: 
   - Drawer slides down smoothly

#### Test End Call
1. Click red end call button
2. **Expected**: 
   - Call ends
   - Navigates to call results page

### 5. Animation Checks

#### Avatar Animations
- [ ] Avatar floats up and down (3 second cycle)
- [ ] Glow pulses in and out (2 second cycle)
- [ ] Rings expand outward continuously (3 second cycle, staggered)
- [ ] Animations are smooth (60fps)

#### Speaking Indicator
- [ ] Badge pulses when Olivia speaks
- [ ] Badge stays static when user speaks
- [ ] Pulse animation is smooth

#### Message Transitions
- [ ] New messages fade in smoothly
- [ ] Old messages fade out when replaced
- [ ] No flickering or jumps

### 6. Responsive Design

#### Desktop (if applicable)
- [ ] Layout looks good on wider screens
- [ ] Buttons are appropriately sized
- [ ] Text is readable

#### Mobile
- [ ] All elements fit within viewport
- [ ] No horizontal scrolling
- [ ] Touch targets are large enough (min 44x44px)
- [ ] Text is readable without zooming

### 7. Error Handling

#### User Info Loading
1. Check browser console for user info fetch
2. **Expected**: 
   - No errors in console
   - User name displays correctly
   - If user has no avatar, default image loads

#### Image Fallback
1. If avatar fails to load
2. **Expected**: 
   - Fallback SVG icon displays
   - No broken image icon

### 8. Performance

#### Frame Rate
- [ ] Animations run smoothly (no stuttering)
- [ ] Page remains responsive during call
- [ ] No excessive CPU usage

#### Memory
- [ ] No memory leaks during extended calls
- [ ] Transcript drawer doesn't slow down with many messages

## 🐛 Common Issues & Solutions

### Issue: Avatar doesn't animate
**Solution**: Check if `framer-motion` is installed
```bash
cd apps/frontend
npm list framer-motion
```

### Issue: Transcript drawer doesn't open
**Solution**: Check if `@radix-ui/react-dialog` is installed
```bash
npm list @radix-ui/react-dialog
```

### Issue: User name shows as "User"
**Solution**: 
1. Check backend is running
2. Check `/api/user/<user_id>` endpoint returns data
3. Check browser console for fetch errors

### Issue: Mute button doesn't work
**Solution**: 
1. Check microphone permissions in browser
2. Check `useRetellCall` hook is working
3. Check browser console for errors

## 📸 Screenshots to Take

For documentation, capture:
1. Call in progress (default state)
2. Olivia speaking (with pulsing badge)
3. Mute button active (red state)
4. Transcript drawer open
5. Message bubbles in transcript

## ✅ Sign-off Checklist

Before considering the redesign complete:

- [ ] All visual elements render correctly
- [ ] All animations are smooth
- [ ] All buttons work as expected
- [ ] Transcript drawer functions properly
- [ ] User info loads from backend
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Responsive on target devices
- [ ] Accessible (keyboard navigation, screen readers)

## 🎉 Success Criteria

The redesign is successful if:
1. ✅ Visual design matches the new mockup
2. ✅ All existing functionality still works
3. ✅ Animations enhance UX without causing performance issues
4. ✅ Transcript drawer is more convenient than old full-screen overlay
5. ✅ Users can easily identify call status and controls


