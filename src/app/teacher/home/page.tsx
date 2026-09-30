import TeacherClassHome from "@/app/teacher/teacher-class-home";

/**
 * Safety net for /teacher/home.
 *
 * The actual redirect to /teacher/home/1 lives in next.config.ts, because the
 * teacher layout renders the shell immediately and would flush a 200 before a
 * page-level redirect() could become a 307. That rule should always match, but
 * if it is ever bypassed this still renders a working dashboard — useRoutedClass
 * falls back to the first class when there is no :id in the URL.
 */
export default function TeacherHomePage() {
  return <TeacherClassHome />;
}
