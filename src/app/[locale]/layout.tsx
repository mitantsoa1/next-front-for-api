
import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
// import { ThemeProvider } from "@/providers/theme-provider";
// import { QueryProvider } from "@/providers/query-provider";

import { Toaster } from "@/components/ui/sonner";

const locales = ['en', 'fr'];

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}
export default async function AppLayout({
  children,
  params
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  return (
    // <ThemeProvider
    //   attribute="class"
    //   defaultTheme="light"
    //   enableSystem={false}
    //   disableTransitionOnChange
    // >
    //   <QueryProvider>
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
      <Toaster />
    </NextIntlClientProvider>
    //   </QueryProvider>
    // </ThemeProvider>
  );
}
