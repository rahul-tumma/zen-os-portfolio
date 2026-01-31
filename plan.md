
## **Project Title:** Zen-OS: High-Availability Generative Portfolio

**Role:** Full Stack, DevOps, and AI Developer Showcase

### **1. Core Concept & UX**

* **Interface:** A "Personal OS" style. No traditional navigation.
* **Interaction:** A global **Command Bar** (Text + Web Speech API for Voice) that sits at the top or bottom of the screen.
* **The Stage:** A main viewport that is empty by default. When a command is entered, the UI **generates and injects** the appropriate component on the fly with smooth Framer Motion transitions.

### **2. Technical Stack ($0 Budget)**

* **Frontend:** Next.js 15 (App Router), Tailwind CSS, Shadcn/UI, Framer Motion.
* **AI Orchestration:** Vercel AI SDK (Standardized provider management).
* **AI Models:** Multi-model cascading failover: **Groq (Llama 3.3)** → **DeepSeek-V3** → **Gemini 1.5 Flash**.
* **Database (Persistence):** **Supabase (PostgreSQL)** for logging usage, latency, and storing the "Knowledge Base."
* **Cache (Performance):** **Upstash Redis** for sub-millisecond tracking of AI key rate limits (429 errors) and cooldowns.
* **Hosting:** **Vercel** with GitHub Actions for CI/CD.

### **3. Backend Business Logic**

* **Key Rotation:** Manage  keys for each provider (e.g., 4 for Groq, 2 for DeepSeek).
* **Failover Strategy:** Always attempt Groq first for speed. If a key hits a rate limit (429), blacklist it in **Upstash Redis** for 60 seconds and instantly try the next available key or provider.
* **Logging:** Every interaction is logged to **Supabase** (Provider used, Latency in ms, Prompt, Status Code).

### **4. Key Components to Build**

* **Command Bar:** Input field with a pulsing voice visualizer.
* **Dynamic Stage:** A container that switches between:
* **ProjectGrid:** Shadcn cards for your full-stack apps.
* **DevOpsTerminal:** Monospace terminal for CI/CD logs and architecture schemas.
* **KnowledgeView:** A documentation-style layout for deep-dive technical questions.


* **System HUD:** A small "System Health" component showing live status dots for Groq, DeepSeek, and Gemini.
* **Admin Dashboard:** A private route `/stats` to visualize the Supabase logs (latency charts, provider usage).

### **5. The "Side CMS" (Knowledge Base)**

* Store all personal data, project details, and technical philosophies in a structured **JSON/Markdown** format.
* The AI must use this data as its "Source of Truth" to answer "Anything" the interviewer asks, ensuring it doesn't hallucinate.


