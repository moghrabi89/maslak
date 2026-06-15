import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030712] p-4">
      <SignUp path="/sign-up" signInUrl="/sign-in" />
    </div>
  );
}
