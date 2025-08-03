import { Button } from "@/components/ui/button";
import { getCurrentUser } from "./action/get-currentuser";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";

const signOutUrl = "http://localhost:5000/api/v1/auth/sign-out";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }
  console.log("Current User:", user);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome to the Home Page</h1>
      <p>{user?.name}</p>
      <SignOutButton />
    </div>
  );
}
