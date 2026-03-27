"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Link } from "@/i18n/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { Loader2, CircleAlert, CircleCheck, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import { forgotPassword } from "@/lib/auth"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const t = useTranslations('forgot_password');
  
  const formSchema = z.object({
    email: z.string().email({ message: t("invalid_email") || "Invalid email" }),
  });

  type ForgotPasswordValues = z.infer<typeof formSchema>;

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(formSchema)
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: ForgotPasswordValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await forgotPassword(data.email);

      if (result.success) {
        setSuccess(t("success_message"));
      } else {
        setError(result.message || t("error_message") || "An error occurred");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Forgot password error:", err);
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
            </motion.div>
          )}

          <Field>
            <FieldLabel htmlFor="email">{t("email_label")}</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder={t("email_placeholder")}
              {...register("email")}
              className={cn("rounded-xl h-11", errors.email ? "border-red-500" : "")}
              disabled={!!success}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1 font-medium">
                <CircleAlert className="h-3 w-3" />
                {errors.email.message}
              </p>
            )}
          </Field>

          <Field>
            <Button
              type="submit"
              disabled={isLoading || !!success}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold transition-all shadow-lg shadow-blue-500/20 hover:cursor-pointer dark:text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("sending")}
                </>
              ) : (
                t("submit_button")
              )}
            </Button>
          </Field>
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
