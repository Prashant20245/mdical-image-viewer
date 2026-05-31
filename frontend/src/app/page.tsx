"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getLoggedDoctor } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const doctor = getLoggedDoctor();

    if (doctor) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, []);

  return null;
}
