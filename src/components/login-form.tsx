"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Link } from "@/i18n/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { login } from "@/lib/auth"
import { useState } from "react"
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import Image from "next/image"
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group"
import { motion } from "framer-motion"
import { useAuthTransition } from "./auth-layout"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const t = useTranslations('login');
  const tS = useTranslations('signup');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const formSchema = z.object({
    email: z.string().email({ message: t("invalid_email") }),
    password: z.string().min(1, { message: t("password_required") }),
  });

  type LoginFormValues = z.infer<typeof formSchema>;

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema)
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/google/url');
      const data = await response.json();

      if (response.ok && data.url) {
        router.push(data.url);
      } else {
        setError(data.error || 'Failed to initialize Google login');
        setIsGoogleLoading(false);
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Failed to connect to Google. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setIsBlocked(false);

    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    try {
      const result = await login(formData);

      if (result.success) {
        setSuccess(t("login_success"));
        setTimeout(() => {
          const redirectUrl = searchParams.get('redirect');
          if (redirectUrl) {
            router.push(redirectUrl);
          } else {
            router.push(`/${locale}/dashboard`);
          }
          router.refresh();
        }, 10);
      } else {
        const resData = result.data;
        if (resData?.is_blocked) {
          setIsBlocked(true);
          setError(locale === 'fr' ? "Votre compte est bloqué suite à plusieurs tentatives" : "Your account is blocked due to multiple attempts.");
        } else if (resData?.attempts_remaining !== undefined) {
          const toast = (await import("sonner")).toast;
          toast.warning(result.message, {
            description: `Attention : plus que ${resData.attempts_remaining} tentative(s) avant le blocage de votre compte.`,
            duration: 5000,
          });
          setError(result.message);
        } else {
          setError(result.message || t("login_failed"));
        }
      }
    } catch (err: any) {
      if (!err.message?.includes('NEXT_REDIRECT')) {
        setError("An unexpected error occurred");
        console.error("Login error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const { startTransition } = useAuthTransition();

  const handleSignUpClick = () => {
    startTransition('/signup');
  };

  return (
    <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-2  items-center justify-center "
      >
        <Link href={"/"} className=" inline-block w-fit -mt-16">
          <Image
            alt="logo"
            title="logo"
            src="/images/BVT-Vertical.png"
            width={220}
            height={220}
            className=" h-auto w-auto"
          />
        </Link>
        {/* <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t("title") || "Bon retour"}
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          {t("description") || "Connectez-vous à votre compte pour continuer."}
        </p> */}
      </motion.div>

      <form className="space-y-2 -mt-16" onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-xl"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm font-medium">{error}</p>
              </div>
              {isBlocked && (
                <div className="mt-3">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full text-xs h-9 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 font-bold"
                  >
                    <Link href="/forgot-password">
                      {locale === 'fr' ? "Réinitialiser mon mot de passe" : "Reset my password"}
                    </Link>
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-4 py-3 rounded-xl"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
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
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="h-3 w-3" />
                {errors.email.message}
              </p>
            )}
          </Field>

          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="password">{t("password_label")}</FieldLabel>
              <Link
                href="/forgot-password"
                className="ml-auto text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 underline-offset-4 hover:underline"
              >
                {t("forgot_password")}
              </Link>
            </div>

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
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
                <AlertCircle className="h-3 w-3" />
                {errors.password.message}
              </p>
            )}
          </Field>

          <Field>
            <Button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-blue-500/20 hover:cursor-pointer dark:text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("signing_in")}
                </>
              ) : (
                t("sign_in_button")
              )}
            </Button>
          </Field>

          <FieldSeparator className="*:data-[slot=field-separator-content]:bg-white dark:*:data-[slot=field-separator-content]:bg-slate-950 font-medium text-xs text-slate-400">
            {t("or_continue_with")}
          </FieldSeparator>

          <Field className="grid grid-cols-1 gap-4">
            <Button
              variant="outline"
              type="button"
              disabled={isLoading || isGoogleLoading}
              onClick={handleGoogleLogin}
              className="h-11 rounded-xl border-slate-200 dark:border-slate-800 font-medium hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors hover:cursor-pointer dark:text-white"
            >
              {isGoogleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Google</span>
                </div>
              )}
            </Button>
          </Field>

          <FieldDescription className="text-center font-medium">
            <span className="text-slate-500 dark:text-slate-400">{t("no_account")}{" "}</span>
            <span onClick={handleSignUpClick} className="text-blue-600 dark:text-blue-400 hover:underline hover:cursor-pointer">
              {t("sign_up_link")}
            </span>
          </FieldDescription>
        </FieldGroup>
      </form>

      {/* <FieldDescription className="text-center text-[11px] leading-relaxed mt-4 text-slate-400">
        {tS('terms_notice')}{" "}
        <Link href="/terms-of-service" target="_blank" className="font-medium hover:underline text-blue-600 dark:text-blue-400">
          {tS('terms_of_service')}
        </Link>{" "}
        {tS('and')}{" "}
        <Link href="/rgpd" target="_blank" className="font-medium hover:underline text-blue-600 dark:text-blue-400">
          {tS('privacy_policy')}
        </Link>.
      </FieldDescription> */}
    </div>
  )
}