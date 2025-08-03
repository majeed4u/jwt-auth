"use client";
import api from "@/lib/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type FormData = z.infer<typeof formSchema>;

export default function SigninPage() {
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("🔐 Attempting sign in...");
      const response = await api.post("/auth/sign-in", values);
      toast.success("Signed in successful!");
      console.log("Response:", response.data);
      router.push("/");
    } catch (error: any) {
      console.error("❌ Sign in error:", error);
      if (error.response) {
        toast.error(error.response.data?.error || "An error occurred");
      } else {
        toast.error("Sign in failed. Please try again.");
      }
    }
  }
  return (
    <div className=" w-full max-w-sm mx-auto p-4 shadow-md rounded-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormDescription>This is your login email.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is your account password.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className=" w-full" type="submit">
            Sign In
          </Button>
        </form>
      </Form>
    </div>
  );
}
