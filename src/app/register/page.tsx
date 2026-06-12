import { Suspense } from "react";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <Suspense>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
