import { redirect } from "next/navigation";
import { getRole } from "@/lib/session";

export default async function RootPage() {
  const role = await getRole();

  if (role === "admin") redirect("/admin/dashboard");
  if (role === "tenant") redirect("/dashboard");

  redirect("/login");
}
