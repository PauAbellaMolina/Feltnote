"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import EditPencil from "@/public/edit-2.svg";
import Image from "next/image";
import { ActivityIndicator } from "@/components/ActivityIndicator";

export default function Auth() {
  const [email, setEmail] = useState<string>("");
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState<
    string | undefined
  >(undefined);
  const [oneTimeCode, setOneTimeCode] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailErrorMessage !== undefined) {
      setEmailErrorMessage(undefined);
    }
  }, [email, emailErrorMessage]);

  const onEmailLogIn = () => {
    setEmailErrorMessage(undefined);
    setLoading(true);
    supabase.auth
      .signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
        },
      })
      .then(() => {
        setEmailSent(true);
      })
      .catch(() => {
        setEmailSent(false);
        setEmailErrorMessage("Try again");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onChangeEmail = () => {
    setEmailSent(false);
    setEmailErrorMessage(undefined);
    setLoading(false);
  };

  const onCodeSubmit = () => {
    setEmailErrorMessage(undefined);
    setLoading(true);
    supabase.auth
      .verifyOtp({
        email,
        token: oneTimeCode.toString(),
        type: "email",
      })
      .catch(() => {
        setEmailErrorMessage("Try again");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div
      className="
        flex flex-col items-center justify-center gap-5
        max-w-[80dvw] w-[460px]
        rounded-[50px]
        bg-[#9C9C9C33] p-[30px_20px_35px]
        lg:light:bg-[#9C9C9C40]
        self-center justify-self-center
      "
    >
      <h1 className="text-[30px] font-bold">Log in</h1>
      <p className="text-[18px] text-center max-w-[300px] opacity-80">
        Enter your email to receive a one-time code
      </p>

      <div className="mt-5 flex flex-col items-center w-full gap-4">
        {!emailSent ? (
          <input
            type="email"
            inputMode="email"
            className="
              rounded-[15px] border border-[#FCFCFC33]
              light:border-[#20222833]
              px-5 py-2.5 text-[20px] text-center
              w-[258px] max-w-[80%]
              bg-transparent
            "
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
        ) : (
          <>
            <div className="flex flex-row items-center gap-3 max-w-[250px]">
              <p className="text-[25px] max-w-[300px] overflow-x-auto">
                {email}
              </p>
              <Image
                onClick={onChangeEmail}
                src={EditPencil}
                alt="edit email"
                className="w-[19px] light:invert-0 cursor-pointer"
              />
            </div>
            <input
              type="number"
              inputMode="numeric"
              className="
                rounded-[15px] border border-[#FCFCFC33]
                light:border-[#20222833]
                px-5 py-2.5 text-[20px] text-center
                w-[258px] max-w-[80%]
                bg-transparent
              "
              placeholder="One-time code"
              onChange={(e) => setOneTimeCode(e.target.value)}
            />
          </>
        )}

        {emailErrorMessage ? (
          <p className="text-[#ff3737] h-5">{emailErrorMessage}</p>
        ) : null}

        <div>
          {loading ? (
            <ActivityIndicator />
          ) : !emailSent ? (
            <button
              disabled={!email.includes("@")}
              className="
                rounded-[15px] px-[25px] py-[11px]
                w-full max-w-[300px]
                bg-[#FCFCFC]
                disabled:opacity-60 disabled:cursor-not-allowed
              "
              onClick={onEmailLogIn}
            >
              <span className="font-medium text-[18px] text-center text-[#202228] block">
                Send
              </span>
            </button>
          ) : (
            <button
              disabled={oneTimeCode.length !== 8}
              className="
                rounded-[15px] px-[25px] py-[11px]
                w-full max-w-[300px]
                bg-[#FCFCFC]
                disabled:opacity-60 disabled:cursor-not-allowed
              "
              onClick={onCodeSubmit}
            >
              <span className="font-medium text-[18px] text-center text-[#202228] block">
                Enter
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
