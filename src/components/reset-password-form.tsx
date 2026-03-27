"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group"
import { Link } from "@/i18n/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useTranslations } from "next-intl"
import { useState, useEffect } from "react"
import { Loader2, CircleAlert, CircleCheck, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { resetPassword } from "@/lib/auth"

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const t = useTranslations('reset_password');
  const searchParams = useSearchParams();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const formSchema = z.object({
    password: z.string().min(8, { message: t("password_min_length") || "Password must be at least 8 characters" }),
    password_confirmation: z.string(),
  }).refine((data) => data.password === data.password_confirmation, {
    message: t("passwords_dont_match") || "Passwords do not match",
    path: ["password_confirmation"],
  });

  type ResetPasswordValues = z.infer<typeof formSchema>;

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordValues>({
    resolver: zodResolver(formSchema)
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setError(t("error_message"));
    }
  }, [token, email, t]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data: ResetPasswordValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const apiPayload = {
      token: token,
      email: email,
      password: data.password,
      password_confirmation: data.password_confirmation,
    };

    try {
      const result = await resetPassword(apiPayload);

      if (result.success) {
        setSuccess(t("success_message"));
      } else {
        setError(result.message || t("error_message"));
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Reset password error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-2 items-center justify-center"
      >
        <Link href={"/"} className="inline-block w-fit -mt-16">
          <Image
            alt="logo"
            src="/images/BVT-Vertical.png"
            width={220}
            height={220}
            className="h-auto w-auto"
          />
        </Link>
      </motion.div>

      <div className="flex flex-col gap-2 text-center -mt-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t("title")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
          {t("description")}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-xl"
            >
              <div className="flex items-center gap-2">
                <CircleAlert className="h-4 w-4" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-4 py-3 rounded-xl"
            >
              <div className="flex items-center gap-2">
                <CircleCheck className="h-4 w-4" />
                <p className="text-sm font-medium">{success}</p>
              </div>
              <div className="mt-3">
                <Button
                  asChild
                  className="w-full text-xs h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  <Link href="/login">
                    {t("back_to_login")}
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}

          {!success && (
            <>
              <Field>
                <FieldLabel htmlFor="password">{t("password_label")}</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className={cn("rounded-xl h-11", errors.password ? "border-red-500" : "")}
                  />
                  <InputGroupAddon align="inline-end">
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="text-foreground flex size-6 items-center justify-center hover:cursor-pointer hover:bg-accent rounded-sm mr-2"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </InputGroupAddon>
                </InputGroup>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1 font-medium">
                    <CircleAlert className="h-3 w-3" />
                    {errors.password.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="password_confirmation">{t("confirm_password_label")}</FieldLabel>
                <Input
                  id="password_confirmation"
                  type={showPassword ? "text" : "password"}
                  {...register("password_confirmation")}
                  className={cn("rounded-xl h-11", errors.password_confirmation ? "border-red-500" : "")}
                />
                {errors.password_confirmation && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1 font-medium">
                    <CircleAlert className="h-3 w-3" />
                    {errors.password_confirmation.message}
                  </p>
                )}
              </Field>

              <Field>
                <Button
                  type="submit"
                  disabled={isLoading || !token}
                  className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold transition-all shadow-lg shadow-blue-500/20 hover:cursor-pointer dark:text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("resetting")}
                    </>
                  ) : (
                    t("submit_button")
                  )}
                </Button>
              </Field>
            </>
          )}
        </FieldGroup>
      </form>

      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back_to_login")}
        </Link>
      </div>
    </div>
  )
}
