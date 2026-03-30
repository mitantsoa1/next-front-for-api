import AnalyticsDashboard from "@/components/umami/AnalyticsDashboard";

export default function ContactsAdminPage() {
    return (
        <div className="p-6 md:p-12">
            {/* <AnalyticsDashboard /> */}

            <div className="flex items-center justify-center flex-col mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Analytics
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Etapes à faire
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <ol>
                        <li>
                            Decommenter AnalyticsDashboard dans ce fichier
                        </li>
                        <li>
                            Ajouter les clés API dans le fichier .env:
                            <br />
                            - UMAMI_URL=https://api.umami.is/v1
                            <br />
                            - UMAMI_TOKEN=api_JdJY2pntg1PvvU6xFPPeGp4wATPYU5Ra
                            <br />
                            - UMAMI_WEBSITE_ID=ce2a1d66-bf61-4938-b9ce-5b080a10e5b5
                        </li>
                        <li>
                            Ajouter <br />
                            &lt;script defer src="https://cloud.umami.is/script.js" data-website-id="ce2a1d66-bf61-4938-b9ce-5b080a10e5b5"&gt;&lt;/script&gt;
                            <br />
                            dans le fichier RootLayout app/layout.tsx
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
