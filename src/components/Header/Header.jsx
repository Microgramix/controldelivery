import React from 'react';
import InstallButton from '../InstallButton/InstallButton'; // ajuste o caminho conforme necessário
import styles from './Header.module.scss';

const Header = () => {
  return (
    <header className={styles.header}>
      <img src="/logof.png" alt="Logo Fastrack" className={styles.logo} />
      <InstallButton />
    </header>
  );
};

export default Header;
