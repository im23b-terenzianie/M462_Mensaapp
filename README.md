# M462 MensaApp 🍽️

A simple, agile-driven mensa (cafeteria) application built with **Next.js** (frontend) and **Supabase** (database/auth). Created as part of a school group project, the main goal was to **apply Scrum principles** while developing a real‑world app.

---

## 🧩 Features

- **Next.js frontend** for a fast, responsive UI  
- **Supabase backend** for database, authentication, and hosting  
- **Menu display** – list meals, descriptions, prices  
- **Authentication** – login/signup via Supabase Auth  
- **Role-based views** – e.g., student vs. admin (if applicable)  
- **Agile/Scrum workflow** – iterative sprints, backlog, stand-ups, retrospectives

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+) & npm or yarn  
- Supabase account & project (free works!)  
- Optional: `pnpm`, Docker (for Supabase CLI)

### Setup

1. **Clone repo**
    ```bash
    git clone https://github.com/mattadosss/M462_Mensaapp.git
    cd M462_Mensaapp
    ```

2. **Install dependencies**
    ```bash
    npm install
    # or
    yarn
    # or
    pnpm install
    ```

3. **Set up Supabase**

   - Create a new [Supabase project](https://supabase.com/)
   - Create a `.env.local` in the project root:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your-project-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```
   - Link your Supabase project:
     ```bash
     supabase link --project-ref your-project-ref
     ```

4. **Push your database schema (if `supabase/migrations` folder exists)**
    ```bash
    supabase db push
    ```

    > 💡 This uploads your local SQL migrations to your Supabase project's database.

5. **Run the app**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    Then visit: `http://localhost:3000`

---

## 🧠 Scrum Workflow

This project was developed using **Scrum**:

- **Backlog & Sprint Planning**: Defined stories like *"View today's menu"*, *"Sign in/signup"*, *"Filter meals"*  
- **Sprints**: Weekly cycles with planning, daily stand-ups, demo, and retrospectives  
- **Roles**: Scrum Master, Product Owner, Developers (rotated among the group)

---

## 📁 Project Structure

```bash
/pages           # Next.js pages (e.g., home, login)
/components      # Reusable UI components (MealCard, Header, etc.)
/lib             # Supabase client setup & helper functions
/styles          # Global and component-specific CSS files
.env.local       # Environment variables (not committed to version control)
```


---

## ✅ Usage

- Browse today’s meals, filter by category  
- Authenticate to save favorites or manage content  
- (If admin-enabled) Add/edit meals via a protected UI  

---

## 👥 Contributing

This is a school project; no external PRs, but feedback is welcome!

---


## 🙌 Acknowledgements

Built by the M462 team as part of our software engineering curriculum. Big thanks to the Scrum framework and Supabase for simplifying backend work.