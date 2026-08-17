import { getSession, getOrganizerAccess } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BannerForm } from "../banner-form";

export default async function NewBannerPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const organizer = await getOrganizerAccess(session.id);
  if (!organizer) redirect("/login");

  return <BannerForm />;
}
