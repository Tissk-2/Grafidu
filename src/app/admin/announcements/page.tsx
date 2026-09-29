import AnnouncementsManager from "@/components/client/announcements-manager";

export const metadata = {
  title: "Pengumuman Sekolah — Grafidu Admin",
};

export default function AdminAnnouncementsPage() {
  return <AnnouncementsManager role="admin" />;
}
