import { notFound } from "next/navigation";
import { findClass } from "@/lib/guru-demo";
import TeacherClassHome from "./teacher-class-home";

/**
 * Resolves the class before rendering so an unknown id returns a real 404.
 * (`notFound()` inside the client component below would still stream a 200.)
 */
export default async function TeacherClassHomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kelas = findClass(Number(id));
  if (!kelas) notFound();
  return <TeacherClassHome kelas={kelas} />;
}
