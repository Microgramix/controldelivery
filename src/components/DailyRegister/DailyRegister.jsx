import React, { useState, useEffect } from 'react';
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
  const [confirmValues, setConfirmValues] = useState({});
  const [error, setError] = useState('');

  // Em vez de submeter diretamente, abre o modal de confirmação
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  // Atualiza o valor de confirmação para cada motorista
  const handleConfirmChange = (driverName, value) => {
    setConfirmValues((prev) => ({ ...prev, [driverName]: value }));
  };

  // Ao confirmar, compara os valores. Se todos coincidirem, submete o registro.
  const handleConfirmSubmit = () => {
    for (let driver of filteredDrivers) {
      const original = dailyInput[driver.name] || '';
      const confirmed = confirmValues[driver.name] || '';
      if (String(original) !== String(confirmed)) {
        setError(
          `O valor para ${driver.name} não confere. Por favor, verifique e tente novamente.`
        );
        return;
      }
    }
    // Se tudo estiver correto, limpa os estados, fecha o modal e submete
    setError('');
    setShowModal(false);
    setConfirmValues({});
    // Simula um event.preventDefault para a função de submit
    handleDailySubmit({ preventDefault: () => {} });
  };

  const handleCancel = () => {
    setShowModal(false);
    setConfirmValues({});
    setError('');
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
              Tem certeza que os números inseridos estão corretos? Este registro é{' '}
              <strong>irreversível</strong>. Preencha com máximo cuidado e atenção.
            </p>
            {filteredDrivers.map((driver) => (
              <div key={driver.name} className={styles.confirmRow}>
                <label>
                  Confirme {driver.name} (valor: {dailyInput[driver.name] || 0}):
                </label>
                <input
                  type="number"
                  min="0"
                  value={confirmValues[driver.name] || ''}
                  onChange={(e) =>
                    handleConfirmChange(driver.name, e.target.value)
                  }
                  className={styles.smallInput}
                />
              </div>
            ))}
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.modalButtons}>
              <motion.button
                onClick={handleConfirmSubmit}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                Confirmar
              </motion.button>
              <motion.button
                onClick={handleCancel}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                Cancelar
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default DailyRegister;
