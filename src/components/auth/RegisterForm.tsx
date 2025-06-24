import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";

const schema = z
  .object({
    email: z.string().email("Nieprawidłowy email"),
    password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
    confirmPassword: z.string(),
    rodo: z.literal(true, { errorMap: () => ({ message: "Musisz zaakceptować RODO" }) }),
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

  // Placeholder for backend logic
  const onSubmit = async () => {
    // TODO: implement register logic
    // On success: inform user to check email
  };

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
        <input id="rodo" type="checkbox" {...register("rodo")} className="mr-2" />
        <label htmlFor="rodo" className="text-sm">
          Akceptuję politykę RODO
        </label>
      </div>
      {errors.rodo && <p className="text-red-500 text-sm mt-1">{errors.rodo.message}</p>}
      {/* Placeholder for global error or info */}
      {/* <Alert variant="default">Sprawdź skrzynkę e-mail, aby potwierdzić rejestrację.</Alert> */}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Zarejestruj się
      </Button>
    </form>
  );
};

export default RegisterForm;
