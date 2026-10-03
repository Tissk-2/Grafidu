"use client";

import { useState } from "react";
import Link from "next/link";

export default function ViewTabs() {
  const [view, setView] = useState<"student" | "teacher">("student");

  return (
    <>
      <div className="viewtabs reveal">
        <button
          className={"viewtab" + (view === "student" ? " on" : "")}
          onClick={() => setView("student")}
        >
          Sisi siswa
        </button>
        <button
          className={"viewtab" + (view === "teacher" ? " on" : "")}
          onClick={() => setView("teacher")}
        >
          Sisi guru
        </button>
      </div>

      {/* student panel */}
      <div
        className="view-panel reveal"
        id="panel-student"
        data-delay="1"
        style={{ display: view === "student" ? "" : "none" }}
      >
        <div className="view-copy">
          <span className="label-caps">Siswa</span>
          <h2>
            Lebih sedikit menebak.
            <br />
            Lebih banyak
            <br />
            <span className="accent u">latihan terfokus</span>.
          </h2>
          <p>
            Siswa melihat progres per mapel, mendapat rekomendasi berbasis area lemah, dan bisa
            mengubah materi guru menjadi latihan pribadi.
          </p>
          <Link className="btn btn-outline" href="/student/home">
            Jelajahi sisi siswa
          </Link>
        </div>
        <div className="overview-box">
          <div className="ov-left">
            <div className="ov-head">
              <span>Ringkasan belajarku</span>
              <span>Agustus 2026</span>
            </div>
            <div className="ov-score">87</div>
            <div className="ov-sub">rata-rata nilai / 100</div>
            <div className="ov-bars">
              <div className="ov-bar">
                <span>Matematika</span>
                <span className="track">
                  <i style={{ width: "80%" }}></i>
                </span>
                <span className="val">80</span>
              </div>
              <div className="ov-bar">
                <span>Fisika</span>
                <span className="track">
                  <i style={{ width: "72%" }}></i>
                </span>
                <span className="val">72</span>
              </div>
              <div className="ov-bar">
                <span>Biologi</span>
                <span className="track">
                  <i style={{ width: "69%" }}></i>
                </span>
                <span className="val">69</span>
              </div>
              <div className="ov-bar">
                <span>Informatika</span>
                <span className="track">
                  <i style={{ width: "95%" }}></i>
                </span>
                <span className="val">95</span>
              </div>
            </div>
          </div>
          <div className="ov-right">
            <div className="ov-mini">
              <b>3</b>
              <span>mapel lemah untuk ditinjau</span>
            </div>
            <div className="ov-mini">
              <b>8</b>
              <span>tugas baru</span>
            </div>
            <div className="ov-mini ov-note">
              AI menyarankan review Seni Budaya singkat sebelum kuis berikutnya.
            </div>
          </div>
        </div>
      </div>

      {/* teacher panel */}
      <div
        className="view-panel reveal"
        id="panel-teacher"
        data-delay="1"
        style={{ display: view === "teacher" ? "" : "none" }}
      >
        <div className="view-copy">
          <span className="label-caps">Guru</span>
          <h2>
            Lihat kelas
            <br />
            dengan jelas. Rencanakan
            <br />
            <span className="accent u">langkah berikutnya</span>.
          </h2>
          <p>
            Guru bisa melihat pola kelas, membagikan materi di satu tempat, dan menindaklanjuti
            siswa yang butuh perhatian lebih.
          </p>
          <a className="btn btn-outline" href="#contact">
            Jadwalkan demo untuk guru
          </a>
        </div>
        <div className="overview-box">
          <div className="ov-left">
            <div className="ov-head">
              <span>Ringkasan kelas</span>
              <span>XI RPL A</span>
            </div>
            <div className="ov-score">85</div>
            <div className="ov-sub">rata-rata kelas / 100</div>
            <div className="ov-bars">
              <div className="ov-bar">
                <span>Arfan D.</span>
                <span className="track">
                  <i style={{ width: "98%" }}></i>
                </span>
                <span className="val">98</span>
              </div>
              <div className="ov-bar">
                <span>Gibran R.</span>
                <span className="track">
                  <i style={{ width: "95%" }}></i>
                </span>
                <span className="val">95</span>
              </div>
              <div className="ov-bar">
                <span>Bima S.</span>
                <span className="track">
                  <i style={{ width: "72%" }}></i>
                </span>
                <span className="val">72</span>
              </div>
              <div className="ov-bar">
                <span>Joko P.</span>
                <span className="track">
                  <i style={{ width: "29%" }}></i>
                </span>
                <span className="val">29</span>
              </div>
            </div>
          </div>
          <div className="ov-right">
            <div className="ov-mini">
              <b>27/32</b>
              <span>pengumpulan terkumpul</span>
            </div>
            <div className="ov-mini">
              <b>5</b>
              <span>siswa perlu ditindaklanjuti</span>
            </div>
            <div className="ov-mini ov-note">
              AI menyiapkan kuis tambahan agar Joko bisa menyusul.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
