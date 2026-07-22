import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { SoundProvider } from '@/contexts/SoundContext';
import { Layout } from '@/components/layout/Layout';

const Home = lazy(() => import('@/pages/Home'));
const Tools = lazy(() => import('@/pages/Tools'));
const ToolPage = lazy(() => import('@/pages/ToolPage'));
const Courses = lazy(() => import('@/pages/Courses'));
const CourseDetail = lazy(() => import('@/pages/CourseDetail'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Admin = lazy(() => import('@/pages/Admin'));
const PrivacyPolicy = lazy(() => import('@/pages/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/pages/legal/TermsOfService'));
const RefundPolicy = lazy(() => import('@/pages/legal/RefundPolicy'));
const Disclaimer = lazy(() => import('@/pages/legal/Disclaimer'));

function PageLoader() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-transparent border-t-gold-400 border-r-gold-400/40" />
        <div className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-b-brand-cyan-300/60" />
        <div className="absolute inset-0 grid place-items-center text-gold-400">✦</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <SoundProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/tools/:slug" element={<ToolPage />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:slug" element={<CourseDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
        </SoundProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
