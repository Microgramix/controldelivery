import React, { useState, useEffect } from 'react';
import styles from './InstallButton.module.scss';

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(true);
  const [isIos, setIsIos] = useState(false);

  // Verifica se o app já está em modo standalone (principalmente iOS)
  const isInStandaloneMode = () =>
    'standalone' in window.navigator && window.navigator.standalone;

  useEffect(() => {
    // Se já estiver em modo standalone, não exibe o botão
    if (isInStandaloneMode()) return;

    // Verifica se é iOS (iPhone, iPad ou iPod)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(iosDevice);

    // Listener para beforeinstallprompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true); // Exibe o botão apenas em dispositivos compatíveis
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listener para detectar quando o app é instalado
    const handleAppInstalled = () => {
      console.log('App instalado com sucesso!');
      setShowButton(false);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    // Se for iOS, exibe instruções de como adicionar manualmente
    if (isIos) {
      alert(
        'Para adicionar ao ecrã inicial no iOS:\n\n' +
          '1. Abra o menu de Partilha (ícone com seta para cima).\n' +
          '2. Selecione "Adicionar à Tela de Início" (Add to Home Screen).\n' +
          '3. Confirme o nome do app e clique em "Adicionar".'
      );
      return;
    }

    // Se não há suporte ou não disparou o beforeinstallprompt
    if (!deferredPrompt) {
      alert('Instalação não suportada neste dispositivo ou navegador.');
      return;
    }

    // Dispara o prompt de instalação (Android/Chrome)
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

  // Lógica para exibir o botão:
  // - Se está em modo standalone, oculta
  // - iOS: exibimos para mostrar instruções de instalação
  // - Android compatível: exibimos se disparou o beforeinstallprompt
  // - Caso contrário, ocultamos
  const shouldShowButton = !isInStandaloneMode() && (isIos || showButton);

  if (!shouldShowButton) return null;

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
