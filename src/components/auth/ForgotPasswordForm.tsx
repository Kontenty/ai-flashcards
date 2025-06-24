import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";

const schema = z.object({
  email: z.string().email("Nieprawidłowy email"),
});

type FormData = z.infer<typeof schema>;

export const ForgotPasswordForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Placeholder for backend logic
  const onSubmit = async () => {
    // TODO: implement forgot password logic
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
      {/* Placeholder for global info */}
      {/* <Alert variant="default">Jeśli konto istnieje, wysłaliśmy instrukcje na podany adres e-mail.</Alert> */}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Wyślij link resetujący
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;
