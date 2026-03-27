import { useState, useRef, useCallback, useEffect } from "react";
import type { User } from "../types";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleJWTPayload {
  name: string;
  email: string;
  picture: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (r: GoogleCredentialResponse) => void; cancel_on_tap_outside?: boolean }) => void;
          prompt: () => void;
          cancel: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

export function useAuth(onLogin: (email: string, name: string) => void) {
  const [user, setUser] = useState<User | null>(null);
  const gsiInitialized = useRef(false);

  const handleGCred = useCallback((response: GoogleCredentialResponse) => {
    try {
      const payload = JSON.parse(atob(response.credential.split(".")[1])) as GoogleJWTPayload;
      const u: User = {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        isAdmin: false, // resolved from DB in useTournament via onLogin
      };
      setUser(u);
      onLogin(u.email, u.name);
    } catch (e) {
      console.error("Failed to parse Google credential", e);
    }
  }, [onLogin]);

  useEffect(() => {
    if (GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE" || !GOOGLE_CLIENT_ID) return;

    const initGoogle = () => {
      if (gsiInitialized.current) return;
      gsiInitialized.current = true;
      window.google!.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGCred,
        cancel_on_tap_outside: false,
      });
    };

    // Already loaded (e.g. hot reload)
    if (window.google?.accounts?.id) {
      initGoogle();
      return;
    }

    // Inject script once, initialize on load
    let script = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (!script) {
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", initGoogle);
    return () => script!.removeEventListener("load", initGoogle);
  }, [handleGCred]);

  const signIn = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE") {
      console.warn("No Google Client ID configured");
      return;
    }
    try {
      window.google?.accounts.id.disableAutoSelect();
      window.google?.accounts.id.prompt();
    } catch (e) {
      console.error("Google sign-in error", e);
    }
  }, []);

  const signOut = useCallback(() => {
    try { window.google?.accounts.id.cancel(); } catch (e) {}
    setUser(null);
  }, []);

  const devLogin = useCallback((isAdminLogin: boolean, adminEmails: string[]) => {
    const u: User = isAdminLogin
      ? { name: "Admin", email: adminEmails[0] ?? "admin@example.com", picture: null, isAdmin: true }
      : { name: "Demo Player", email: "demo@example.com", picture: null, isAdmin: false };
    setUser(u);
    onLogin(u.email, u.name);
  }, [onLogin]);

  return { user, setUser, signIn, signOut, devLogin };
}