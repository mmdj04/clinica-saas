import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Nome obrigatório").max(200),
    email: z.string().email("E-mail inválido").max(255),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .max(128)
      .regex(/[a-zA-Z]/, "Deve conter letras")
      .regex(/\d/, "Deve conter números"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  email: z.string().email("E-mail inválido").max(255),
  password: z.string().min(1, "Senha obrigatória").max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido").max(255),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .max(128)
      .regex(/[a-zA-Z]/, "Deve conter letras")
      .regex(/\d/, "Deve conter números"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;