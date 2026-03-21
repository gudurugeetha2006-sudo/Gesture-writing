# Gesture Writing System - Configuration Guide

## Quick Setup

This file provides additional configuration details for the Gesture Writing System.

## Environment Variables

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Features Implemented

### ✅ Core Features
- [x] User Authentication (Email/Password)
- [x] Secure session management with Supabase
- [x] Real-time gesture detection interface
- [x] Text editor with manual editing
- [x] Document save and retrieval
- [x] User dashboard with document history
- [x] Copy to clipboard functionality
- [x] Download as text file
- [x] Text-to-speech functionality
- [x] Clear all content
- [x] Responsive design
- [x] Dark mode support

### 🚀 Advanced Features
- [x] Row Level Security (RLS) on all database tables
- [x] Auto-profile creation on signup
- [x] Session management with middleware
- [x] Error handling and toast notifications
- [x] Loading states and animations
- [x] Timestamp tracking for documents
- [x] Multi-user document isolation

### 📱 Testing Features
- [x] Quick input buttons (A-G) for gesture testing
- [x] Confidence metrics display
- [x] Gesture detection visualization
- [x] Tips and guidelines panel
- [x] Document length counter

## File Structure

### Pages
```
/app
├── page.tsx                    - Home/Landing page
├── /auth
│   ├── login/page.tsx         - Login page
│   ├── signup/page.tsx        - Sign up page
│   └── error/page.tsx         - Auth error page
└── /protected
    ├── page.tsx               - Protected home
    ├── /dashboard
    │   └── page.tsx           - Document dashboard
    └── /writer
        └── page.tsx           - Gesture writer
```

### Utilities
```
/lib
├── /supabase
│   ├── client.ts              - Browser client
│   ├── server.ts              - Server client
│   └── middleware.ts          - Session middleware
└── gesture-recognition.ts     - Gesture detection

/middleware.ts                 - Next.js middleware
```

## Database Schema

### Profiles Table
- `id`: UUID (Primary Key, references auth.users)
- `email`: TEXT
- `display_name`: TEXT
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

### Text Documents Table
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key)
- `title`: TEXT
- `content`: TEXT
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

## Authentication Flow

1. User visits home page
2. Clicks "Get Started" → Sign up page
3. Enters email and password
4. Submits form → Supabase Auth creates user
5. Auto-trigger creates profile
6. Email confirmation sent
7. User clicks confirmation link
8. Session created, redirected to dashboard

## Gesture Recognition Flow (Current Implementation)

1. User clicks "Start Recording"
2. Browser requests camera permission
3. Video stream from webcam displayed
4. Canvas captures frames for processing
5. Gesture detection runs on each frame
6. Confidence score displayed
7. Letter added to text on detection
8. User can manually edit text
9. Save document when ready

## Future Enhancements

### MediaPipe Integration
```typescript
// To integrate actual MediaPipe hand tracking:
// 1. Import @mediapipe/tasks-vision
// 2. Load hand landmarker model
// 3. Process video frames in real-time
// 4. Extract hand landmarks
// 5. Map to gesture characters
// 6. Update UI with results
```

### Machine Learning Model
- Train on user gestures
- Improve accuracy over time
- Multi-language support
- Custom gesture definitions

### Collaboration Features
- Real-time collaborative editing
- Share documents with permissions
- Comment and annotation system
- Version history

## Deployment

### Deploy to Vercel
```bash
# Connect your Git repository to Vercel
# Environment variables are set in Vercel dashboard
# Automatic deployments on push to main
```

### Set Production URLs
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://your-domain.com/auth/callback
```

## Performance Optimization

- Lazy load MediaPipe models
- Optimize image processing
- Cache gesture detection models
- Implement request debouncing
- Use compression for downloads

## Security Considerations

- Enable email verification required
- Set password requirements
- Implement rate limiting
- Use HTTPS only
- Regular security audits
- Keep dependencies updated

## Monitoring & Logging

- Monitor API performance
- Track error rates
- User activity logging
- Database query optimization
- Resource usage metrics

## Support & Maintenance

### Common Issues & Solutions

1. **Webcam Permission Denied**
   - Check browser permissions
   - Ensure HTTPS on production
   - Try different browser

2. **Supabase Connection Failed**
   - Verify API keys
   - Check network connectivity
   - Review Supabase dashboard

3. **Documents Not Loading**
   - Verify RLS policies
   - Check user authentication
   - Review database logs

4. **Gesture Detection Inaccurate**
   - Improve lighting conditions
   - Ensure hand is fully visible
   - Calibrate gestures
   - Train custom model

## References

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [MediaPipe Hand](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)
- [Web APIs - getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

---

For more information, see the main README.md file.
