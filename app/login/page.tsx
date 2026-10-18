import type { Metadata } from "next";
import LoginTabs from "@/components/LoginTabs";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="container auth-page">
      <p className="micro">Your account</p>
      <h1 className="h1">Welcome to ELUARA</h1>
      <LoginTabs />
    </div>
  );
}

