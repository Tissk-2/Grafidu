import TeacherClassHome from "@/app/teacher/teacher-class-home";

/**
 * /teacher/home tanpa :id tetap sah: useRoutedClass memakai kelas aktif dari
 * shell context (url /teacher/home/[id] tetap menang bila ada).
 */
export default function TeacherHomePage() {
  return <TeacherClassHome />;
}
