"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Shield,
  Camera,
  CheckCircle2,
  Settings,
  Lock,
  Activity,
  Eye,
  EyeOff,
  KeyRound,
  CalendarDays,
  BadgeCheck,
  CircleAlert,
  Loader2,
  UserCheck,
  Trash2,
  X,
} from "lucide-react";
import { useSidebar } from "@/components/Dashboard/context/SidebarContext";
import { toast } from "sonner";
import axios from "axios";
import { deleteAccount } from "@/lib/auth";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

// ─── Sub-components ──────────────────────────────────────────────────────────

const FuturisticCard = ({
  children,
  title,
  icon: Icon,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  title: string;
  icon: React.ElementType;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    className={`relative group ${className}`}
  >
    <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[28px]" />
    <div className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[28px] p-7 overflow-hidden shadow-sm dark:shadow-none">
      <div className="flex items-center gap-3 mb-7">
        <div className="p-2.5 bg-primary/10 rounded-xl">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-base font-bold tracking-tight text-gray-800 dark:text-white uppercase">
          {title}
        </h3>
      </div>
      {children}
    </div>
  </motion.div>
);

const InputGroup = ({
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  disabled = false,
  placeholder = "",
  error = "",
  rightSlot,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
  rightSlot?: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-300">
        <Icon className="w-4 h-4" />
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full bg-gray-50 dark:bg-gray-800 border ${error
          ? "border-red-400 dark:border-red-500 focus:ring-red-400/20"
          : "border-gray-200 dark:border-gray-700 focus:ring-primary/20 focus:border-primary/50"
          } rounded-2xl py-3.5 pl-11 pr-${rightSlot ? "12" : "4"} text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
      />
      {rightSlot && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightSlot}</div>
      )}
    </div>
    {error && (
      <p className="text-xs text-red-500 pl-1 flex items-center gap-1">
        <CircleAlert className="w-3 h-3 shrink-0" />
        {error}
      </p>
    )}
  </div>
);

