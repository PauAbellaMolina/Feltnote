"use client";
import { Session } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Auth from "@/app/pages/Auth";
import Home from "@/app/pages/Home";

export default function Page() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  // const [realSession, setRealSession] = useState<Session | null>(null);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setSession(null);
        // setRealSession(null);
      }
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  // useEffect(() => {
  //   if (!realSession && session) {
  //     setRealSession(session);
  //   }
  //   if (
  //     realSession &&
  //     session &&
  //     session?.access_token !== realSession?.access_token
  //   ) {
  //     setRealSession(session);
  //   }
  // }, [session, realSession]);

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
