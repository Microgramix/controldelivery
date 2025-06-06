import React, { useState, useEffect } from 'react';
import { db } from './Firebase/firebase';
import {
  doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc
} from 'firebase/firestore';
import teamsData from './teamsData.json';

const ADMIN_PASSWORD = 'admin123';

export default function AdminTeams() {
  const [enteredPassword, setEnteredPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [newDriver, setNewDriver] = useState({ brand: '', model: '', name: '', id: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    setTeams(teamsData.teams.map(team => ({ name: team.name })));
  }, []);

  useEffect(() => {
    const loadDrivers = async () => {
      if (!selectedTeam) return;
      const teamRef = doc(db, 'teams', selectedTeam);
      const snap = await getDoc(teamRef);
      if (snap.exists()) setDrivers(snap.data().drivers || []);
      else {
        const jsonTeam = teamsData.teams.find(t => t.name === selectedTeam);
        if (jsonTeam) {
          await setDoc(teamRef, {
            password: jsonTeam.password,
            drivers: jsonTeam.drivers
          });
          setDrivers(jsonTeam.drivers);
        }
      }
    };
    loadDrivers();
  }, [selectedTeam]);

  const handleLogin = () => {
    if (enteredPassword === ADMIN_PASSWORD) setAuthorized(true);
    else alert('Senha incorreta');
  };

  const getNextId = () => {
    const prefix = selectedTeam.toLowerCase().replace(/\s/g, '');
    const existingIds = drivers.map(d => parseInt(d.id.split('-')[1] || '0')).filter(n => !isNaN(n));
    const next = Math.max(0, ...existingIds) + 1;
    return `${prefix}-${next}`;
  };

  const handleAddDriver = async () => {
    if (!newDriver.name || !newDriver.model || !newDriver.brand) return;
    const driver = { ...newDriver, id: getNextId() };
    const teamRef = doc(db, 'teams', selectedTeam);
    await updateDoc(teamRef, {
      drivers: arrayUnion(driver)
    });
    setDrivers(prev => [...prev, driver]);
    setNewDriver({ brand: '', model: '', name: '', id: '' });
    setMessage('Motorista adicionado!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleRemoveDriver = async (driver) => {
    const teamRef = doc(db, 'teams', selectedTeam);
    await updateDoc(teamRef, { drivers: arrayRemove(driver) });
    setDrivers(prev => prev.filter(d => d.id !== driver.id));
    setMessage('Motorista removido!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleTransferDriver = async (driver, newTeamName) => {
    const fromRef = doc(db, 'teams', selectedTeam);
    const toRef = doc(db, 'teams', newTeamName);
    await updateDoc(fromRef, { drivers: arrayRemove(driver) });
    await updateDoc(toRef, { drivers: arrayUnion(driver) });
    setDrivers(prev => prev.filter((d) => d.id !== driver.id));
    setMessage(`Transferido para ${newTeamName}`);
    setTimeout(() => setMessage(''), 3000);
  };

  if (!authorized) {
    return (
      <div className="p-6 max-w-md mx-auto text-center">
        <h2 className="text-xl font-bold text-orange-400 mb-4">Área Restrita</h2>
        <input
          type="password"
          value={enteredPassword}
          onChange={(e) => setEnteredPassword(e.target.value)}
          placeholder="Digite a senha"
          className="w-full mb-4 p-3 bg-zinc-700 text-white rounded"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-orange-500 hover:bg-orange-600 text-black font-semibold py-2 rounded"
        >
          Entrar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-orange-400 mb-4">Gestão de Motoristas</h2>

      <div className="mb-6">
        <label className="block mb-2 font-semibold">Equipe:</label>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="w-full p-2 rounded bg-zinc-800 text-white"
        >
          <option value="">Selecione a equipe</option>
          {teams.map((team) => (
            <option key={team.name} value={team.name}>{team.name}</option>
          ))}
        </select>
      </div>

      {selectedTeam && (
        <>
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-orange-300 mb-3">Motoristas de {selectedTeam}</h3>
            {drivers.map((driver) => (
              <div key={driver.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-zinc-800 p-3 rounded mb-2 gap-2">
                <span><strong>{driver.name}</strong> — {driver.model} ({driver.brand})</span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleRemoveDriver(driver)}
                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Remover
                  </button>
                  <select
                    onChange={(e) => e.target.value && handleTransferDriver(driver, e.target.value)}
                    defaultValue=""
                    className="bg-zinc-700 text-white rounded px-2 py-1"
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

          <div className="border border-zinc-700 p-4 rounded bg-zinc-800">
            <h3 className="text-lg font-bold mb-4 text-center text-orange-400">Adicionar Novo Motorista</h3>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Nome"
                value={newDriver.name}
                onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                className="p-2 rounded bg-zinc-700 text-white"
              />
              <input
                type="text"
                placeholder="Modelo"
                value={newDriver.model}
                onChange={(e) => setNewDriver({ ...newDriver, model: e.target.value })}
                className="p-2 rounded bg-zinc-700 text-white"
              />
              <input
                type="text"
                placeholder="Marca"
                value={newDriver.brand}
                onChange={(e) => setNewDriver({ ...newDriver, brand: e.target.value })}
                className="p-2 rounded bg-zinc-700 text-white"
              />
              <button
                onClick={handleAddDriver}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded"
              >
                Adicionar
              </button>
            </div>
          </div>

          {message && (
            <p className="text-center text-green-400 font-semibold mt-4">{message}</p>
          )}
        </>
      )}
    </div>
  );
}
