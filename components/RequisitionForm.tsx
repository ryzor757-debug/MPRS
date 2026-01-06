
import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Save, Download, AlertCircle, Sparkles, Eraser } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MPRSItem, MPRSStatus, Requisition, HistoryItem } from '../types';
import { UNITS, DEPARTMENTS, GRID_COLUMNS } from '../constants';
import { suggestSpecification } from '../services/geminiService';
import { generatePDF } from '../utils/pdfGenerator';

const initialRow = (): MPRSItem => ({
  id: crypto.randomUUID(),
  mprs_no: '',
  mprs_date: new Date().toISOString().split('T')[0],
  item_name: '',
  specification: '',
  quantity: '',
  unit: 'Pcs',
  purpose: '',
  lead_time: '',
  item_code: '',
  remarks: '',
  status: MPRSStatus.PENDING,
  created_at: new Date().toISOString()
});

export default function RequisitionForm() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<MPRSItem[]>([initialRow(), initialRow(), initialRow()]);
  const [meta, setMeta] = useState({
    title: 'Requisition for Materials',
    department: DEPARTMENTS[0],
    mprsDate: new Date().toISOString().split('T')[0]
  });
  const [mprsNo, setMprsNo] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [historyPopup, setHistoryPopup] = useState<{show: boolean, x: number, y: number, items: HistoryItem[], itemName: string}>({
    show: false, x: 0, y: 0, items: [], itemName: ''
  });

  const updateRow = (id: string, field: keyof MPRSItem, value: any) => {
    setRows(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const addRow = () => setRows(prev => [...prev, initialRow()]);
  
  const clearGrid = () => {
    if (window.confirm("Are you sure you want to clear all rows?")) {
      setRows([initialRow(), initialRow(), initialRow()]);
    }
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(prev => prev.filter(row => row.id !== id));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasteData = e.clipboardData.getData('text');
    if (!pasteData || !pasteData.includes('\t')) return;

    e.preventDefault();
    const lines = pasteData.split(/\r?\n/).filter(line => line.trim() !== '');
    
    const newRows: MPRSItem[] = lines.map(line => {
      const columns = line.split('\t');
      return {
        ...initialRow(),
        item_name: columns[0] || '',
        specification: columns[1] || '',
        quantity: columns[2] || '',
        unit: UNITS.includes(columns[3]) ? columns[3] : 'Pcs',
        purpose: columns[4] || '',
        lead_time: columns[5] || '',
        item_code: columns[6] || '',
        remarks: columns[7] || '',
      };
    });

    setRows(prev => {
      const filteredPrev = prev.filter(r => r.item_name.trim() !== '');
      return [...filteredPrev, ...newRows];
    });
  };

  const handleSave = async () => {
    const validRows = rows.filter(r => r.item_name.trim() && r.quantity !== '');
    
    if (validRows.length === 0) {
      alert("Please fill at least one row with Item Name and Quantity.");
      return;
    }

    setIsSaving(true);

    try {
      const requisition: Requisition = {
        id: crypto.randomUUID(),
        mprs_no: mprsNo.trim(),
        mprs_date: meta.mprsDate,
        items: validRows.map(r => ({ 
          ...r, 
          mprs_no: mprsNo.trim(),
          mprs_date: meta.mprsDate 
        })),
        status: MPRSStatus.PENDING,
        title: meta.title,
        department: meta.department
      };

      let historyArray: Requisition[] = [];
      const savedData = localStorage.getItem('samuda_mprs_history');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (Array.isArray(parsed)) {
            historyArray = parsed;
          }
        } catch (e) {
          console.warn("Storage corruption detected, starting fresh");
        }
      }

      const newHistory = [requisition, ...historyArray];
      localStorage.setItem('samuda_mprs_history', JSON.stringify(newHistory));
      
      await new Promise(r => setTimeout(r, 800));
      setIsSaving(false);
      navigate('/history');
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save requisition.");
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    const requisition: Requisition = {
      id: 'preview',
      mprs_no: mprsNo.trim(),
      mprs_date: meta.mprsDate,
      items: rows.filter(r => r.item_name),
      status: MPRSStatus.PENDING,
      title: meta.title,
      department: meta.department
    };
    generatePDF(requisition);
  };

  const handleItemNameFocus = (e: React.FocusEvent<HTMLInputElement>, row: MPRSItem) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const saved = localStorage.getItem('samuda_mprs_history');
    if (!saved) return;
    
    try {
      const history: Requisition[] = JSON.parse(saved);
      const matches: HistoryItem[] = [];
      
      history.forEach((req) => {
        req.items.forEach(item => {
          if (item.item_name.toLowerCase() === row.item_name.toLowerCase() && item.item_name) {
            matches.push({ date: item.mprs_date, quantity: item.quantity, purpose: item.purpose });
          }
        });
      });

      if (matches.length > 0) {
        setHistoryPopup({
          show: true,
          x: rect.left,
          y: rect.bottom + window.scrollY,
          items: matches.slice(0, 3),
          itemName: row.item_name
        });
      }
    } catch (e) {}
  };

  const handleItemNameBlur = () => {
    setTimeout(() => setHistoryPopup(prev => ({ ...prev, show: false })), 200);
  };

  const handleSuggestSpec = async (id: string, itemName: string) => {
    if (!itemName) return;
    const spec = await suggestSpecification(itemName);
    if (spec) updateRow(id, 'specification', spec);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Material Purchase Requisition</h1>
            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-bold uppercase border border-blue-100">Draft</span>
          </div>
          <p className="text-sm text-slate-500">Form to request construction materials for Zone-16 MSEZ.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Preview PDF</span>
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <span className="animate-spin mr-2">●</span> : <Save size={18} />}
            {isSaving ? 'Submitting...' : 'Submit Requisition'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Requisition Title</label>
          <input 
            value={meta.title}
            onChange={e => setMeta(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department</label>
          <select 
            value={meta.department}
            onChange={e => setMeta(prev => ({ ...prev, department: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">MPRS No (Manual)</label>
          <input 
            value={mprsNo} 
            onChange={e => setMprsNo(e.target.value)}
            placeholder="Optional..."
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">MPRS Date</label>
          <input 
            type="date"
            value={meta.mprsDate}
            onChange={e => setMeta(prev => ({ ...prev, mprsDate: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div 
        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
        onPaste={handlePaste}
      >
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-3 py-3 text-left w-12 text-slate-400 font-medium">Sl</th>
                {GRID_COLUMNS.map(col => (
                  <th key={col.key} className="px-3 py-3 text-left font-semibold text-slate-700 border-l border-slate-200" style={{ width: col.width }}>
                    {col.label}
                  </th>
                ))}
                <th className="px-3 py-3 w-12 border-l border-slate-200"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 group">
                  <td className="px-3 py-2 text-center text-slate-400 font-mono text-xs">{index + 1}</td>
                  <td className="px-2 py-1.5 border-l border-slate-200">
                    <div className="relative flex items-center gap-1">
                      <input 
                        value={row.item_name}
                        onChange={e => updateRow(row.id, 'item_name', e.target.value)}
                        onFocus={e => handleItemNameFocus(e, row)}
                        onBlur={handleItemNameBlur}
                        placeholder="Type item..."
                        className="w-full px-2 py-1 bg-transparent border-none focus:ring-0 focus:outline-none placeholder-slate-300"
                      />
                      {row.item_name && (
                        <button 
                          onClick={() => handleSuggestSpec(row.id, row.item_name)}
                          className="p-1 text-slate-300 hover:text-blue-500 transition-colors"
                          title="Auto-fill spec"
                        >
                          <Sparkles size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-1.5 border-l border-slate-200">
                    <input 
                      value={row.specification}
                      onChange={e => updateRow(row.id, 'specification', e.target.value)}
                      className="w-full px-2 py-1 bg-transparent border-none focus:ring-0 focus:outline-none placeholder-slate-300"
                    />
                  </td>
                  <td className="px-2 py-1.5 border-l border-slate-200">
                    <input 
                      type="number"
                      value={row.quantity}
                      onChange={e => updateRow(row.id, 'quantity', e.target.value)}
                      className="w-full px-2 py-1 bg-transparent border-none focus:ring-0 focus:outline-none placeholder-slate-300 font-medium text-slate-900"
                    />
                  </td>
                  <td className="px-2 py-1.5 border-l border-slate-200">
                    <select 
                      value={row.unit}
                      onChange={e => updateRow(row.id, 'unit', e.target.value)}
                      className="w-full px-2 py-1 bg-transparent border-none focus:ring-0 focus:outline-none appearance-none"
                    >
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-1.5 border-l border-slate-200">
                    <input 
                      value={row.purpose}
                      onChange={e => updateRow(row.id, 'purpose', e.target.value)}
                      className="w-full px-2 py-1 bg-transparent border-none focus:ring-0 focus:outline-none placeholder-slate-300"
                    />
                  </td>
                  <td className="px-2 py-1.5 border-l border-slate-200">
                    <input 
                      type="number"
                      value={row.lead_time}
                      onChange={e => updateRow(row.id, 'lead_time', e.target.value)}
                      className="w-full px-2 py-1 bg-transparent border-none focus:ring-0 focus:outline-none placeholder-slate-300"
                    />
                  </td>
                  <td className="px-2 py-1.5 border-l border-slate-200">
                    <input 
                      value={row.item_code}
                      onChange={e => updateRow(row.id, 'item_code', e.target.value)}
                      className="w-full px-2 py-1 bg-transparent border-none focus:ring-0 focus:outline-none placeholder-slate-300 font-mono text-xs"
                    />
                  </td>
                  <td className="px-2 py-1.5 border-l border-slate-200">
                    <input 
                      value={row.remarks}
                      onChange={e => updateRow(row.id, 'remarks', e.target.value)}
                      className="w-full px-2 py-1 bg-transparent border-none focus:ring-0 focus:outline-none placeholder-slate-300"
                    />
                  </td>
                  <td className="px-2 py-1.5 border-l border-slate-200 text-center">
                    <button 
                      onClick={() => removeRow(row.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <div className="flex gap-2">
            <button 
              onClick={addRow}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Plus size={18} />
              Add Row
            </button>
            <button 
              onClick={clearGrid}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Eraser size={18} />
              Clear Grid
            </button>
          </div>
          <div className="flex gap-4 text-xs font-medium text-slate-500">
             <div className="hidden sm:flex items-center gap-1.5">
                <AlertCircle size={14} className="text-amber-500" />
                <span>Quantity is required for all items</span>
             </div>
             <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span>Draft autosaved to local storage</span>
             </div>
          </div>
        </div>
      </div>

      {historyPopup.show && (
        <div 
          className="fixed z-50 w-64 bg-white border border-slate-200 shadow-xl rounded-xl p-4 animate-in slide-in-from-top-2 duration-200"
          style={{ top: historyPopup.y + 4, left: historyPopup.x }}
        >
          <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
            <Sparkles size={16} className="text-blue-500" />
            <span className="text-xs font-bold text-slate-900 uppercase">Recent Orders: {historyPopup.itemName}</span>
          </div>
          <div className="space-y-3">
            {historyPopup.items.map((item, i) => (
              <div key={i} className="text-[11px] space-y-0.5 border-l-2 border-slate-100 pl-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">{item.date}</span>
                  <span className="font-bold text-blue-600">{item.quantity} Qty</span>
                </div>
                <div className="text-slate-600 truncate">{item.purpose}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
