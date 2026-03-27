import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LogoutButton } from "@/components/logout-button";

export default async function ProfilePage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const user = session.user;

    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-3xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid gap-2">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Full Name
                            </h3>
                            <p className="text-lg font-semibold">{user.name || "N/A"}</p>
                        </div>
                        <Separator />
                        <div className="grid gap-2">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Email Address
                            </h3>
                            <p className="text-lg font-semibold">{user.email}</p>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <LogoutButton />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
