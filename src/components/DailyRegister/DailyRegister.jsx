import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './DailyRegister.module.scss';

const DailyRegister = ({
  selectedTeam,
  selectedDate,
  filteredDrivers,
  dailyInput,
  handleDailyChange,
  handleDailySubmit,
}) => {
  const [showModal, setShowModal] = useState(false);

  // Ao clicar em "Salvar Registro", apenas abre o modal de confirmação
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  // Ao confirmar (Sim), fecha o modal e dispara o handleDailySubmit
  const handleConfirmSubmit = () => {
    setShowModal(false);
    handleDailySubmit({ preventDefault: () => {} });
  };

  // Ao cancelar (Não), fecha o modal
  const handleCancel = () => {
    setShowModal(false);
  };

  return (
    <>
      <motion.form
        className={styles.form}
        onSubmit={handleFormSubmit}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2>Registro Diário - {selectedTeam}</h2>
        <label>Data:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => handleDailyChange('date', e.target.value)}
        />

        {filteredDrivers.map((driver) => (
          <div key={driver.name} className={styles.driverRow}>
            <span>{driver.name}</span>
            <input
              type="number"
              min="0"
              value={dailyInput[driver.name] || ''}
              onChange={(e) => handleDailyChange(driver.name, e.target.value)}
              placeholder="Encomendas"
              className={styles.smallInput}
            />
          </div>
        ))}

        <motion.button
          type="submit"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          Salvar Registro
        </motion.button>
      </motion.form>

      {showModal && (
        <div className={styles.modalOverlay}>
          <motion.div
            className={styles.modalContent}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3>Confirmação</h3>
            <p>
              Tem certeza de que os números inseridos estão corretos?
              Este registro é <strong>irreversível</strong>.
            </p>
            <div className={styles.modalButtons}>
              <motion.button
                onClick={handleConfirmSubmit}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                Sim
              </motion.button>
              <motion.button
                onClick={handleCancel}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                Não
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default DailyRegister;
