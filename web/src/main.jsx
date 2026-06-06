import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router";
import { ErrorBoundary } from "./ErrorBoundary.jsx";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const queryClient = new QueryClient();

const root = document.getElementById("root");

// If Clerk key is missing (misconfigured Render env vars), show a clear error
if (!PUBLISHABLE_KEY) {
  root.innerHTML = `
    <div style="min-height:100vh;background:#0D0D0F;color:#ECECEC;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif;gap:16px;padding:24px;text-align:center">
      <div style="font-size:48px">🔑</div>
      <h1 style="font-size:22px;font-weight:bold;margin:0">Missing Clerk API Key</h1>
      <p style="color:#6B6B70;max-width:420px;margin:0">
        The <code style="background:#1A1A1D;padding:2px 6px;border-radius:4px">VITE_CLERK_PUBLISHABLE_KEY</code>
        environment variable is not set. Please add it to your Render dashboard under <strong>Environment</strong> and redeploy.
      </p>
    </div>`;
} else {
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <ClerkProvider
          publishableKey={PUBLISHABLE_KEY}
          afterSignInUrl="/chat"
          afterSignUpUrl="/onboarding"
        >
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </QueryClientProvider>
        </ClerkProvider>
      </ErrorBoundary>
    </StrictMode>
  );
}
