# OmniFlow Architecture

## Folder Structure

```
/app
  /admin                # "God Mode" Dashboard routes
    /inventory          # Inventory management
    /upload             # "Magic" Product Uploader
  /api                  # Route Handlers (webhooks, etc.)
  /shop                 # User Storefront routes
  /layout.tsx           # Root layout
  /page.tsx             # Landing page
/components
  /ui                   # Shadcn UI primitives (Button, Input, etc.)
  /admin                # Admin-specific components (Charts, Tables)
  /shop                 # Shop-specific components (ProductCard, Cart)
  /shared               # Shared components (Navbar, Footer)
/lib
  /actions              # Server Actions (mutations)
  /ai                   # Gemini AI integration logic
  /db                   # Supabase client & types
  /hooks                # React hooks (Zustand stores, etc.)
  /utils                # Helper functions (currency formatting, cn)
/public                 # Static assets
```

## Core Technologies Configuration

*   **Next.js 15**: Leveraging Server Actions for form submissions and data mutations.
*   **Supabase**: Used for Auth, DB, and Realtime.
*   **Vercel AI SDK**: Used for streaming responses and interacting with Gemini.
*   **Tailwind CSS**: For styling.

## Design Patterns

*   **Server Actions**: All mutations (create/update/delete) are handled via Server Actions in `/lib/actions`.
*   **Optimistic UI**: Use `useOptimistic` hook for immediate feedback.
*   **AI Streaming**: Use `useChat` or `streamText` from AI SDK for generative UI.
