import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { FaBook, FaGraduationCap, FaStar, FaFire, FaLaptopCode, FaPalette, FaChartBar, FaBullhorn } from "react-icons/fa";
import { FiChevronRight, FiSearch, FiAward } from "react-icons/fi";
import { coursesApi, type Course } from "../../../api/courses.api";
import { BottomNav } from "../../components/ui/Layout";

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0, transition: { duration: 0.28 } } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

const CATEGORIES = [
  { name: "Programming", Icon: FaLaptopCode, accent: "#6366f1", bg: "rgba(99,102,241,0.1)"  },
  { name: "Design",      Icon: FaPalette,    accent: "#ec4899", bg: "rgba(236,72,153,0.1)"  },
  { name: "Business",    Icon: FaChartBar,   accent: "#10b981", bg: "rgba(16,185,129,0.1)"  },
  { name: "Marketing",   Icon: FaBullhorn,   accent: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
];

export default function Learn() {
  const { data: coursesRes, isLoading } = useQuery({
    queryKey: ["courses", "featured"],
    queryFn: () => coursesApi.getCourses({ isFeatured: true, limit: 6 }).then((r) => r.data),
    staleTime: 60_000,
  });
  const { data: enrollments } = useQuery({
    queryKey: ["courses", "my-enrollments"],
    queryFn: () => coursesApi.getUserEnrollments().then((r) => r.data),
    staleTime: 30_000,
  });
  const courses = coursesRes?.courses ?? [];

  return (
    <div className="min-h-screen pb-32" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 pt-4 pb-3 backdrop-blur-xl"
        style={{ background: "var(--bg-overlay)", borderBottom: "1px solid var(--border)" }}>
        <div>
          <h1 className="text-lg font-black" style={{ color: "var(--text)" }}>Learn</h1>
          <p className="text-[11px]" style={{ color: "var(--text-3)" }}>Courses & certifications</p>
        </div>
        <button type="button" className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <FiSearch className="text-sm" style={{ color: "var(--text-2)" }} />
        </button>
      </div>

      <motion.div variants={stagger} initial="initial" animate="animate" className="flex flex-col gap-5 px-4 pt-4">

        {/* Hero */}
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl p-5"
          style={{ background: "linear-gradient(135deg,#1e3a8a,#3730a3,#1d4ed8)" }}>
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full blur-3xl" style={{ background: "rgba(99,102,241,0.3)" }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1 text-[10px] font-bold text-blue-200 rounded-full px-2.5 py-0.5"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <FaFire className="text-[8px] text-orange-300" /> 120+ Courses
              </span>
            </div>
            <h2 className="text-lg font-black text-white mb-1">Start Learning Today</h2>
            <p className="text-blue-200 text-xs mb-4">Master in-demand skills with expert instructors</p>
            <button type="button" className="bg-white text-blue-700 font-bold px-4 py-2 rounded-lg text-xs active:scale-95 transition-all shadow-lg">
              Browse Courses
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2.5">
          {[
            { label: "Courses",  value: String(coursesRes?.pagination.total ?? "120+"), accent: "#6366f1" },
            { label: "Enrolled", value: String(enrollments?.length ?? 0),               accent: "#10b981" },
            { label: "Free",     value: "40+",                                           accent: "#f59e0b" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-3 text-center"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p className="text-base font-black" style={{ color: s.accent }}>{s.value}</p>
              <p className="text-[10px]" style={{ color: "var(--text-3)" }}>{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Categories */}
        <motion.div variants={fadeUp} className="flex flex-col gap-3">
          <h3 className="text-sm font-black" style={{ color: "var(--text)" }}>Categories</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {CATEGORIES.map((c) => (
              <button key={c.name} type="button"
                className="flex items-center gap-3 rounded-2xl p-3.5 text-left active:scale-95 transition-all"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: c.bg, border: `1px solid ${c.accent}30` }}>
                  <c.Icon className="text-sm" style={{ color: c.accent }} />
                </div>
                <p className="text-xs font-bold" style={{ color: "var(--text)" }}>{c.name}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Featured Courses */}
        <motion.div variants={fadeUp} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black" style={{ color: "var(--text)" }}>Featured Courses</h3>
            <button type="button" className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#6366f1" }}>
              See all <FiChevronRight className="text-[10px]" />
            </button>
          </div>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "var(--bg-card)" }} />
            ))
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 rounded-2xl"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <FaBook className="text-3xl" style={{ color: "var(--text-3)" }} />
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>No courses yet</p>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>Check back soon</p>
            </div>
          ) : (
            courses.map((course: Course) => (
              <button key={course.id} type="button"
                className="flex items-center gap-3 p-4 rounded-2xl text-left w-full active:scale-[0.98] transition-all"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                  <FaBook className="text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>{course.title}</p>
                  <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
                    {course.instructor.firstName} {course.instructor.lastName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-yellow-500">
                      <FaStar className="text-[8px]" />{course.rating.toFixed(1)}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--text-3)" }}>{course._count.enrollments} students</span>
                    <span className="text-[10px] font-bold text-emerald-500">
                      {course.price === 0 ? "Free" : `${course.price} coins`}
                    </span>
                  </div>
                </div>
                <FiChevronRight style={{ color: "var(--text-3)" }} />
              </button>
            ))
          )}
        </motion.div>

        {/* My Learning */}
        <motion.div variants={fadeUp} className="flex flex-col gap-3">
          <h3 className="text-sm font-black" style={{ color: "var(--text)" }}>My Learning</h3>
          {!enrollments || enrollments.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 rounded-2xl"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <FaGraduationCap className="text-3xl" style={{ color: "var(--text-3)" }} />
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>No courses enrolled</p>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>Enroll in a course to start learning</p>
            </div>
          ) : (
            enrollments.map((e) => (
              <button key={e.id} type="button"
                className="flex items-center gap-3 p-4 rounded-2xl text-left w-full active:scale-[0.98] transition-all"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                  <FiAward className="text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>{e.course.title}</p>
                  <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                    <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${e.progress}%` }} />
                  </div>
                  <p className="text-[10px] mt-1 font-medium" style={{ color: "var(--text-3)" }}>{e.progress}% complete</p>
                </div>
                <FiChevronRight style={{ color: "var(--text-3)" }} />
              </button>
            ))
          )}
        </motion.div>

      </motion.div>
      <BottomNav />
    </div>
  );
}
