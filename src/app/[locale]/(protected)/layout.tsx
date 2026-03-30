import { SidebarProvider } from "@/components/Dashboard/context/SidebarContext";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminLayout from "@/components/Dashboard/AdminLayout";

const ProtectedLayout = async ({ children }: { children: React.ReactNode }) => {
    const session = await getSession("session");
    if (!session) {
        redirect("/login");
    }
    return (
        <SidebarProvider user={session.user}>
            <AdminLayout>{children}</AdminLayout>
        </SidebarProvider>
    )
}

export default ProtectedLayout