import AdminLayout from "@/components/Dashboard/AdminLayout";
import AnalyticsDashboard from "@/components/umami/AnalyticsDashboard";

export default function ContactsAdminPage() {
    return (
        <AdminLayout>
            <div className="p-6 md:p-12">
                <AnalyticsDashboard />
            </div>
        </AdminLayout>
    );
}
