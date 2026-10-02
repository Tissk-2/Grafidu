import TeacherClassHome from "@/app/teacher/teacher-class-home";

/**
 * Kelas kini uuid dari database — tidak bisa lagi di-enumerate statis lewat
 * generateStaticParams. Halaman tetap sinkron: client membaca :id dari URL
 * (useRoutedClass) dan menukar data dari shell context tanpa menunggu apa pun.
 * :id yang tidak ada di amanah guru jatuh kembali ke kelas aktif.
 */
export default function TeacherClassHomePage() {
  return <TeacherClassHome />;
}
