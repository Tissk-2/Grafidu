import { redirect } from "next/navigation";
import { dummyGuruData } from "@/lib/guru-demo";

/**
 * The dashboard is per-class, so `/teacher/home` just forwards to the first
 * class. Links in auth.ts / auth-form.tsx keep working unchanged.
 */
export default function TeacherHomePage() {
  redirect(`/teacher/home/${dummyGuruData.dataKelas[0].id}`);
}
