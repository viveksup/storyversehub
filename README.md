storyversehub

## Setup Instructions

### Environment Variables

1. Create a `.env` file in the root directory of your project
2. Add your Supabase credentials to the `.env` file:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

3. You can find these values in your Supabase project dashboard:
   - Go to your Supabase project
   - Navigate to Settings > API
   - Copy the "Project URL" and "Project API keys" (anon/public key)

### Getting Started

1. Install dependencies: `npm install`
2. Set up your environment variables (see above)
3. Start the development server: `npm run dev`

**Note:** The application will not function properly without valid Supabase credentials.