const StatRow = ({
  label,
  value,
  color = "text-gray-700 dark:text-gray-200",
}: {
  label: string;
  value: string;
  color?: string;
}) => (
  <div className="flex justify-between items-center group py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-primary transition-colors cursor-default">
      {label}
    </span>
    <span className={`text-sm font-bold font-mono ${color}`}>{value}</span>
  </div>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function roleColor(role?: string) {
  if (role === "superadmin") return "bg-purple-500";
  if (role === "admin") return "bg-amber-400";
  return "bg-emerald-400";
}

// ─── Main component ───────────────────────────────────────────────────────────

const ProfileSkeleton = () => (
  <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-pulse">
    {/* Hero Skeleton */}
    <div className="relative py-10 flex flex-col items-center">
      <div className="w-36 h-36 rounded-[40px] bg-gray-200 dark:bg-gray-800 mb-6" />
      <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full mb-4" />
      <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-xl mb-2 mt-2" />
      <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded-lg mb-2" />
      <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded-lg" />
    </div>

    {/* Grid Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left col */}
      <div className="lg:col-span-7 space-y-8">
        <div className="bg-white/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-[28px] p-7 h-[280px]" />
        <div className="bg-white/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-[28px] p-7 h-[380px]" />
      </div>
      {/* Right col */}
      <div className="lg:col-span-5 space-y-8">
        <div className="bg-white/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-[28px] p-7 h-[250px]" />
        <div className="bg-white/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-[28px] p-7 h-[300px]" />
      </div>
    </div>
  </div>
);

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  locale,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  locale: string;
}) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] overflow-hidden shadow-2xl"
        >
          {/* Header decoration */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500" />
          
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                {locale === "fr" ? "Suppression du compte" : "Account Deletion"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                {locale === "fr"
                  ? "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et votre accès sera immédiatement révoqué."
                  : "Are you sure you want to delete your account? This action is irreversible and your access will be immediately revoked."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <button
                onClick={onClose}
                className="px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              >
                {locale === "fr" ? "Annuler" : "Cancel"}
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="group relative px-6 py-3.5 bg-red-600 text-white text-sm font-bold rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>{locale === "fr" ? "Confirmer" : "Confirm"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default function ProfilePage() {
  const { user: sessionUser } = useSidebar();
  const locale = useLocale();
  const router = useRouter();

  // ── Profile state ──
  const [profile, setProfile] = useState({
    id: sessionUser?.id ?? null,
    name: sessionUser?.name ?? "",
    email: sessionUser?.email ?? "",
    role: sessionUser?.role ?? "user",
    avatar: sessionUser?.avatar ?? null as string | null,
    email_verified_at: null as string | null,
    created_at: null as string | null,
    updated_at: null as string | null,
  });
  const [profileForm, setProfileForm] = useState({ name: sessionUser?.name || "" });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // ── Hydration safety ──
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    setProfileForm({ name: sessionUser?.name || "" });
  }, [sessionUser]);

  // ── Avatar state ──
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // ── Password state ──
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // ── Fetch fresh profile ──
  const fetchProfile = useCallback(async () => {
    setIsLoadingProfile(true);
    try {
      const res = await axios.get("/api/profile");
      const data = res.data.data;
      setProfile(data);
      setProfileForm({ name: data.name });
    } catch {
      toast.error("Impossible de charger le profil.");
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ── Update profile ──
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return;
    setIsSavingProfile(true);
    try {
      const res = await axios.post("/api/profile", { name: profileForm.name.trim() });
      const updated = res.data.data;
      setProfile((prev) => ({ ...prev, ...updated }));
      toast.success("Profil mis à jour avec succès.");
    } catch {
      toast.error("Échec de la mise à jour du profil.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ── Upload Avatar ──
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 4 Mo.");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await axios.post("/api/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.avatar) {
        setProfile((prev) => ({ ...prev, avatar: res.data.avatar }));
        toast.success("Avatar mis à jour avec succès.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de la mise à jour de l'avatar.");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // ── Change password ──
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});

    if (passwordForm.password !== passwordForm.password_confirmation) {
      setPasswordErrors({ password_confirmation: "Les mots de passe ne correspondent pas." });
      return;
    }
    if (passwordForm.password.length < 8) {
      setPasswordErrors({ password: "Le mot de passe doit contenir au moins 8 caractères." });
      return;
    }

    setIsSavingPassword(true);
    try {
      await axios.post("/api/profile/password", passwordForm);
      toast.success("Mot de passe changé avec succès.");
      setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
    } catch (err: any) {
      const apiErrors = err.response?.data?.errors ?? {};
      const apiMessage = err.response?.data?.error ?? "";
      if (Object.keys(apiErrors).length > 0) {
        const mapped: Record<string, string> = {};
        Object.entries(apiErrors).forEach(([k, v]) => {
          mapped[k] = Array.isArray(v) ? v[0] : String(v);
        });
        setPasswordErrors(mapped);
      } else {
        toast.error(apiMessage || "Échec du changement de mot de passe.");
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAccount();
      if (result.success) {
        setIsDeleteModalOpen(false);
        toast.success(
          locale === "fr"
            ? "Votre compte a été supprimé."
            : "Your account has been deleted."
        );
        router.push(`/${locale}/login`);
      } else {
        toast.error(result.message || "Erreur lors de la suppression du compte.");
      }
    } catch {
      toast.error("Une erreur est survenue.");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleShow = (field: keyof typeof showPasswords) =>
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));

  if (isLoadingProfile) return <ProfileSkeleton />;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">

      {/* ── Hero ── */}
      <div className="relative py-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotateY: 90 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-36 h-36 mb-8"
        >
          <div className="absolute inset-0 bg-primary/20 rounded-[40px] animate-pulse blur-2xl" />
          <div
            className="relative w-full h-full bg-gray-100 dark:bg-gray-800 rounded-[40px] border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            {isLoadingProfile || isUploadingAvatar ? (
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            ) : profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
            ) : (
              <User className="w-14 h-14 text-gray-400 dark:text-gray-500" strokeWidth={1.2} />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/jpeg, image/png, image/webp, image/gif"
            className="hidden"
          />

          {/* Role badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 bg-white dark:bg-gray-800 shadow-xl rounded-full border border-gray-100 dark:border-gray-700"
          >
            <div className={`w-2 h-2 rounded-full animate-pulse ${roleColor(profile.role)}`} />
            <span className="text-[10px] font-black uppercase tracking-tight text-gray-500 dark:text-gray-400">
              {profile.role}
            </span>
          </motion.div>
        </motion.div>

        <div className="text-center space-y-1 mt-2">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight uppercase"
          >
            {profile.name || "—"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-gray-400 font-mono text-xs tracking-widest"
          >
            {profile.email}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 font-mono text-xs tracking-widest"
          >
            ID #{String(profile.id ?? "").padStart(6, "0")}
          </motion.p>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left column */}
        <div className="lg:col-span-7 space-y-8">

          {/* ── Profile form ── */}
          <FuturisticCard title="Informations personnelles" icon={Settings} delay={0.1}>
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputGroup
                  label="Nom d'affichage"
                  icon={User}
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ name: e.target.value })}
                  placeholder="Votre nom"
                />
                <InputGroup
                  label="Adresse e-mail"
                  icon={Mail}
                  value={profile.email}
                  disabled
                  placeholder="email@exemple.com"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-gray-400 font-mono">
                  Dernière mise à jour : {isMounted ? formatDate(profile.updated_at) : "—"}
                </p>
                <button
                  type="submit"
                  disabled={isSavingProfile || profileForm.name.trim() === ""}
                  className="group relative px-7 py-3 bg-primary text-white text-sm font-bold rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSavingProfile ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {isSavingProfile ? "Enregistrement..." : "Sauvegarder"}
                </button>
              </div>
            </form>
          </FuturisticCard>

          {/* ── Password form ── */}
          <FuturisticCard title="Changer le mot de passe" icon={KeyRound} delay={0.2}>
            <form onSubmit={handleChangePassword} className="space-y-5">
              <InputGroup
                label="Mot de passe actuel"
                icon={Lock}
                type={showPasswords.current ? "text" : "password"}
                value={passwordForm.current_password}
                onChange={(e) =>
                  setPasswordForm((f) => ({ ...f, current_password: e.target.value }))
                }
                error={passwordErrors.current_password}
                placeholder="••••••••"
                rightSlot={
                  <button
                    type="button"
                    onClick={() => toggleShow("current")}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputGroup
                  label="Nouveau mot de passe"
                  icon={Lock}
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordForm.password}
                  onChange={(e) =>
                    setPasswordForm((f) => ({ ...f, password: e.target.value }))
                  }
                  error={passwordErrors.password}
                  placeholder="Min. 8 caractères"
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => toggleShow("new")}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
                <InputGroup
                  label="Confirmer le mot de passe"
                  icon={Lock}
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordForm.password_confirmation}
                  onChange={(e) =>
                    setPasswordForm((f) => ({ ...f, password_confirmation: e.target.value }))
                  }
                  error={passwordErrors.password_confirmation}
                  placeholder="••••••••"
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => toggleShow("confirm")}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              </div>

              {/* Password strength indicator */}
              {passwordForm.password && (
                <div className="space-y-1.5">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((lvl) => {
                      const len = passwordForm.password.length;
                      const hasSpecial = /[!@#$%^&*]/.test(passwordForm.password);
                      const hasUpper = /[A-Z]/.test(passwordForm.password);
                      const strength =
                        len >= 12 && hasSpecial && hasUpper ? 4
                          : len >= 10 && (hasSpecial || hasUpper) ? 3
                            : len >= 8 ? 2
                              : 1;
                      return (
                        <div
                          key={lvl}
                          className={`h-1 flex-1 rounded-full transition-all duration-500 ${lvl <= strength
                            ? strength === 1 ? "bg-red-400"
                              : strength === 2 ? "bg-amber-400"
                                : strength === 3 ? "bg-blue-400"
                                  : "bg-emerald-400"
                            : "bg-gray-200 dark:bg-gray-700"
                            }`}
                        />
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-gray-400">
                    {passwordForm.password.length < 8
                      ? "Trop court"
                      : /[!@#$%^&*]/.test(passwordForm.password) && /[A-Z]/.test(passwordForm.password) && passwordForm.password.length >= 12
                        ? "Très sécurisé"
                        : passwordForm.password.length >= 10
                          ? "Robuste"
                          : "Acceptable — ajoutez des majuscules et caractères spéciaux"}
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={
                    isSavingPassword ||
                    !passwordForm.current_password ||
                    !passwordForm.password ||
                    !passwordForm.password_confirmation
                  }
                  className="group px-7 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSavingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  {isSavingPassword ? "Mise à jour..." : "Changer le mot de passe"}
                </button>
              </div>
            </form>
          </FuturisticCard>
        </div>

        {/* Right column */}
        <div className="lg:col-span-5 space-y-8">

          {/* ── Account info ── */}
          <FuturisticCard title="Informations du compte" icon={Activity} delay={0.15}>
            <div className="space-y-0">
              <StatRow
                label="Rôle"
                value={profile.role?.toUpperCase() ?? "—"}
                color={
                  profile.role === "superadmin"
                    ? "text-purple-500"
                    : profile.role === "admin"
                      ? "text-amber-500"
                      : "text-emerald-500"
                }
              />
              <StatRow
                label="Email vérifié"
                value={profile.email_verified_at ? "OUI" : "NON"}
                color={profile.email_verified_at ? "text-emerald-500" : "text-red-400"}
              />
              <StatRow
                label="Membre depuis"
                value={isMounted ? formatDate(profile.created_at) : "—"}
              />
              <StatRow
                label="Dernière modification"
                value={isMounted ? formatDate(profile.updated_at) : "—"}
              />
              <StatRow
                label="Identifiant"
                value={`#${String(profile.id ?? "").padStart(6, "0")}`}
              />
            </div>
          </FuturisticCard>

          {/* ── Security status ── */}
          <FuturisticCard title="Sécurité du compte" icon={Shield} delay={0.25}>
            <div className="space-y-4">
              {/* Email verified */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                {profile.email_verified_at ? (
                  <BadgeCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <CircleAlert className="w-5 h-5 text-amber-500 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-200">
                    {profile.email_verified_at
                      ? "E-mail vérifié"
                      : "E-mail non vérifié"}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {profile.email_verified_at && isMounted
                      ? `Vérifié le ${formatDate(profile.email_verified_at)}`
                      : !profile.email_verified_at
                        ? "Vérifiez votre boîte de réception"
                        : "—"}
                  </p>
                </div>
              </div>

              {/* Account active */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <UserCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-200">
                    Compte actif
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Authentifié via JWT
                  </p>
                </div>
              </div>

              {/* Password security tip */}
              <div className="p-4 bg-primary/5 dark:bg-primary/10 border border-primary/10 rounded-2xl">
                <p className="text-[10px] text-primary/80 font-bold uppercase tracking-widest mb-1">
                  Conseil sécurité
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Utilisez un mot de passe unique d'au moins 12 caractères avec des majuscules, chiffres et symboles.
                </p>
              </div>
            </div>
          </FuturisticCard>

        </div>
      </div>

      {/* ── Danger Zone ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-8"
      >
        <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/50 rounded-[28px] p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Trash2 className="w-32 h-32 text-red-500" />
          </div>
          <div className="relative space-y-2 text-center md:text-left">
            <h3 className="text-xl font-black text-red-600 dark:text-red-400 uppercase tracking-tight">
              {locale === "fr" ? "Zone de danger" : "Danger Zone"}
            </h3>
            <p className="text-sm text-red-700/60 dark:text-red-400/60 max-w-xl font-medium">
              {locale === "fr"
                ? "La suppression de votre compte entraînera la désactivation immédiate de votre accès. Vos données seront conservées conformément à nos politiques de rétention avant suppression définitive."
                : "Deleting your account will immediately deactivate your access. Your data will be retained in accordance with our retention policies before final deletion."}
            </p>
          </div>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isDeleting}
            className="relative px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-sm font-black rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 uppercase tracking-wide shrink-0"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {isDeleting
              ? (locale === "fr" ? "Suppression..." : "Deleting...")
              : (locale === "fr" ? "Supprimer mon compte" : "Delete my account")}
          </button>
        </div>
      </motion.div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeleting}
        locale={locale}
      />
    </div>
  );
}
