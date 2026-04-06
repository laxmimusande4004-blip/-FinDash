import React, { createContext, useContext, useState, useEffect } from 'react';

const FinanceContext = createContext();

export function FinanceProvider({ children }) {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('fin-transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem('fin-budget');
    return saved ? JSON.parse(saved) : 50000;
  });

  useEffect(() => {
    localStorage.setItem('fin-transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('fin-budget', JSON.stringify(budget));
  }, [budget]);

  const addTransaction = (transaction) => {
    setTransactions(prev => [{...transaction, id: crypto.randomUUID()}, ...prev]);
  };

  const editTransaction = (id, updatedTransaction) => {
    setTransactions(prev => prev.map(t => (t.id === id ? { ...t, ...updatedTransaction } : t)));
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const updateBudget = (amount) => {
    setBudget(amount);
  };

  // Helper selectors
  const totalIncome = transactions.reduce((acc, t) => t.type === 'Income' ? acc + Number(t.amount) : acc, 0);
  const totalExpenses = transactions.reduce((acc, t) => t.type === 'Expense' ? acc + Number(t.amount) : acc, 0);
  const netBalance = totalIncome - totalExpenses;

  // Calculate top category
  const expenseCategories = transactions
    .filter(t => t.type === 'Expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});
  
  const topCategory = Object.entries(expenseCategories).sort((a, b) => b[1] - a[1])[0] || ['None', 0];

  return (
    <FinanceContext.Provider value={{
      transactions,
      budget,
      addTransaction,
      editTransaction,
      deleteTransaction,
      updateBudget,
      totalIncome,
      totalExpenses,
      netBalance,
      topCategory
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  return useContext(FinanceContext);
}
