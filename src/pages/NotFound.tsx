import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { SriYantra } from '@/components/effects/SriYantra';
import { useSEO } from '@/hooks/useSEO';

export default function NotFound() {
  const { pathname } = useLocation();
  useSEO({
    key: '404', path: pathname, title: 'Page not found · VediCosmic',
    description: 'The page you are looking for could not be found.', noindex: true,
  });
  return (
    <div className="container-vc flex min-h-[80vh] flex-col items-center justify-center py-20 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative mb-8 h-48 w-48"
      >
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        >
          <SriYantra className="h-full w-full opacity-50" />
        </motion.div>
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-display text-[3.5rem] leading-none text-gradient-gold">404</span>
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-heading text-h2 text-white"
      >
        This path is uncharted
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        className="mt-4 max-w-md text-body text-white/60"
      >
        The page you seek has drifted beyond the visible cosmos. Let us guide you back to familiar stars.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.44 }}
        className="mt-8 flex flex-wrap justify-center gap-4"
      >
        <Button to="/">Return home</Button>
        <Button to="/tools" variant="outline">Explore tools</Button>
      </motion.div>
    </div>
  );
}
