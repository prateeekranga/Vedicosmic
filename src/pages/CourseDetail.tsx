import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star, Users, Clock, Check, Lock, PlayCircle, BookOpen, HelpCircle, Dumbbell, ArrowLeft,
} from 'lucide-react';
import { mergedCourse } from '@/lib/overrides';
import { getCourse } from '@/data/courses';
import type { Lesson } from '@/types/course.types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Accordion } from '@/components/ui/Accordion';
import { Modal } from '@/components/ui/Modal';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { formatINR } from '@/lib/format';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useSEO } from '@/hooks/useSEO';
import { courseSchema, breadcrumbList } from '@/lib/schema';

const TABS = ['Overview', 'Curriculum', 'Instructor', 'Reviews'] as const;
const LESSON_ICON = { video: PlayCircle, reading: BookOpen, quiz: HelpCircle, practice: Dumbbell };

export default function CourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const course = slug ? (mergedCourse(slug) ?? getCourse(slug)) : undefined;
  const [tab, setTab] = useState<typeof TABS[number]>('Overview');
  const [confirm, setConfirm] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const { user, isEnrolled, toggleEnrollment } = useAuth();
  const { notify } = useToast();

  useEffect(() => { if (!course) navigate('/courses', { replace: true }); }, [course, navigate]);
  useEffect(() => { window.scrollTo(0, 0); }, [slug]);
  useSEO({
    key: `course:${slug}`,
    path: `/courses/${slug}`,
    title: course ? `${course.title} · VediCosmic` : 'Course · VediCosmic',
    description: course?.description ?? '',
    type: 'article',
    jsonLd: course ? [
      courseSchema(course),
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Courses', path: '/courses' },
        { name: course.title, path: `/courses/${course.slug}` },
      ]),
    ] : undefined,
  });
  if (!course) return null;

  const enrolled = isEnrolled(course.id);

  const enroll = () => {
    if (!user) { window.dispatchEvent(new CustomEvent('vc:open-auth')); return; }
    if (enrolled) { toggleEnrollment(course.id); notify('Left the course'); return; }
    if (course.price > 0) { setConfirm(true); return; }
    toggleEnrollment(course.id); notify(`Enrolled in ${course.title} 🎉`);
  };

  const confirmPaid = () => {
    toggleEnrollment(course.id); setConfirm(false);
    notify(`Enrolled in ${course.title} 🎉`);
  };

  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const defaultLesson = allLessons.find((l) => l.type === 'video' && (l.isPreview || enrolled)) ?? null;
  const activeLesson = allLessons.find((l) => l.id === selectedLessonId) ?? defaultLesson;

  return (
    <div className="pb-24">
      {/* HERO */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${course.gradient}`}>
        <div className="absolute inset-0 bg-cosmic-darker/55" />
        <div className="container-vc relative py-16 sm:py-20">
          <Link to="/courses" className="mb-6 inline-flex items-center gap-1 text-sm text-white/60 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> All courses
          </Link>
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge tone="gold">{course.level}</Badge>
                {course.tags.map((t) => <Badge key={t}>{t}</Badge>)}
              </div>
              <h1 className="font-display text-h1 text-white">{course.title}</h1>
              <p className="mt-3 max-w-2xl text-body text-white/75">{course.subtitle}</p>
              <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-white/70">
                <span className="flex items-center gap-1.5 text-gold-soft"><Star className="h-4 w-4 fill-current" /> {course.rating} ({course.reviewCount.toLocaleString('en-IN')})</span>
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {course.enrollmentCount.toLocaleString('en-IN')} enrolled</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {course.duration}</span>
                <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {totalLessons} lessons</span>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white">{course.instructor.initials}</span>
                <div className="text-sm"><div className="text-white">{course.instructor.name}</div>
                  <div className="text-white/55">{course.instructor.title}</div></div>
              </div>
            </motion.div>

            {/* Sticky enroll card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="lg:sticky lg:top-24">
                <Card className="p-6">
                  <div className="font-display text-4xl text-gradient-gold">{formatINR(course.price)}</div>
                  {course.price > 0 && <p className="mt-1 text-xs text-white/40">One-time payment · lifetime access</p>}
                  <Button className="mt-5 w-full" variant={enrolled ? 'outline' : 'primary'} onClick={enroll}>
                    {enrolled ? <><Check className="h-4 w-4" /> You’re enrolled</> : course.price > 0 ? 'Enrol now' : 'Enrol for free'}
                  </Button>
                  {enrolled && <button onClick={enroll} className="mt-2 w-full text-xs text-white/40 hover:text-white/70">Leave course</button>}
                  <ul className="mt-6 space-y-2.5 text-sm text-white/65">
                    {course.whatYouLearn.slice(0, 4).map((w) => (
                      <li key={w} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-cosmic" /> {w}</li>
                    ))}
                  </ul>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TABS */}
      <div className="container-vc">
        <div className="sticky top-[68px] z-20 -mx-4 flex gap-1 overflow-x-auto border-b border-white/10 bg-cosmic-dark/80 px-4 backdrop-blur-md">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`relative whitespace-nowrap px-5 py-4 text-sm transition-colors ${tab === t ? 'text-white' : 'text-white/50 hover:text-white/80'}`}>
              {t}
              {tab === t && <motion.span layoutId="course-tab" className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gold-bright" />}
            </button>
          ))}
        </div>

        <div className="grid gap-10 py-10 lg:grid-cols-[1fr_360px]">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            {tab === 'Overview' && (
              <div className="space-y-8">
                <div><h2 className="font-heading text-h3 text-white">About this course</h2>
                  <p className="mt-3 leading-relaxed text-white/70">{course.description}</p></div>
                <div><h2 className="font-heading text-h3 text-white">What you’ll learn</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {course.whatYouLearn.map((w) => (
                      <div key={w} className="flex gap-2 text-sm text-white/70"><Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-cosmic" /> {w}</div>
                    ))}
                  </div>
                </div>
                <div><h2 className="font-heading text-h3 text-white">Requirements</h2>
                  <ul className="mt-3 space-y-2">
                    {course.requirements.map((r) => <li key={r} className="flex gap-2 text-sm text-white/70"><span className="text-gold-soft">·</span> {r}</li>)}
                  </ul>
                </div>
              </div>
            )}
            {tab === 'Curriculum' && (
              <div className="space-y-6">
                {activeLesson && (
                  <div>
                    <VideoPlayer youtubeId={activeLesson.youtubeId} title={activeLesson.title} />
                    <p className="mt-3 text-sm text-white/60">Now playing: <span className="text-white/85">{activeLesson.title}</span></p>
                  </div>
                )}
                {!enrolled && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold-soft/20 bg-gold-bright/5 px-4 py-3">
                    <p className="flex items-center gap-2 text-sm text-white/70"><Lock className="h-4 w-4 text-gold-soft" /> Preview lessons are free to watch — enrol to unlock the full curriculum.</p>
                    <Button size="sm" onClick={enroll}>{course.price > 0 ? 'Enrol now' : 'Enrol for free'}</Button>
                  </div>
                )}
                <Accordion items={course.modules.map((m) => ({
                  id: m.id,
                  header: <span>{m.title} <span className="text-white/40">· {m.lessons.length} lessons</span></span>,
                  body: (
                    <ul className="space-y-2">
                      {m.lessons.map((l: Lesson) => {
                        const Icon = LESSON_ICON[l.type];
                        const open = l.isPreview || enrolled;
                        const playable = open && l.type === 'video';
                        const active = activeLesson?.id === l.id;
                        return (
                          <li key={l.id}>
                            <button
                              disabled={!playable}
                              onClick={() => playable && setSelectedLessonId(l.id)}
                              className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                                playable ? 'cursor-pointer hover:bg-white/5' : 'cursor-default'
                              } ${active ? 'bg-gold-bright/10' : ''}`}
                            >
                              {open ? <Icon className={`h-4 w-4 ${active ? 'text-gold-soft' : 'text-brand-cyan'}`} /> : <Lock className="h-4 w-4 text-white/30" />}
                              <span className={open ? (active ? 'text-gold-pale' : 'text-white/80') : 'text-white/45'}>{l.title}</span>
                              {l.isPreview && !enrolled && <Badge tone="cyan">Preview</Badge>}
                              <span className="ml-auto text-white/40">{l.duration}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ),
                }))} defaultOpen={course.modules[0]?.id} />
              </div>
            )}
            {tab === 'Instructor' && (
              <Card className="p-7">
                <div className="flex items-center gap-4">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-bright/15 text-xl font-display text-gold-soft">{course.instructor.initials}</span>
                  <div><h2 className="font-heading text-h3 text-white">{course.instructor.name}</h2>
                    <p className="text-white/55">{course.instructor.title}</p></div>
                </div>
                <div className="mt-5 flex gap-6 text-sm text-white/60">
                  <span className="flex items-center gap-1 text-gold-soft"><Star className="h-4 w-4 fill-current" /> {course.instructor.rating}</span>
                  <span>{course.instructor.courseCount} courses</span>
                  <span>{course.instructor.studentCount.toLocaleString('en-IN')} students</span>
                </div>
                <p className="mt-5 leading-relaxed text-white/70">{course.instructor.bio}</p>
              </Card>
            )}
            {tab === 'Reviews' && (
              <div className="space-y-4">
                {course.reviews.map((r) => (
                  <Card key={r.id} className="p-6">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-sm text-white">{r.initials}</span>
                      <div className="flex-1"><div className="text-white">{r.name}</div><div className="text-xs text-white/40">{r.date}</div></div>
                      <span className="flex gap-0.5">{Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-gold-bright text-gold-bright' : 'text-white/20'}`} />
                      ))}</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-white/70">{r.text}</p>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-4">
              <Card className="p-5">
                <span className="eyebrow">This course pairs with</span>
                <p className="mt-2 text-sm text-white/65">Try the matching free tool to put the lessons into practice right away.</p>
                <Button to="/tools" variant="ghost" className="mt-3">Browse tools →</Button>
              </Card>
            </div>
          </aside>
        </div>
      </div>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="Confirm enrolment">
        <p className="text-sm text-white/70">
          You’re enrolling in <span className="text-white">{course.title}</span> for <span className="text-gold-pale">{formatINR(course.price)}</span>.
        </p>
        <p className="mt-3 rounded-xl bg-cosmic-light/30 p-3 text-xs text-white/50">
          This is a demo enrolment — no real payment is processed. Secure checkout arrives in a future release.
        </p>
        <div className="mt-5 flex gap-3">
          <Button className="flex-1" onClick={confirmPaid}>Confirm enrolment</Button>
          <Button variant="ghost" onClick={() => setConfirm(false)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
