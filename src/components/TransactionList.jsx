import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Edit2, Trash2, Search, Filter, ArrowDownUp, RefreshCw } from 'lucide-react';
import TransactionForm from './TransactionForm';

export default function TransactionList() {
  const { transactions, deleteTransaction } = useFinance();
  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('DateDesc'); // DateDesc, DateAsc, AmountDesc, AmountAsc, Category

  const categories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return Array.from(cats);
  }, [transactions]);

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    // Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(lowerSearch) || 
        (t.notes && t.notes.toLowerCase().includes(lowerSearch))
      );
    }

    // Filter Type
    if (filterType !== 'All') {
      result = result.filter(t => t.type === filterType);
    }

    // Filter Category
    if (filterCategory !== 'All') {
      result = result.filter(t => t.category === filterCategory);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'DateDesc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'DateAsc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'AmountDesc') return b.amount - a.amount;
      if (sortBy === 'AmountAsc') return a.amount - b.amount;
      if (sortBy === 'Category') return a.category.localeCompare(b.category);
      return 0;
    });

    return result;
  }, [transactions, searchTerm, filterType, filterCategory, sortBy]);

  const handleEdit = (id) => {
    if (editingId === id) setEditingId(null);
    else setEditingId(id);
  };

  return (
    <div className="glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="h2" style={{ margin: 0 }}>Recent Transactions</h2>
        
        {/* Controls Toolbar */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.2rem', width: '200px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: 'auto' }}>
              <option value="All">All Types</option>
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
            
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ width: 'auto' }}>
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: 'auto' }}>
              <option value="DateDesc">Date (Newest)</option>
              <option value="DateAsc">Date (Oldest)</option>
              <option value="AmountDesc">Amount (Highest)</option>
              <option value="AmountAsc">Amount (Lowest)</option>
              <option value="Category">Category (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <p>No transactions found. Add your first transaction above.</p>
        </div>
      ) : filteredAndSortedTransactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <p>No transactions match your search/filter criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {filteredAndSortedTransactions.map(t => (
            <React.Fragment key={t.id}>
              {editingId === t.id ? (
                <TransactionForm existingTransaction={t} onClose={() => setEditingId(null)} />
              ) : (
                <div className="transaction-item glass-panel" style={{ padding: '1rem', border: 'none', background: 'rgba(255,255,255,0.02)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{t.title}</strong>
                      {t.isRecurring && (
                        <span className="badge badge-recurring" title="Recurring Transaction">
                          <RefreshCw size={12} /> Recurring
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span>{new Date(t.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{t.category}</span>
                      {t.notes && (
                        <>
                          <span>•</span>
                          <span style={{ fontStyle: 'italic', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }} className={t.type === 'Income' ? 'text-success' : 'text-danger'}>
                      {t.type === 'Income' ? '+' : '-'}₹{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className={`badge ${t.type === 'Income' ? 'badge-income' : 'badge-expense'}`} style={{ marginTop: '0.25rem' }}>
                      {t.type}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button onClick={() => handleEdit(t.id)} className="btn-icon" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => deleteTransaction(t.id)} className="btn-icon" title="Delete" style={{ color: 'var(--danger)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
