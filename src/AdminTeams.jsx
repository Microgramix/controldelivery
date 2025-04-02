import React, { useState, useEffect, useMemo } from 'react';
import { db } from './Firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import teamsData from './teamsData.json';
import styles from './AdminTeams.module.scss';

const ADMIN_PASSWORD = 'admin123';

export default function AdminTeams() {
  const [enteredPassword, setEnteredPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const teamData = useMemo(
    () => teamsData.teams.find((team) => team.name === selectedTeam) || { drivers: [] },
    [selectedTeam]
  );

  const handleLogin = () => {
    if (enteredPassword === ADMIN_PASSWORD) {
      setAuthorized(true);
    } else {
      alert('Senha incorreta');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedTeam) return;
      setLoading(true);
      const teamDocRef = doc(db, 'records', selectedTeam);
      const snap = await getDoc(teamDocRef);
      if (snap.exists()) {
        setRecords(snap.data());
      } else {
        setRecords({});
      }
      setLoading(false);
    };
    fetchData();
  }, [selectedTeam]);

  const handleChange = (driverName, value) => {
    setRecords((prev) => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        [driverName]: Number(value)
      }
    }));
  };

  const handleSave = async () => {
    try {
      const teamDocRef = doc(db, 'records', selectedTeam);
      await setDoc(teamDocRef, { [selectedDate]: records[selectedDate] }, { merge: true });
      setMessage('Registros atualizados com sucesso!');
    } catch (err) {
      setMessage('Erro ao salvar os dados.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  if (!authorized) {
    return (
      <div className={styles.loginContainer}>
        <h2>Área Restrita</h2>
        <input
          type="password"
          value={enteredPassword}
          onChange={(e) => setEnteredPassword(e.target.value)}
          placeholder="Digite a senha"
        />
        <button onClick={handleLogin}>Entrar</button>
      </div>
    );
  }

  return (
    <div className={styles.editorContainer}>
      <h2>Edição de Entregas por Data</h2>

      <div className={styles.fieldGroup}>
        <label>Equipe:</label>
        <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
          <option value="">Selecione a equipe</option>
          {teamsData.teams.map((team) => (
            <option key={team.name} value={team.name}>{team.name}</option>
          ))}
        </select>
      </div>

      {selectedTeam && (
        <>
          <div className={styles.fieldGroup}>
            <label>Data:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {loading ? (
            <p>Carregando...</p>
          ) : (
            <div className={styles.driversList}>
              {teamData.drivers.map((driver) => {
                const current = records[selectedDate]?.[driver.name] || 0;
                return (
                  <div key={driver.name} className={styles.driverRow}>
                    <span><strong>{driver.name}</strong></span>
                    <span style={{ marginLeft: '10px', color: '#888' }}>
                      Atual: {current} entregas
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={current}
                      onChange={(e) => handleChange(driver.name, e.target.value)}
                      placeholder="Entregas"
                      style={{ marginLeft: '10px', width: '80px' }}
                    />
                  </div>
                );
              })}
            </div>
          )}

          <button onClick={handleSave}>Salvar Alterações</button>
          {message && <p className={styles.message}>{message}</p>}
        </>
      )}
    </div>
  );
}
