import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Minimal interface for Chrome's beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const A2HSHint: React.FC = () => {
  const [show, setShow] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const bipEventRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const installed = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(installed);
    setIsIOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

    if (installed) return;

    // No sessionStorage: show briefly each session; could be persisted in user_settings later

    // Android/Chrome flow: wait for beforeinstallprompt
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      bipEventRef.current = e as BeforeInstallPromptEvent;
      setShow(true);
      // Auto-dismiss after 10s
      const t = window.setTimeout(() => hide('auto'), 10000);
      return () => window.clearTimeout(t);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt as any);

    // iOS Safari doesn't fire BIP; show generic hint immediately
    if (/iphone|ipad|ipod/i.test(window.navigator.userAgent)) {
      setShow(true);
      const t = window.setTimeout(() => hide('auto'), 10000);
      return () => {
        window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt as any);
        window.clearTimeout(t);
      };
    }

    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt as any);
  }, []);

  const hide = (reason: 'auto' | 'close' | 'installed') => {
    setShow(false);
    if (reason === 'installed') {
      bipEventRef.current = null;
    }
  };

  const handleInstall = async () => {
    const ev = bipEventRef.current;
    if (!ev) return;
    try {
      await ev.prompt();
      if (ev.userChoice) {
        const choice = await ev.userChoice;
        if (choice.outcome === 'accepted') hide('installed');
      } else {
        hide('installed');
      }
    } catch {
      hide('close');
    }
  };

  const title = isIOS ? 'Add to Home Screen' : 'Install Flow Timer';
  const description = isIOS
    ? 'Open the Share menu and tap “Add to Home Screen” to install.'
    : 'Install Flow Timer on your device for a native, full-screen experience.';

  if (!show || isStandalone) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          className="fixed left-4 right-4 bottom-6 z-50"
        >
          <div className="mx-auto max-w-md rounded-xl shadow-2xl border border-light-border dark:border-dark-border bg-light-card/95 dark:bg-dark-card/95 backdrop-blur p-3 text-light-text dark:text-dark-text">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="font-semibold">{title}</div>
                <div className="text-sm text-light-text/70 dark:text-dark-text/70">{description}</div>
              </div>
              <button
                onClick={() => hide('close')}
                className="px-2 py-1 text-light-text/60 dark:text-dark-text/60 hover:text-light-text dark:hover:text-dark-text"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
            {!isIOS && bipEventRef.current && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleInstall}
                  className="px-3 py-1.5 rounded-lg bg-light-accent dark:bg-dark-accent text-white text-sm hover:bg-light-accent-hover dark:hover:bg-dark-accent-hover"
                >
                  Install
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default A2HSHint;


