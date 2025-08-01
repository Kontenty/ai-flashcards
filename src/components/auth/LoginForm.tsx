import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";
import { getStringField } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Nieprawidłowy email"),
  password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
});

type FormData = z.infer<typeof schema>;

export const LoginForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.redirected) {
      setShouldRedirect(true);
      return;
    }
    const body = await response.json();
    if (response.ok) {
      setShouldRedirect(true);
    } else {
      setServerError(getStringField(body, "error", "Coś poszło nie tak"));
    }
  };

  useEffect(() => {
    if (shouldRedirect) {
      window.location.href = "/dashboard";
    }
  }, [shouldRedirect]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm mx-auto">
      <div>
        <label htmlFor="email" className="block mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          className="w-full border rounded px-3 py-2"
          data-testid="login-email"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="password" className="block mb-1">
          Hasło
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          className="w-full border rounded px-3 py-2"
          data-testid="login-password"
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>
      {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="login-submit">
        Zaloguj się
      </Button>
    </form>
  );
};

export default LoginForm;
