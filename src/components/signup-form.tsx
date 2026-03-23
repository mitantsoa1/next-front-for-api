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
import { Link } from '@/i18n/navigation'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { signup } from "@/lib/auth"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { Loader2, CircleAlert, CircleCheck, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group"
import { motion } from "framer-motion"
import { useAuthTransition } from "./auth-layout"
import ReCAPTCHA from "react-google-recaptcha"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const t = useTranslations('signup');
  const locale = useLocale();
  const router = useRouter();

  const formSchema = z.object({
    name: z.string().min(3, { message: t("name_min_length") }),
    email: z.string().email({ message: t("invalid_email") }),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    // .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: t("passwords_dont_match"),
    path: ["confirmPassword"]
  });


  type SignupFormValues = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError
  } = useForm<SignupFormValues>({
    resolver: zodResolver(formSchema)
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setApiError(null);

    try {
      const response = await fetch('/api/auth/google/url');
      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        setApiError(data.error || 'Failed to initialize Google signup');
        setIsGoogleLoading(false);
      }
    } catch (err) {
      console.error('Google signup error:', err);
      setApiError('Failed to connect to Google. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    setApiError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("password_confirmation", data.confirmPassword);
    formData.append("role", "user");

    try {
      const result = await signup(formData);

      if (result.success) {
        setSuccess(result.message || t("account_created"));
        setTimeout(() => {
          router.push(`/${locale}/login`);
        }, 5000);
      } else {
        setApiError(result.message || t("registration_failed"));

        if (result.message?.toLowerCase().includes("email")) {
          setFormError("email", {
            type: "manual",
            message: result.message
          });
        }
      }
    } catch (err: any) {
      if (!err.message?.includes('NEXT_REDIRECT')) {
        setApiError("An unexpected error occurred");
        console.error("Signup error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const { startTransition } = useAuthTransition();

  const handleSignInClick = () => {
    startTransition('/login');
  };

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)} {...props}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-2 text-left items-center justify-center"
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
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white -mt-14">
          {t("title") || "Créer un compte"}
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          {t("description") || "Inscrivez-vous pour accéder à votre espace Blue Valoris."}
        </p>
      </motion.div>

      <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup className="space-y-4">
          {apiError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-1 rounded-xl"
            >
              <div className="flex items-center gap-2">
                <CircleAlert className="h-4 w-4" />
                <p className="text-sm font-medium">{apiError}</p>
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

          <Field className="mb-0">
            <FieldLabel htmlFor="name">{t("name_label")}</FieldLabel>
            <Input
              id="name"
              type="text"
              placeholder={t("name_placeholder")}
              {...register("name")}
              className={cn("rounded-xl h-11", errors.name ? "border-red-500" : "")}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1 font-medium">
                <CircleAlert className="h-3 w-3" />
                {errors.name.message}
              </p>
            )}
          </Field>

          <Field className="mb-0">
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
                <CircleAlert className="h-3 w-3" />
                {errors.email.message}
              </p>
            )}
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
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

            <Field className="mb-0">
              <FieldLabel htmlFor="confirmPassword">
                {t("confirm_password_label")}
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  className={cn("rounded-xl h-11", errors.confirmPassword ? "border-red-500" : "")}
                />
                <InputGroupAddon align="inline-end">
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="text-foreground flex size-6 items-center justify-center hover:cursor-pointer hover:bg-accent rounded-sm mr-2"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </InputGroupAddon>
              </InputGroup>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1 font-medium">
                  <CircleAlert className="h-3 w-3" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </Field>
          </div>

          <div className="flex justify-start items-start p-0! ">
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
              onChange={(val) => setCaptchaVerified(!!val)}
              className="scale-90 -ml-5 w-full!"
            />
          </div>

          <Field>
            <Button
              type="submit"
              disabled={isLoading || isGoogleLoading || !captchaVerified}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-blue-500/20 hover:cursor-pointer dark:text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("creating_account")}
                </>
              ) : (
                t("create_account_button")
              )}
            </Button>
          </Field>

          <FieldSeparator className="*:data-[slot=field-separator-content]:bg-white dark:*:data-[slot=field-separator-content]:bg-slate-950 font-medium text-xs text-slate-400">
            {t("or_continue_with")}
          </FieldSeparator>

          <Field className="grid grid-cols-1">
            <Button
              variant="outline"
              type="button"
              disabled={isLoading || isGoogleLoading}
              onClick={handleGoogleSignup}
              className="h-11 rounded-xl border-slate-200 dark:border-slate-800 font-medium hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
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
            <span className="text-slate-500 dark:text-slate-400">{t("already_account")}{" "}</span>
            <span onClick={handleSignInClick} className="text-blue-600 dark:text-blue-400 hover:underline hover:cursor-pointer">
              {t("sign_in_link")}
            </span>
          </FieldDescription>
        </FieldGroup>
      </form>

      <FieldDescription className="text-center text-[11px] leading-relaxed mt-4 text-slate-400">
        {t('terms_notice')}{" "}
        <Link href="/terms-of-service" target="_blank" className="font-medium hover:underline text-blue-600 dark:text-blue-400">
          {t('terms_of_service')}
        </Link>{" "}
        {t('and')}{" "}
        <Link href="/privacy" target="_blank" className="font-medium hover:underline text-blue-600 dark:text-blue-400">
          {t('privacy_policy')}
        </Link>.
      </FieldDescription>
    </div>
  );
}