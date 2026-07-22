export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type CourseCategory =
  | 'astrology' | 'numerology' | 'meditation' | 'kundalini'
  | 'chakras' | 'sacred-geometry' | 'vastu' | 'mantra';

export interface Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  initials: string;
  rating: number;
  courseCount: number;
  studentCount: number;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz' | 'practice';
  duration: string;
  isPreview: boolean;
  /** YouTube video ID (the part after `v=` in a YouTube URL) — undefined until the real video is uploaded. */
  youtubeId?: string;
}

export interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Review {
  id: string;
  name: string;
  initials: string;
  rating: number;
  date: string;
  text: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  instructor: Instructor;
  gradient: string;
  glyph: string;
  level: CourseLevel;
  category: CourseCategory;
  duration: string;
  lessonCount: number;
  rating: number;
  reviewCount: number;
  enrollmentCount: number;
  price: number;
  currency: 'INR';
  tags: string[];
  description: string;
  whatYouLearn: string[];
  requirements: string[];
  modules: Module[];
  reviews: Review[];
  isFeatured: boolean;
  publishedAt: string;
}
