# 🌌 Zen-OS | AI-Orchestrated Personal OS

A high-availability, generative portfolio experience inspired by Apple's design language. Featuring a multi-model AI failover cluster and a dynamic command-driven interface.

## 🚀 Key Features

- **Command-Driven UX**: No traditional navigation. Interaction via `⌘K` command bar.
- **AI Orchestration Layer**: Sub-millisecond failover between Groq, DeepSeek, and Gemini.
- **Voice-First Navigation**: Global voice input with real-time visualizer.
- **Admin Control Panel**: Dynamic, database-driven API key management with encryption.
- **System HUD**: Real-time infrastructure health and performance monitoring.
- **Production-Grade**: Built with Next.js 15, Supabase, and Upstash Redis.

## 🛠️ Setup Instructions

### 1. Project Initialization

```bash
npm install
```

### 2. Infrastructure Setup

1. **Supabase**: 
   - Create a new project.
   - Run the SQL migration in `supabase/migrations/20260201000000_init.sql`.
   - Get your URL and Keys.

2. **Upstash Redis**:
   - Create a Redis database.
   - Get your REST URL and Token.

### 3. Environment Variables

Create a `.env.local` file:

```env
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_PASSWORD=your-secure-password
ENCRYPTION_KEY=32-byte-hex-key
```

### 4. Running Locally

```bash
npm run dev
```

---
Built with ❤️ by Antigravity for Rahul Tumma
