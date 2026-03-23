# Guide d'Intégration du Dashboard (Mis à jour)

Ce guide vous expliquera comment intégrer les composants de l'interface utilisateur du dashboard, en supposant que le dossier `Dashboard` a été placé dans `src/components`.

## Prérequis

Avant de commencer, assurez-vous que votre nouveau projet respecte les points suivants :

-   **Next.js** (version 14 ou supérieure recommandée)
-   **TypeScript**
-   **Tailwind CSS** (version 4 ou supérieure)

---

## Étape 1: Placer le dossier `Dashboard`

1.  Placez le dossier `Dashboard` que vous avez récupéré directement à l'intérieur du dossier `src/components` de votre nouveau projet.
2.  La structure devrait ressembler à ceci : `src/components/Dashboard/...`.

---

## Étape 2: Installer les Dépendances

Le dashboard dépend de plusieurs bibliothèques. Ouvrez votre terminal et exécutez les commandes suivantes pour les installer :

**Dépendance de développement (pour les SVGs) :**

```bash
npm install @svgr/webpack --save-dev
```

**Dépendances principales :**

```bash
npm install apexcharts react-apexcharts flatpickr tailwind-merge
```

**Note :** D'autres dépendances peuvent être nécessaires. Gardez un œil sur les erreurs de compilation pour identifier les paquets manquants.

---

## Étape 3: Configurer `next.config.ts` pour les SVGs

Modifiez votre fichier `next.config.ts` pour y ajouter la configuration `webpack` permettant de traiter les SVGs :

```javascript
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },

  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

```

---

## Étape 6: Mettre à Jour le Layout Principal (`src/app/layout.tsx`)

Pour que les contextes fonctionnent, modifiez votre layout principal `src/app/layout.tsx` pour y inclure les `Providers`. Notez les chemins d'import mis à jour :

```tsx
import { SidebarProvider } from "@/components/Dashboard/context/SidebarContext";
import { ThemeProvider } from "@/components/Dashboard/context/ThemeContext";
...

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## Étape 7: Utiliser le Layout du Dashboard

Maintenant, vous pouvez utiliser le `AdminLayout`. Créez une nouvelle page, par exemple `src/app/dashboard/page.tsx`, et utilisez le layout comme ceci, avec les chemins d'import mis à jour (il faut mettre à jour aussi les chemins des images/logo)

```tsx
import React from "react";
import AdminLayout from "@/components/Dashboard/AdminLayout";
import DashboardPageContent from "@/components/Dashboard/page";

export default function MyDashboardPage() {
  return (
    <AdminLayout>
      {/* Vous pouvez mettre ici le contenu de votre propre page */}
      {/* Ou utiliser le contenu d'exemple fourni */}
      <DashboardPageContent />
    </AdminLayout>
  );
}
```

---