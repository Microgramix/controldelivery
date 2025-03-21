import React from 'react';
import styles from './App.module.scss'; // Importando o SCSS module
import DeliveryForm from './DeliveryForm';

const App = () => {
  return (
    <div className={styles.appContainer}>
      <DeliveryForm />
    </div>
  );
};

export default App;