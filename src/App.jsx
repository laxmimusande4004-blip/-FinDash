import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { FinanceProvider } from './context/FinanceContext';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import BudgetOverview from './components/BudgetOverview';
import { LayoutDashboard, ListOrdered, Wallet } from 'lucide-react';

function Sidebar() {
  return (
    <aside className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: 'fit-content', position: 'sticky', top: '2rem' }}>
      <div>
        <h1 className="h1" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.75rem' }}>
          <Wallet color="var(--accent-primary)" size={32} />
          FinDash
        </h1>
        <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Your personal finance tracker</p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `btn ${isActive ? 'btn-primary' : ''}`}
          style={{ justifyContent: 'flex-start', background: 'transparent' }}
        >
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        <NavLink 
          to="/transactions" 
          className={({ isActive }) => `btn ${isActive ? 'btn-primary' : ''}`}
          style={{ justifyContent: 'flex-start', background: 'transparent' }}
        >
          <ListOrdered size={20} /> Transactions
        </NavLink>
      </nav>

      <div style={{ marginTop: 'auto' }}>
        <BudgetOverview />
      </div>
    </aside>
  );
}

function TransactionsPage() {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {!showAddForm ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
            + Add New Transaction
          </button>
        </div>
      ) : (
        <TransactionForm onClose={() => setShowAddForm(false)} />
      )}
      
      <TransactionList />
    </div>
  );
}

function App() {
  return (
    <FinanceProvider>
      <Router>
        <div className="app-container">
          <Sidebar />
          
          <main style={{ minHeight: '80vh' }}>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </FinanceProvider>
  );
}

export default App;
