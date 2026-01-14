import { createClient } from "@/app/utils/supabase/server";
import DashboardContent from "@/components/dashboard/DashboardContent";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get first name for welcome message
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || "Developer";

  return (
    <DashboardContent firstName={firstName} />
  );
}