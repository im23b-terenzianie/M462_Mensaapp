"use client";

import { signInAction, signUpAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/utils/supabase/client";

// Neue Icons importieren
import { UtensilsCrossed, ChefHat, Soup, Salad } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "admin"]).optional(),
  accountType: z.enum(["Student", "Teacher", "External"]),
});

export default function AuthPage() {
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "user",
      accountType: "Student",
    },
  });

  useEffect(() => {
    const supabase = createClient();
    const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === "SIGNED_IN") {
            setIsSignUp(false);
            toast({
              title: "Registrierung erfolgreich!",
              description:
                  "Bitte melden Sie sich jetzt mit Ihren neuen Zugangsdaten an.",
              variant: "default",
            });
          }
        }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [toast]);

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
      setError(null);
    }
  }, [error, toast]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    if (isSignUp && data.role) {
      formData.append("role", data.role);
    }
    if (isSignUp && data.accountType) {
      formData.append("accountType", data.accountType);
    }

    try {
      const action = isSignUp ? signUpAction : signInAction;
      const result = await action({ error: null }, formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.redirectTo) {
        window.location.href = result.redirectTo;
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] w-full px-4">
        {!isSignUp && (
            <div className="mb-6 text-center">
              <h1 className="text-4xl font-bold">Log In</h1>
              <p className="text-sm text-gray-400 mt-2">
                Please sign in to your existing account.
              </p>
            </div>
        )}
        <Card className="w-[350px] bg-white text-black shadow-xl">
          <CardHeader className="flex flex-col items-center">
            {/* Piktogramme hinzufügen */}
            <div className="flex space-x-2 text-green-600 mb-2">
              <UtensilsCrossed size={24} />
              <ChefHat size={24} />
              <Soup size={24} />
              <Salad size={24} />
            </div>
            <CardTitle>{isSignUp ? "Sign Up" : "Sign In"}</CardTitle>
            <CardDescription>
              {isSignUp
                  ? "Create a new account"
                  : "Enter your credentials to access your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                {...field}
                            />
                          </FormControl>
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
                          <FormMessage />
                        </FormItem>
                    )}
                />
                {isSignUp && (
                    <>
                      <FormField
                          control={form.control}
                          name="role"
                          render={({ field }) => (
                              <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="user">Normal User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="accountType"
                          render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account Type</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select account type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Student">Schüler</SelectItem>
                                    <SelectItem value="Teacher">Lehrer</SelectItem>
                                    <SelectItem value="External">Extern</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                          )}
                      />
                    </>
                )}
                <Button 
                  type="submit" 
                  className="w-full"
                  isLoading={isLoading}
                  loadingText={isSignUp ? "Registriere..." : "Anmelde..."}
                >
                  {isSignUp ? "Registrieren" : "Anmelden"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary hover:underline"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
  );
}
