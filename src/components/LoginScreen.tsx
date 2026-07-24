"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Mode = "signin" | "signup";

function friendlyError(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "이메일 또는 비밀번호가 올바르지 않아요";
  }
  if (message.includes("User already registered")) {
    return "이미 가입된 이메일이에요";
  }
  if (message.includes("Password should be at least")) {
    return "비밀번호는 6자 이상이어야 해요";
  }
  if (message.includes("Unable to validate email address") || message.includes("is invalid")) {
    return "이메일 형식을 확인해주세요";
  }
  return message;
}

export default function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupDone, setSignupDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "signin") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (signInError) {
        setError(friendlyError(signInError.message));
        return;
      }
      router.push("/");
      router.refresh();
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);
    if (signUpError) {
      setError(friendlyError(signUpError.message));
      return;
    }
    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }
    setSignupDone(true);
  }

  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-6 bg-cream p-6 sm:h-full">
      <div className="flex flex-col items-center gap-1">
        <span className="text-5xl">🍙</span>
        <h1 className="text-2xl font-bold text-gray-800">우리동네 밥친구</h1>
        <p className="text-base text-gray-400">
          {mode === "signin" ? "로그인하고 시작해요" : "회원가입하고 시작해요"}
        </p>
      </div>

      {signupDone ? (
        <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl bg-white p-6 text-center shadow-sm">
          <span className="text-4xl">📩</span>
          <p className="text-lg font-bold text-gray-800">
            가입 확인 메일을 보냈어요!
          </p>
          <p className="text-base text-gray-400">
            메일함에서 인증 링크를 눌러주세요
          </p>
          <button
            type="button"
            onClick={() => {
              setSignupDone(false);
              setMode("signin");
            }}
            className="h-14 w-full rounded-2xl bg-c-green text-lg font-bold text-white shadow-sm transition active:scale-95"
          >
            로그인하러 가기
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-sm flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            autoComplete="email"
            className="h-14 w-full rounded-2xl border border-gray-100 bg-white px-4 text-lg font-bold text-gray-700 outline-none placeholder:text-gray-300"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 (6자 이상)"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="h-14 w-full rounded-2xl border border-gray-100 bg-white px-4 text-lg font-bold text-gray-700 outline-none placeholder:text-gray-300"
          />

          {error && (
            <p className="text-sm font-bold text-c-red">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-14 w-full rounded-2xl bg-c-green text-lg font-bold text-white shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            {loading ? "처리 중..." : mode === "signin" ? "로그인" : "회원가입"}
          </button>

          <button
            type="button"
            onClick={() => {
              setError(null);
              setMode(mode === "signin" ? "signup" : "signin");
            }}
            className="text-sm font-bold text-gray-400"
          >
            {mode === "signin"
              ? "계정이 없으신가요? 회원가입"
              : "이미 계정이 있으신가요? 로그인"}
          </button>
        </form>
      )}
    </div>
  );
}
