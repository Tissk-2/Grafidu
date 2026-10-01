import Image from "next/image";
import Link from "next/link";
import BodySync from "@/components/body-sync";
import NavHeader from "@/components/landing/nav-header";
import ViewTabs from "@/components/landing/view-tabs";
import SiteFooter from "@/components/landing/footer";
import ScrollReveal from "@/components/landing/scroll-reveal";
import { transform } from "next/dist/build/swc";

export default function LandingPage() {
  return (
    <>
      <BodySync className="landing" />
      <ScrollReveal />
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      {/* ============ NAV ============ */}
      <NavHeader />

      {/* ============ HERO ============ */}
      <section className="hero overflow-hidden pt-24 lg:pt-24 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 max-w-[1200px] mx-auto px-6 lg:px-10 items-center">
          <div>
            <div className="eyebrow">A clearer way to learn</div>
            <h1>
              Know where
              <br />
              you are.
              <span className="accent">Know what to do next.</span>
            </h1>
            <div className="hero-rule"></div>
            <p className="lead">
              Grafidu connects grades, teacher materials, assignments, and AI recommendations so
              students can act on weak areas — and teachers can see what the class needs.
            </p>
            <div className="hero-ctas">
              <Link className="btn btn-primary" href="/signup">
                Start with Grafidu
              </Link>
              <a className="btn btn-outline" href="#platform">
                See how it works
              </a>
            </div>
            <div className="hero-note">
              For students, teachers, and the people who support them.
            </div>
          </div>
          <div className="flex justify-center" aria-hidden="true">
            <Image
              className="max-w-full h-auto lg:scale-[1.6] lg:translate-x-[60px]"
              src="/assets/hero-left.png"
              width={2704}
              height={1806}
              alt="Preview dashboard"
            ></Image>
          </div>
        </div>
      </section>

      {/* ============ STRIP ============ */}
      <div className="strip">
        <div className="container strip-inner">
          <span className="l">Learning data should lead somewhere.</span>
          <span className="r">Grafidu turns “my score is low” into a practical next step.</span>
        </div>
      </div>

      {/* ============ PLATFORM ============ */}
      <section className="section" id="platform">
        <div className="container">
          <div className="sec-head reveal">
            <h2>
              Everything revolves around
              <br />
              one question:
              <br />
              <span className="accent u">what needs attention?</span>
            </h2>
            <p>
              No maze of menus. No pile of disconnected tools. Grafidu puts the useful parts of
              schoolwork in one place and keeps the path forward visible.
            </p>
            <span className="label-caps sec-label">The Platform</span>
          </div>
          <div className="rows reveal">
            <div className="row-item">
              <span className="num">01</span>
              <h3>Track the details</h3>
              <p>
                Students can enter results by subject and build a simple history of where their
                performance changes over time.
              </p>
              <span className="row-icon">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </span>
            </div>
            <div className="row-item">
              <span className="num">02</span>
              <h3>Keep classwork close</h3>
              <p>
                Teachers share materials and tasks directly. Students get one place to find what
                they are supposed to learn.
              </p>
              <span className="row-icon">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </span>
            </div>
            <div className="row-item">
              <span className="num">03</span>
              <h3>Ask the AI for a plan</h3>
              <p>
                When results show a weak area, Grafidu can turn it into a study plan or a quiz based
                on the material provided by the teacher.
              </p>
              <span className="row-icon">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </span>
            </div>
            <div className="row-item">
              <span className="num">04</span>
              <h3>See the class clearly</h3>
              <p>
                Teachers can spot class-wide patterns, unfinished work, and students who may need a
                closer look without manually stitching the data together.
              </p>
              <span className="row-icon">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ GRADES BAND ============ */}
      <section className="grades-band" id="students">
        <div className="container grades-grid">
          <div className="grade-card reveal">
            <div className="grade-card-head">
              <b>Jessie Cooper · XI RPL B</b>
              <span>Current grades</span>
            </div>
            <div className="grade-row">
              <span>Matematika</span>
              <span className="score">80</span>
              <span className="pill pill-green">Above average</span>
            </div>
            <div className="grade-row">
              <span>Fisika</span>
              <span className="score">72</span>
              <span className="pill pill-red">Needs work</span>
            </div>
            <div className="grade-row">
              <span>Biologi</span>
              <span className="score">69</span>
              <span className="pill pill-red">Needs work</span>
            </div>
            <div className="grade-row">
              <span>Informatika</span>
              <span className="score">95</span>
              <span className="pill pill-green">Above average</span>
            </div>
            <div className="grade-row" style={{ borderBottom: "none" }}>
              <span>Seni Budaya</span>
              <span className="score">65</span>
              <span className="pill pill-red">Needs work</span>
            </div>
            <div className="grade-note">Focus on Seni Budaya first, then continue with Fisika.</div>
          </div>
          <div className="grades-copy reveal" data-delay="1">
            <span className="label-caps">For Students</span>
            <h2>
              Your grades
              <br />
              become a <span className="accent u">map</span>.
            </h2>
            <p>
              A low score shouldn’t be the end of the story. Grafidu helps connect that score to
              materials, practice, and a next session of focused study.
            </p>
            <ul className="grades-list">
              <li>
                <span className="n">01</span>
                <span>See which subjects are falling behind.</span>
              </li>
              <li>
                <span className="n">02</span>
                <span>Open the teacher’s material without hunting for it.</span>
              </li>
              <li>
                <span className="n">03</span>
                <span>Generate a realistic study plan instead of an overwhelming to-do list.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ============ VIEWS TABS ============ */}
      <section className="section" id="teachers" style={{ paddingTop: 96 }}>
        <div className="container">
          <ViewTabs />
        </div>
      </section>

      {/* ============ AI SECTION ============ */}
      <section className="section" id="ai">
        <div className="container">
          <div className="sec-head reveal">
            <h2>
              Not “AI for AI’s sake.” Just a
              <br />
              better <span className="accent u">next step</span>.
            </h2>
            <p>
              Grafidu’s useful moment is not the chatbot. It is the connection between a student’s
              actual results and the material a teacher has already shared.
            </p>
            <span className="label-caps sec-label">AI, with context</span>
          </div>
          <div className="rows reveal" data-delay="1">
            <div className="row-item">
              <span className="num">01</span>
              <h3>Recommend</h3>
              <p>
                “Seni Budaya is your weakest subject right now.” The recommendation starts with
                something concrete.
              </p>
              <span className="row-icon">
                <span className="ai-txt">AI</span>
              </span>
            </div>
            <div className="row-item">
              <span className="num">02</span>
              <h3>Plan</h3>
              <p>
                Turn that gap into a manageable routine: what to review, how long to study, and what
                to do next.
              </p>
              <span className="row-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </div>
            <div className="row-item">
              <span className="num">03</span>
              <h3>Practice</h3>
              <p>
                Generate a quiz from the teacher’s material so practice stays tied to what is
                actually being taught.
              </p>
              <span className="row-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PROOF STRIP ============ */}
      <div className="strip">
        <div className="container strip-inner">
          <span className="l">
            <strong>12 schools</strong> across Indonesia run on Grafidu.
          </span>
          <span className="r">
            &ldquo;Grades and tasks finally live in one place.&rdquo; &mdash; Bu Septi Retno, Math
            Teacher
          </span>
        </div>
      </div>

      {/* ============ START CTA ============ */}
      <section className="start">
        <div className="container">
          <div className="start-grid reveal">
            <div>
              <span className="label-caps">Start Here</span>
              <h2>
                Make the next study session
                <br />
                <span className="accent u">count</span>.
              </h2>
              <p className="lead">
                Grafidu is built around a simple idea: academic data is useful when somebody can act
                on it. Give students direction and teachers visibility.
              </p>
              <div className="start-ctas">
                <Link className="btn btn-primary" href="/signup">
                  Start with Grafidu
                </Link>
                <a className="btn btn-outline" href="#platform">
                  Read the platform overview
                </a>
              </div>
            </div>
            <p className="start-note">
              Designed for the everyday reality of school: many subjects, many tasks, and not enough
              time to figure out what matters first.
            </p>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <SiteFooter />
    </>
  );
}
