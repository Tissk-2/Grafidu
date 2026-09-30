import { dummyGuruData } from "@/lib/guru-demo";
import TeacherClassHome from "@/app/teacher/teacher-class-home";

/**
 * Only the demo classes are valid routes — anything else 404s here, which is
 * what lets this page stay synchronous (see below).
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return dummyGuruData.dataKelas.map((c) => ({ id: String(c.id) }));
}

/**
 * Deliberately NOT async. An `async` page awaits `params`, so every class
 * switch suspends the segment and blanks the page. The class data lives in a
 * static module, so there is nothing to fetch — the client reads the id off
 * the URL and swaps the data in place instead.
 */
export default function TeacherClassHomePage() {
  return <TeacherClassHome />;
}
