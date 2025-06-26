import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";

const schema = z
  .object({
    email: z.string().email("Nieprawidłowy email"),
    password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
    confirmPassword: z.string(),
    gdpr: z.literal(true, { errorMap: () => ({ message: "Musisz zaakceptować RODO" }) }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być takie same",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export const RegisterForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    setSuccessMessage(null);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await response.json();
    if (response.ok) {
      setSuccessMessage(body.message);
    } else {
      setServerError(body.error || "Coś poszło nie tak");
    }
  };

  if (successMessage) {
    return (
      <div className="space-y-4 max-w-sm mx-auto text-center">
        <p className="text-green-600">{successMessage}</p>
        <Button onClick={() => (window.location.href = "/auth/login")} className="w-full">
          Przejdź do logowania
        </Button>
      </div>
    );
  }

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
          autoComplete="new-password"
          {...register("password")}
          className="w-full border rounded px-3 py-2"
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block mb-1">
          Powtórz hasło
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
          className="w-full border rounded px-3 py-2"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>
      <div className="flex items-center">
        <input id="gdpr" type="checkbox" {...register("gdpr")} className="mr-2" />
        <label htmlFor="gdpr" className="text-sm">
          Akceptuję politykę RODO
        </label>
      </div>
      {errors.gdpr && <p className="text-red-500 text-sm mt-1">{errors.gdpr.message}</p>}
      {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Zarejestruj się
      </Button>
    </form>
  );
};

export default RegisterForm;
