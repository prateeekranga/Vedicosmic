import type { Instructor } from '@/types/course.types';

/**
 * Single source of truth for every named teacher/author on the site — shared
 * by course instructor cards and blog post bylines so E-E-A-T signals (bio,
 * rating, student count) stay consistent wherever a person is credited.
 */
export const AUTHORS: Record<string, Instructor> = {
  ananya: { id: 'i1', name: 'Acharya Ananya Devi', title: 'Vedic Astrologer & Jyotish Teacher', initials: 'AD', rating: 4.9, courseCount: 3, studentCount: 14200, bio: 'A Jyotish practitioner of two decades, Ananya bridges classical Parashari astrology with a clear, modern teaching style trusted by students across the world.' },
  rajan: { id: 'i2', name: 'Yogiraj Rajan Nath', title: 'Kundalini & Pranayama Master', initials: 'RN', rating: 4.8, courseCount: 2, studentCount: 9800, bio: 'Trained in the Himalayan tradition, Rajan teaches energy practices with an emphasis on safety, grounding, and steady, sustainable awakening.' },
  meera: { id: 'i3', name: 'Dr. Meera Iyer', title: 'Sacred Geometry & Mathematics', initials: 'MI', rating: 4.9, courseCount: 2, studentCount: 7600, bio: 'With a doctorate in mathematics and a lifelong study of yantra, Meera reveals the precise structures underlying ancient sacred forms.' },
  kabir: { id: 'i4', name: 'Pandit Kabir Sharma', title: 'Numerologist & Vedic Scholar', initials: 'KS', rating: 4.7, courseCount: 2, studentCount: 11300, bio: 'Kabir has read tens of thousands of charts, distilling Anka Shastra into a practical system anyone can learn and apply.' },
  leela: { id: 'i5', name: 'Leela Krishnan', title: 'Meditation & Mindfulness Guide', initials: 'LK', rating: 4.9, courseCount: 3, studentCount: 18900, bio: 'A gentle, widely loved teacher, Leela makes meditation and breathwork accessible to complete beginners and seasoned practitioners alike.' },
  vasanti: { id: 'i6', name: 'Vasanti Rao', title: 'Energy Healer & Chakra Therapist', initials: 'VR', rating: 4.8, courseCount: 1, studentCount: 6400, bio: 'Vasanti combines subtle-body theory with practical, embodied techniques for restoring energetic balance.' },
  harish: { id: 'i7', name: 'Sthapati Harish Menon', title: 'Vastu Shastra Consultant', initials: 'HM', rating: 4.7, courseCount: 1, studentCount: 5200, bio: 'A practising Vastu consultant and architect, Harish teaches the science of sacred space for homes and workplaces.' },
};

export function getAuthor(slug: string) {
  return AUTHORS[slug];
}
