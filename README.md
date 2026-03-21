# Gesture Writing System - Working Prototype

A full-stack web application that allows users to write text using hand gestures captured through a webcam. This prototype demonstrates the core features of the Gesture Writing System with a modern, user-friendly interface.

## 🎯 Features

### Core Features
- **Hand Gesture Recognition**: Real-time hand gesture detection via webcam
- **Text Editor**: Live text output area with manual editing capabilities
- **User Authentication**: Secure email/password authentication with Supabase
- **Document Management**: Save, view, and manage previously written documents
- **Sharing & Export**: Copy text, download as files, and share documents
- **Text-to-Speech**: Listen to your written text using browser speech synthesis
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Advanced Features
- Dark mode support
- Document history with timestamps
- Real-time gesture confidence metrics
- Quick input buttons for testing
- Auto-save capabilities
- Secure RLS (Row Level Security) with Supabase

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Computer Vision**: MediaPipe (for hand tracking)
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **State Management**: React Hooks + SWR
- **Notifications**: Sonner (Toast notifications)

## 📋 Prerequisites

- Node.js 18+ and pnpm
- Supabase account (free tier works)
- Webcam enabled on your device
- Modern browser with WebRTC support

## 🚀 Getting Started

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd gesture-writing-system
pnpm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. In the SQL editor, run the database schema setup (see Database Setup section below)

### 3. Configure Environment Variables

Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

### 4. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Setup

The application uses three main tables:

### Users (Managed by Supabase Auth)
- Supabase automatically handles user authentication and storage

### Profiles Table
```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);
```

### Text Documents Table
```sql
CREATE TABLE IF NOT EXISTS public.text_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Document',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.text_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_select_own" ON public.text_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "documents_insert_own" ON public.text_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "documents_update_own" ON public.text_documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "documents_delete_own" ON public.text_documents FOR DELETE USING (auth.uid() = user_id);
```

### Auto-Create Profile on Signup
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', SPLIT_PART(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## 🎮 How to Use

### 1. Sign Up
- Visit the home page and click "Get Started"
- Enter your email and create a password
- Verify your email (check spam folder if needed)

### 2. Login
- Use your registered credentials to sign in

### 3. Create a New Document
- Click "New Document" from the dashboard
- Click "Start Recording" to activate your webcam

### 4. Write with Gestures (Testing Mode)
- Use the quick input buttons (A-G) to add letters
- Each letter will be added to your text
- Manual editing is available in the text area

### 5. Manage Your Text
- **Save**: Click "Save Document" to store it permanently
- **Copy**: Copy text to clipboard
- **Download**: Export as a text file
- **Speak**: Listen to your text using text-to-speech
- **Clear**: Remove all content and start fresh

### 6. View History
- Go to "My Documents" to see all saved documents
- Copy, download, or delete any document
- View creation timestamps

## 🎓 Project Structure

```
gesture-writing-system/
├── app/
│   ├── page.tsx                 # Home page
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   ├── auth/
│   │   ├── login/page.tsx       # Login page
│   │   ├── signup/page.tsx      # Sign up page
│   │   └── error/page.tsx       # Auth error page
│   └── protected/
│       ├── dashboard/page.tsx   # Document dashboard
│       └── writer/page.tsx      # Gesture writer interface
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Supabase client setup
│   │   ├── server.ts            # Supabase server setup
│   │   └── middleware.ts        # Session handling
│   ├── gesture-recognition.ts   # Gesture detection utilities
│   └── utils.ts                 # Utility functions
├── components/
│   └── ui/                      # shadcn/ui components
├── middleware.ts                # Next.js middleware
├── scripts/
│   └── 001_create_tables.sql    # Database setup script
└── package.json
```

## 🔐 Security Features

- **Row Level Security (RLS)**: All database operations are secured with RLS policies
- **Password Hashing**: Supabase handles secure password storage
- **Session Management**: Secure session cookies with middleware
- **Authentication**: Protected routes require valid user sessions
- **Data Encryption**: Supabase encrypts data at rest

## 🚀 Next Steps for Production

### Gesture Recognition Enhancement
- Integrate full MediaPipe hand tracking model
- Train a custom ML model for gesture-to-character mapping
- Add calibration wizard for personalized gesture detection
- Implement multi-hand support

### Advanced Features
- Real-time collaboration (multiple users)
- Cloud storage for document backups
- OCR for importing scanned documents
- Voice commands for accessibility
- Mobile app version
- API for third-party integrations

### Infrastructure
- Set up CI/CD pipeline
- Add comprehensive testing suite
- Implement error logging (Sentry)
- Set up performance monitoring
- Deploy to production (Vercel)

## 📱 Browser Compatibility

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14.1+
- Edge 90+

**Note**: WebRTC and MediaPipe may not work on all browsers. Test in your target environment.

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋 Support

For issues, questions, or feedback:
- Open an issue on GitHub
- Check existing documentation
- Review the troubleshooting section below

## 🔧 Troubleshooting

### Webcam Not Working
- Check browser permissions for camera access
- Ensure webcam is not in use by another application
- Try a different browser
- Check browser console for errors

### Authentication Issues
- Verify Supabase URL and keys are correct
- Check email confirmation in Supabase dashboard
- Clear browser cookies and try again
- Check if email domain is whitelisted

### Document Not Saving
- Verify database tables are created
- Check Row Level Security policies
- Ensure user is authenticated
- Review browser console for error messages

### Gesture Recognition Not Working
- Ensure adequate lighting
- Keep hand fully visible in camera frame
- Use quick input buttons for testing
- Check if browser supports WebRTC

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [MediaPipe Documentation](https://developers.google.com/mediapipe)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

---

**Built with ❤️ using modern web technologies**
