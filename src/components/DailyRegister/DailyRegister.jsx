import React, { useState } from 'react';
import { motion } from 'framer-motion';

const DailyRegister = ({
  selectedTeam,
  selectedDate,
  filteredDrivers,
  dailyInput,
  handleDailyChange,
  handleDailySubmit,
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowModal(false);
    handleDailySubmit({ preventDefault: () => {} });
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  return (
    <>
      <motion.form
        onSubmit={handleFormSubmit}
        className="bg-zinc-800 border border-orange-500 p-6 rounded-xl space-y-4 shadow-lg"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-center text-lg font-bold text-orange-400">Registro Diário - {selectedTeam}</h2>

        <div className="space-y-1">
          <label className="block text-sm">Data:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDailyChange('date', e.target.value)}
            className="w-full p-2 rounded bg-zinc-700 text-white border border-zinc-600"
          />
        </div>

        <div className="space-y-3">
          {filteredDrivers.map((driver) => (
            <div key={driver.name} className="flex items-center justify-between">
              <span>{driver.name}</span>
              <input
                type="number"
                min="0"
                value={dailyInput[driver.name] || ''}
                onChange={(e) => handleDailyChange(driver.name, e.target.value)}
                placeholder="Encomendas"
                className="w-24 text-center p-2 bg-zinc-700 rounded border border-zinc-600 text-white"
              />
            </div>
          ))}
        </div>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-2 rounded mt-4 transition"
        >
          Salvar Registro
        </motion.button>
      </motion.form>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <motion.div
            className="bg-zinc-800 p-6 rounded-xl w-[90%] max-w-md border border-orange-500 shadow-xl text-white"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-center">Confirmação</h3>
            <p className="mb-4 text-sm text-center">
              Tem certeza de que os números inseridos estão corretos?
              Este registro é <strong className="text-red-400">irreversível</strong>.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleConfirmSubmit}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-black font-bold py-2 rounded"
              >
                Sim
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white font-bold py-2 rounded"
              >
                Não
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default DailyRegister;
