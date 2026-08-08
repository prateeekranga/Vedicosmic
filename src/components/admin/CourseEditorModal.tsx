import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { ArrayEditor } from '@/components/admin/ArrayEditor';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { slugify } from '@/lib/format';
import { parseYouTubeId } from '@/lib/youtube';
import type { Course, CourseLevel, CourseCategory, Module, Lesson } from '@/types/course.types';

const LEVELS: CourseLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
const CATEGORIES: CourseCategory[] = ['astrology', 'numerology', 'meditation', 'kundalini', 'chakras', 'sacred-geometry', 'vastu', 'mantra'];
const LESSON_TYPES: Lesson['type'][] = ['video', 'reading', 'quiz', 'practice'];

export function blankCourse(): Course {
  const id = `custom-${Date.now()}`;
  return {
    id, slug: '', title: '', subtitle: '',
    instructor: { id: `${id}-instructor`, name: '', title: '', bio: '', initials: '', rating: 4.8, courseCount: 0, studentCount: 0 },
    gradient: 'from-gold-bright/25 to-brand-cyan/15', glyph: '✶',
    level: 'Beginner', category: 'astrology', duration: '', lessonCount: 0,
    rating: 4.8, reviewCount: 0, enrollmentCount: 0, price: 0, currency: 'INR',
    tags: [], description: '', whatYouLearn: [], requirements: [], modules: [], reviews: [],
    isFeatured: false, publishedAt: new Date().toISOString().slice(0, 10),
  };
}

function linesToArray(text: string): string[] {
  return text.split('\n').map((s) => s.trim()).filter(Boolean);
}

