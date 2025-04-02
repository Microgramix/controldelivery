import React from 'react';
import styles from './BottomHeader.module.scss';

export default function BottomHeader() {
  return (
    <header className={styles.bottomHeader}>
      <nav className={styles.nav}>
        <ul className={styles.menu}>
          <li><a href="/">Home</a></li>
          <li><a href="/ranking">Ranking</a></li>
          <li><a href="/compare">Comparar</a></li>
          <li><a href="/admin-teams">Admin</a></li>
        </ul>
      </nav>
    </header>
  )
}