import React from 'react';
import { motion } from 'framer-motion';
import styles from './RankingSection.module.scss';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const RankingSection = ({
  ranking,
  totalDeliveries,
  progressPercent,
  weeklyGoal,
  periodLabel
}) => {
  // Prepara dados para o gráfico
  const chartData = ranking.map((item, index) => ({
    name: item.name,
    deliveries: item.count,
    rank: index + 1
  }));

  return (
    <div className={styles.rankingContainer}>
      <h2 className={styles.periodTitle}>Resultados: {periodLabel}</h2>
      
      {/* Gráfico de barras */}
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#AAA' }}
              tickFormatter={(value) => value.split(' ')[0]} // Mostra apenas o primeiro nome
            />
            <YAxis tick={{ fill: '#AAA' }} />
            <Bar 
              dataKey="deliveries" 
              fill="#ce8d00" 
              animationDuration={1500}
              label={{ 
                position: 'top', 
                fill: '#FFF',
                fontSize: 12
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Lista simplificada */}
      <div className={styles.rankingList}>
        {ranking.map((driver, index) => (
          <motion.div 
            key={driver.name}
            className={styles.driverCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={styles.rank}>{index + 1}º</div>
            <div className={styles.driverInfo}>
              <span className={styles.driverName}>{driver.name}</span>
              <span className={styles.deliveryCount}>{driver.count} entregas</span>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Progresso da meta */}
      <div className={styles.goalProgress}>
        <h3>Progresso da Meta Semanal</h3>
        <div className={styles.progressBarContainer}>
          <motion.div 
            className={styles.progressBar}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1 }}
          >
            {progressPercent.toFixed(0)}%
          </motion.div>
        </div>
        <p>
          {totalDeliveries} de {weeklyGoal} entregas ({Math.round(progressPercent)}%)
        </p>
      </div>
    </div>
  );
};

export default RankingSection;