import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Trash2, MoveRight } from 'lucide-react';
import teamsData from './teamsData.json';
import DailyRegister from './components/DailyRegister/DailyRegister';
import {
  doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { db } from './Firebase/firebase';

const DeliveryForm = () => {
  const [isTouching, setIsTouching] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [teams, setTeams] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dailyInput, setDailyInput] = useState({});
  const [recordsByDate, setRecordsByDate] = useState({});
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [tempSelectedTeam, setTempSelectedTeam] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [newDriver, setNewDriver] = useState({ name: '', model: '', brand: '' });

  useEffect(() => {
    // carregar nomes das equipas
    setTeams(teamsData.teams.map(team => ({ name: team.name })));
  }, []);

  useEffect(() => {
    if (!selectedTeam) return;

    const loadDrivers = async () => {
      const teamRef = doc(db, 'teams', selectedTeam);
      const snap = await getDoc(teamRef);

      if (snap.exists()) {
        setDrivers(snap.data().drivers || []);
      } else {
        const fallback = teamsData.teams.find(t => t.name === selectedTeam);
        if (fallback) {
          await setDoc(teamRef, {
            password: fallback.password,
            drivers: fallback.drivers
          });
          setDrivers(fallback.drivers);
        }
      }
    };

    loadDrivers();
  }, [selectedTeam]);

  useEffect(() => {
    if (selectedTeam) {
      const teamDocRef = doc(db, 'records', selectedTeam);
      getDoc(teamDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            setRecordsByDate(docSnap.data());
          } else {
            setRecordsByDate({});
          }
        })
        .catch((error) => console.error("Erro ao buscar registros:", error));
    }
  }, [selectedTeam]);

  const verifyPassword = () => {
    const team = teamsData.teams.find(team => team.name === tempSelectedTeam);
    if (team && team.password === passwordInput) {
      setSelectedTeam(tempSelectedTeam);
      setShowPasswordModal(false);
      setPasswordInput('');
    } else {
      alert('Senha incorreta!');
      setPasswordInput('');
    }
  };

  const handleTeamSelect = (teamName) => {
    setTempSelectedTeam(teamName);
    setShowPasswordModal(true);
  };

  const handleDailyChange = (name, value) => {
    setIsTouching(true);
    setTimeout(() => setIsTouching(false), 200);
    if (name === 'date') {
      setSelectedDate(value);
    } else {
      setDailyInput((prev) => ({ ...prev, [name]: Math.max(Number(value), 0) }));
    }
  };

  const handleDailySubmit = async (e) => {
    e.preventDefault();
    setIsTouching(true);
    setTimeout(() => setIsTouching(false), 300);

    const newRecord = {
      ...recordsByDate[selectedDate],
      ...Object.entries(dailyInput).reduce((acc, [driver, count]) => {
        acc[driver] = (recordsByDate[selectedDate]?.[driver] || 0) + count;
        return acc;
      }, {})
    };

    try {
      const teamDocRef = doc(db, 'records', selectedTeam);
      await setDoc(teamDocRef, { [selectedDate]: newRecord }, { merge: true });
      setRecordsByDate((prev) => ({ ...prev, [selectedDate]: newRecord }));
      setDailyInput({});
    } catch (error) {
      console.error("Erro ao atualizar os registros:", error);
    }
  };

  const handleAddDriver = async () => {
    if (!newDriver.name || !newDriver.model || !newDriver.brand) return;
    const idPrefix = selectedTeam.toLowerCase().replace(/\s/g, '');
    const newId = `${idPrefix}-${drivers.length + 1}`;
    const driver = { ...newDriver, id: newId };
    const teamRef = doc(db, 'teams', selectedTeam);
    await updateDoc(teamRef, { drivers: arrayUnion(driver) });
    setDrivers((prev) => [...prev, driver]);
    setNewDriver({ name: '', model: '', brand: '' });
  };

  const handleRemoveDriver = async (driver) => {
    const teamRef = doc(db, 'teams', selectedTeam);
    await updateDoc(teamRef, { drivers: arrayRemove(driver) });
    setDrivers(prev => prev.filter(d => d.id !== driver.id));
  };

  const handleTransferDriver = async (driver, newTeamName) => {
    const fromRef = doc(db, 'teams', selectedTeam);
    const toRef = doc(db, 'teams', newTeamName);
    await updateDoc(fromRef, { drivers: arrayRemove(driver) });
    await updateDoc(toRef, { drivers: arrayUnion(driver) });
    setDrivers(prev => prev.filter((d) => d.id !== driver.id));
  };

  const TeamSelector = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
      {teams.map((team) => (
        <motion.button
          key={team.name}
          className={`py-2 px-3 rounded-md font-bold shadow-md transition ${
            selectedTeam === team.name
              ? 'bg-[#ce5600] text-white'
              : 'bg-[#ce8d00] text-black'
          }`}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          onClick={() => handleTeamSelect(team.name)}
        >
          {team.name}
        </motion.button>
      ))}
    </div>
  );

  return (
    <motion.div
      className={`w-full min-h-screen bg-zinc-900 text-white transition ${
        isTouching ? 'opacity-90' : ''
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <header className="sticky top-0 z-10 bg-zinc-900/80 backdrop-blur border-b border-[#ce7c00] p-4">
        <h1 className="text-xl font-bold text-center text-[#ce8d00]">Registro Diário</h1>
      </header>

      <main className="px-4 pb-[100px] pt-6 max-w-3xl mx-auto">
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-center mb-2">Selecione sua Equipe</h2>
          <TeamSelector />
        </section>

        {selectedTeam && (
          <>
            <DailyRegister
              selectedTeam={selectedTeam}
              selectedDate={selectedDate}
              filteredDrivers={drivers}
              dailyInput={dailyInput}
              handleDailyChange={handleDailyChange}
              handleDailySubmit={handleDailySubmit}
            />

            <div className="mt-8 border border-zinc-700 p-5 rounded-xl bg-zinc-800 shadow-md">
              <h3 className="text-[#ce8d00] font-bold mb-4 text-center">Gerenciar Motoristas</h3>

              <div className="flex flex-col gap-2">
                {drivers.map((driver) => (
                  <div key={driver.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-zinc-700 p-3 rounded-md gap-2">
                    <span className="text-sm">{driver.name} ({driver.model})</span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleRemoveDriver(driver)}
                        className="text-xs px-3 py-1 flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white rounded"
                      >
                        <Trash2 size={14} /> Remover
                      </button>
                      <select
                        onChange={(e) => e.target.value && handleTransferDriver(driver, e.target.value)}
                        defaultValue=""
                        className="text-xs bg-zinc-700 text-white px-2 py-1 rounded"
                      >
                        <option value="" disabled>Transferir para...</option>
                        {teams
                          .filter((t) => t.name !== selectedTeam)
                          .map((team) => (
                            <option key={team.name} value={team.name}>{team.name}</option>
                          ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <input className="bg-zinc-700 p-3 rounded text-white" placeholder="Nome" value={newDriver.name} onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })} />
                <input className="bg-zinc-700 p-3 rounded text-white" placeholder="Modelo" value={newDriver.model} onChange={(e) => setNewDriver({ ...newDriver, model: e.target.value })} />
                <input className="bg-zinc-700 p-3 rounded text-white" placeholder="Marca" value={newDriver.brand} onChange={(e) => setNewDriver({ ...newDriver, brand: e.target.value })} />
                <button onClick={handleAddDriver} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded">
                  <UserPlus size={16} /> Adicionar Motorista
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <motion.div
            className="bg-zinc-800 p-6 rounded-xl w-[90%] max-w-md border border-[#ce7c00] shadow-xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-center text-white">
              Digite a senha para <span className="text-[#ce8d00]">{tempSelectedTeam}</span>
            </h3>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Senha"
              className="w-full p-3 bg-zinc-700 rounded text-white mb-4"
              autoFocus
            />
            <div className="flex gap-4">
              <button
                onClick={verifyPassword}
                className="flex-1 bg-[#ce8d00] hover:bg-[#ce5600] text-black font-bold py-2 rounded"
              >
                Confirmar
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordInput('');
                }}
                className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white font-bold py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default DeliveryForm;
