import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InviteCodeGenerator } from "@/components/admin/invite-code-generator";

export default async function AdminInviteCodesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Invite Code Manager</h1>
          <p className="text-muted-foreground mt-2">
            Generate and manage invite codes for your workspace
          </p>
        </div>
        <InviteCodeGenerator />
      </div>
    </div>
  );
}
