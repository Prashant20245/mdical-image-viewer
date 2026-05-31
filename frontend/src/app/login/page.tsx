"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { loginDoctor, saveDoctorSession } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const result = await loginDoctor({
        email,
        password,
      });

      if (!result.success) {
        alert(result.message);
        return;
      }

      saveDoctorSession(result.doctor);

      alert("Login Successful");

      router.push("/dashboard");
    } catch (error) {
      console.error(error);

      alert("Login Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[450px]">
        <h1 className="text-3xl font-bold mb-6 text-center">Doctor Login</h1>

        <input
          placeholder="Email"
          className="border p-3 w-full rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-3 w-full rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-cyan-600 text-white w-full py-3 rounded"
        >
          Login
        </button>

        <p className="text-center mt-4">
          New Doctor?
          <span
            className="text-cyan-600 cursor-pointer ml-2"
            onClick={() => router.push("/register")}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}
