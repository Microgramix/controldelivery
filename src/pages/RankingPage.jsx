import React, { useState, useEffect, useMemo } from 'react';
import teamsData from '../teamsData.json';
import RankingSection from '../components/RankingSection/RankingSection';
import styles from './RankingPage.module.scss';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase/firebase';
import DatePicker from 'react-datepicker';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

export default function RankingPage() {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [recordsByDate, setRecordsByDate] = useState({});
  const [ranking, setRanking] = useState([]);
  const weeklyGoal = 530;

  const teamData = useMemo(
    () => teamsData.teams.find((team) => team.name === selectedTeam) || { drivers: [] },
    [selectedTeam]
  );

  // Carrega registros da equipe
  useEffect(() => {
    if (selectedTeam) {
      const fetchTeamRecords = async () => {
        const teamDocRef = doc(db, 'records', selectedTeam);
        const docSnap = await getDoc(teamDocRef);
        setRecordsByDate(docSnap.exists() ? docSnap.data() : {});
      };
      fetchTeamRecords();
    }
  }, [selectedTeam]);

  // Atualiza ranking quando seleciona intervalo de datas
  useEffect(() => {
    if (!selectedTeam || !startDate || !endDate) {
      setRanking([]);
      return;
    }

    // Filtra registros pelo intervalo de datas
    const filteredRecords = Object.entries(recordsByDate)
      .filter(([date]) => {
        const recordDate = new Date(date);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return recordDate >= start && recordDate <= end;
      })
      .map(([, records]) => records);

    // Calcula totais por motorista
    const totals = teamData.drivers.reduce((acc, driver) => {
      acc[driver.name] = filteredRecords.reduce((sum, rec) => sum + (rec[driver.name] || 0), 0);
      return acc;
    }, {});

    // Ordena o ranking
    const sorted = Object.entries(totals)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    setRanking(sorted);
  }, [selectedTeam, startDate, endDate, recordsByDate, teamData.drivers]);

  const totalDeliveries = ranking.reduce((sum, { count }) => sum + count, 0);
  const progressPercent = Math.min((totalDeliveries / weeklyGoal) * 100, 100);

  // Formata o intervalo de datas para exibição
  const formatDateRange = () => {
    if (!startDate || !endDate) return 'Selecione um período';
    return `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`;
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Ranking de Entregas</h1>
      
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Equipe:</label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className={styles.select}
          >
            <option value="">Selecione a equipe</option>
            {teamsData.teams.map((team) => (
              <option key={team.name} value={team.name}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
        
        {selectedTeam && (
          <div className={styles.filterGroup}>
            <label>Período:</label>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => {
                setDateRange(update);
              }}
              isClearable
              locale={ptBR}
              dateFormat="dd/MM/yyyy"
              placeholderText="Selecione datas"
              className={styles.datePicker}
              maxDate={new Date()}
              minDate={subDays(new Date(), 365)}
              calendarClassName={styles.calendar}
              monthsShown={1}     // Mostra apenas 1 mês
              inline             // Exibe o calendário diretamente (sem popup)
              fixedHeight        // Mantém altura consistente
              withPortal={false} // Remove o modal grande
              shouldCloseOnSelect
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
          </div>
        )}
      </div>

      {selectedTeam && (
        <RankingSection
          ranking={ranking}
          totalDeliveries={totalDeliveries}
          progressPercent={progressPercent}
          weeklyGoal={weeklyGoal}
          periodLabel={formatDateRange()}
        />
      )}
    </div>
  );
}
