"use client";
import { Session } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Auth from "@/app/pages/Auth";
import Home from "@/app/pages/Home";

export default function Page() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setSession(null);
      }
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      {session === undefined ? null : !session ? (
        <Auth />
      ) : (
        <Home key={session.user.id} session={session} />
      )}
    </>
  );
}
