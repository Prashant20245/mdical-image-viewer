"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { registerDoctor } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    doctor_name: "",
    email: "",
    password: "",
    department: "",
    hospital: "",
  });

  const handleRegister = async () => {
    const result = await registerDoctor(form);

    if (!result.success) {
      alert(result.message);
      return;
    }

    alert("Registration Successful");

    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[500px]">
        <h1 className="text-3xl font-bold mb-6 text-center">Doctor Register</h1>

        {["doctor_name", "email", "password", "department", "hospital"].map(
          (field) => (
            <input
              key={field}
              placeholder={field}
              type={field === "password" ? "password" : "text"}
              className="border p-3 w-full rounded mb-4"
              value={form[field as keyof typeof form]}
              onChange={(e) =>
                setForm({
                  ...form,
                  [field]: e.target.value,
                })
              }
            />
          ),
        )}

        <button
          onClick={handleRegister}
          className="bg-cyan-600 text-white w-full py-3 rounded"
        >
          Register
        </button>
      </div>
    </div>
  );
}
