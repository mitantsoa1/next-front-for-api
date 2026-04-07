"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, CircleCheck, CircleAlert } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VerifyEmailPage() {
  const t = useTranslations("login");
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const id = params.id;
      const hash = params.hash;
      const expires = searchParams.get("expires");
      const signature = searchParams.get("signature");

      if (!id || !hash || !expires || !signature) {
        setStatus("error");
        setMessage(locale === "fr" ? "Lien de vérification invalide." : "Invalid verification link.");
        return;
      }

      try {
        const backendUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";
        const response = await fetch(
          `${backendUrl}/api/email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (response.ok || response.status === 302) {
          setStatus("success");
          setMessage(
            locale === "fr"
              ? "Votre adresse e-mail a été vérifiée avec succès !"
              : "Your email has been verified successfully!"
          );
          // Redirect to login after a short delay
          setTimeout(() => {
            router.push(`/${locale}/login?verified=1`);
          }, 3000);
        } else {
          const data = await response.json();
          setStatus("error");
          setMessage(data.message || (locale === "fr" ? "La vérification a échoué." : "Verification failed."));
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
        setMessage(
          locale === "fr"
            ? "Une erreur est survenue lors de la vérification."
            : "An error occurred during verification."
        );
      }
    };

    verifyEmail();
  }, [params, searchParams, locale, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800"
      >
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {locale === "fr" ? "Vérification en cours..." : "Verifying your email..."}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              {locale === "fr"
                ? "Veuillez patienter pendant que nous vérifions votre compte."
                : "Please wait while we verify your account."}
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <CircleCheck className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {locale === "fr" ? "Compte vérifié !" : "Email Verified!"}
            </h2>
            <p className="text-emerald-800 dark:text-emerald-300 font-medium">
              {message}
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {locale === "fr"
                ? "Vous allez être redirigé vers la page de connexion..."
                : "You are being redirected to the login page..."}
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <CircleAlert className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {locale === "fr" ? "Erreur de vérification" : "Verification Failed"}
            </h2>
            <p className="text-red-800 dark:text-red-300 font-medium">
              {message}
            </p>
            <Button asChild className="mt-4 bg-blue-600 hover:bg-blue-700 rounded-xl px-8 h-12 font-bold shadow-lg shadow-blue-500/20">
              <Link href={`/${locale}/login`}>
                {locale === "fr" ? "Retour à la connexion" : "Back to Login"}
              </Link>
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