/** Paste a YouTube URL (or bare video ID) and see it play instantly, before saving. */
function LessonVideoField({ lesson, onChange }: { lesson: Lesson; onChange: (patch: Partial<Lesson>) => void }) {
  const [urlText, setUrlText] = useState(lesson.youtubeId ?? '');
  const parsedId = parseYouTubeId(urlText);

  return (
    <div className="space-y-2">
      <Input
        label="YouTube video URL"
        value={urlText}
        placeholder="Paste a link — e.g. https://youtube.com/watch?v=... — or a bare video ID"
        onChange={(e) => { const v = e.target.value; setUrlText(v); onChange({ youtubeId: parseYouTubeId(v) ?? undefined }); }}
      />
      {urlText.trim() && (
        <p className={`text-xs ${parsedId ? 'text-teal-cosmic' : 'text-error'}`}>
          {parsedId ? `✓ Recognized video ID: ${parsedId}` : 'Not a recognizable YouTube link or ID yet.'}
        </p>
      )}
      {parsedId && (
        <div className="max-w-sm">
          <VideoPlayer youtubeId={parsedId} title={lesson.title || 'Preview'} />
        </div>
      )}
    </div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  seed: Course;
  onSave: (course: Course) => void;
}

export function CourseEditorModal({ open, onClose, seed, onSave }: Props) {
  const [c, setC] = useState<Course>(seed);
  useEffect(() => { if (open) setC(seed); }, [open, seed]);
  const update = (patch: Partial<Course>) => setC((prev) => ({ ...prev, ...patch }));

  const save = () => {
    const modules = c.modules;
    onSave({
      ...c,
      slug: c.slug.trim() ? slugify(c.slug) : slugify(c.title),
      tags: linesToArray(c.tags.join('\n')),
      whatYouLearn: linesToArray(c.whatYouLearn.join('\n')),
      requirements: linesToArray(c.requirements.join('\n')),
      lessonCount: modules.reduce((s, m) => s + m.lessons.length, 0),
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={seed.title ? 'Edit Course' : 'Add Course'} maxWidth="max-w-3xl">
      <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Title" value={c.title} onChange={(e) => update({ title: e.target.value })} />
            <Input label="Subtitle" value={c.subtitle} onChange={(e) => update({ subtitle: e.target.value })} />
          </div>
          <Input label="URL slug" value={c.slug} placeholder="auto-generated from title if left blank"
            onChange={(e) => update({ slug: e.target.value })} />
          <Textarea label="Description" rows={3} value={c.description} onChange={(e) => update({ description: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-4">
            <Select label="Level" value={c.level} onChange={(e) => update({ level: e.target.value as CourseLevel })}>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </Select>
            <Select label="Category" value={c.category} onChange={(e) => update({ category: e.target.value as CourseCategory })}>
              {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </Select>
            <Input label="Duration" value={c.duration} placeholder="6 hrs" onChange={(e) => update({ duration: e.target.value })} />
            <Input label="Price (₹)" type="number" min={0} value={c.price} onChange={(e) => update({ price: Math.max(0, Number(e.target.value)) })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Glyph" value={c.glyph} onChange={(e) => update({ glyph: e.target.value })} />
            <Input label="Card gradient (Tailwind classes)" value={c.gradient} onChange={(e) => update({ gradient: e.target.value })} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 p-4 space-y-3">
          <h4 className="text-sm font-medium text-white/70">Instructor</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Name" value={c.instructor.name} onChange={(e) => update({ instructor: { ...c.instructor, name: e.target.value } })} />
            <Input label="Title" value={c.instructor.title} onChange={(e) => update({ instructor: { ...c.instructor, title: e.target.value } })} />
          </div>
          <Textarea label="Bio" rows={2} value={c.instructor.bio} onChange={(e) => update({ instructor: { ...c.instructor, bio: e.target.value } })} />
          <div className="grid gap-3 sm:grid-cols-3">
            <Input label="Initials" value={c.instructor.initials} onChange={(e) => update({ instructor: { ...c.instructor, initials: e.target.value } })} />
            <Input label="Rating" type="number" min={0} max={5} step={0.1} value={c.instructor.rating}
              onChange={(e) => update({ instructor: { ...c.instructor, rating: Number(e.target.value) } })} />
            <Input label="Students" type="number" min={0} value={c.instructor.studentCount}
              onChange={(e) => update({ instructor: { ...c.instructor, studentCount: Number(e.target.value) } })} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Textarea label="Tags (one per line)" rows={3} value={c.tags.join('\n')} onChange={(e) => update({ tags: e.target.value.split('\n') })} />
          <Textarea label="What you'll learn (one per line)" rows={3} value={c.whatYouLearn.join('\n')} onChange={(e) => update({ whatYouLearn: e.target.value.split('\n') })} />
          <Textarea label="Requirements (one per line)" rows={3} value={c.requirements.join('\n')} onChange={(e) => update({ requirements: e.target.value.split('\n') })} />
        </div>

        <div className="rounded-2xl border border-white/10 p-4 space-y-3">
          <h4 className="text-sm font-medium text-white/70">Curriculum</h4>
          <ArrayEditor<Module>
            items={c.modules}
            onChange={(modules) => update({ modules })}
            addLabel="Add module"
            emptyItem={() => ({ id: `mod-${Date.now()}`, title: '', order: c.modules.length + 1, lessons: [] })}
            renderFields={(mod, updateMod) => (
              <div className="space-y-3">
                <Input label="Module title" value={mod.title} onChange={(e) => updateMod({ title: e.target.value })} />
                <div className="rounded-lg border border-white/10 p-3">
                  <p className="mb-2 text-xs uppercase tracking-wider text-white/40">Lessons</p>
                  <ArrayEditor<Lesson>
                    items={mod.lessons}
                    onChange={(lessons) => updateMod({ lessons })}
                    addLabel="Add lesson"
                    emptyItem={() => ({ id: `lesson-${Date.now()}`, title: '', type: 'video', duration: '', isPreview: false })}
                    renderFields={(lesson, updateLesson) => (
                      <div className="space-y-2">
                        <div className="grid gap-2 sm:grid-cols-4">
                          <div className="sm:col-span-2">
                            <Input label="Title" value={lesson.title} onChange={(e) => updateLesson({ title: e.target.value })} />
                          </div>
                          <Select label="Type" value={lesson.type} onChange={(e) => updateLesson({ type: e.target.value as Lesson['type'] })}>
                            {LESSON_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </Select>
                          <Input label="Duration" value={lesson.duration} placeholder="12 min" onChange={(e) => updateLesson({ duration: e.target.value })} />
                        </div>
                        {lesson.type === 'video' && (
                          <LessonVideoField lesson={lesson} onChange={updateLesson} />
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
            )}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-white/70">
          <input type="checkbox" checked={c.isFeatured} onChange={(e) => update({ isFeatured: e.target.checked })} className="h-4 w-4 accent-gold-400" />
          Featured on Courses page
        </label>
      </div>

      <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-5">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={save}>Save course</Button>
      </div>
    </Modal>
  );
}
