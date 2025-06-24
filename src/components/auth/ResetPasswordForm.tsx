import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";

const schema = z
  .object({
    password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być takie same",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export const ResetPasswordForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Placeholder for backend logic
  const onSubmit = async () => {
    // TODO: implement reset password logic
    // On success: inform user
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm mx-auto">
      <div>
        <label htmlFor="password" className="block mb-1">
          Nowe hasło
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
      {/* Placeholder for global info */}
      {/* <Alert variant="default">Hasło zostało zmienione. Możesz się zalogować.</Alert> */}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Zmień hasło
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
