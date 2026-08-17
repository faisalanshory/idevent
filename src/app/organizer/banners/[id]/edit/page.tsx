import { db } from "@/lib/db";
import { getSession, getOrganizerAccess } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BannerForm } from "../../banner-form";

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const organizer = await getOrganizerAccess(session.id);
  if (!organizer) redirect("/login");

  const banner = await db.banner.findUnique({
    where: { id, organizerId: organizer.id },
  });

  if (!banner) redirect("/organizer/banners");

  return <BannerForm initialBanner={banner as any} />;
}
