import React, { useState, useEffect } from 'react';
import styles from './InstallButton.module.scss';

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(true);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(
      outcome === 'accepted'
        ? 'Usuário aceitou o prompt de instalação'
        : 'Usuário recusou o prompt de instalação'
    );
    setDeferredPrompt(null);
    setShowButton(false);
  };

  if (!showButton) return null;

  return (
    <button className={styles.installButton} onClick={handleInstallClick}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 16l4-4h-3V4h-2v8H8l4 4z" />
        <path d="M20 18H4v-2h16v2z" />
      </svg>
    </button>
  );
};

export default InstallButton;
