
import React, { useState, useEffect } from 'react';
import { Search, Download, Filter, FileSpreadsheet, ChevronRight, X, Printer, Package, Calendar, User, Building2 } from 'lucide-react';
import { Requisition, MPRSStatus, MPRSItem } from '../types';
import { generatePDF } from '../utils/pdfGenerator';

const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default function OrderHistory() {
  const [history, setHistory] = useState<Requisition[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReq, setSelectedReq] = useState<Requisition | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('samuda_mprs_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const filteredHistory = history.filter(h => 
    h.mprs_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.items.some(i => i.item_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDownload = (e: React.MouseEvent, req: Requisition) => {
    e.stopPropagation(); // Prevent opening the modal
    generatePDF(req);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Requisition History</h1>
          <p className="text-slate-500">Track and manage all purchase requests for Unit-1.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by MPRS # or Item..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 transition-all"
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">MPRS No</th>
                <th className="px-6 py-4">Title / Items</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length > 0 ? filteredHistory.map((req) => (
                <tr 
                  key={req.mprs_no} 
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  onClick={() => setSelectedReq(req)}
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-blue-600 font-bold">{req.mprs_no}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">{req.title}</p>
                      <p className="text-xs text-slate-500 truncate max-w-xs">
                        {req.items.length} items: {req.items.slice(0, 3).map(i => i.item_name).join(', ')}{req.items.length > 3 ? '...' : ''}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {req.mprs_date}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      req.status === MPRSStatus.APPROVED ? 'bg-emerald-100 text-emerald-700' :
                      req.status === MPRSStatus.PENDING ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={(e) => handleDownload(e, req)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Download PDF"
                      >
                        <Download size={18} />
                      </button>
                      <div className="p-2 text-slate-300 group-hover:text-slate-900 transition-colors">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                    <FileSpreadsheet size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-lg">No records found</p>
                    <p className="text-sm">Try adjusting your search filters or create a new requisition.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail View Modal */}
      <Modal isOpen={!!selectedReq} onClose={() => setSelectedReq(null)}>
        {selectedReq && (
          <>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm">
                  <Package size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedReq.mprs_no}</h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Requisition Archive</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => generatePDF(selectedReq)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all text-sm font-semibold shadow-sm"
                >
                  <Printer size={16} />
                  Download PDF
                </button>
                <button 
                  onClick={() => setSelectedReq(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              {/* Meta Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400"><Calendar size={18} /></div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</span>
                    <span className="text-sm font-bold text-slate-900">{selectedReq.mprs_date}</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400"><Building2 size={18} /></div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</span>
                    <span className="text-sm font-bold text-slate-900">{selectedReq.department}</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400"><User size={18} /></div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      selectedReq.status === MPRSStatus.APPROVED ? 'bg-emerald-100 text-emerald-700' :
                      selectedReq.status === MPRSStatus.PENDING ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {selectedReq.status}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Material Line Items</h3>
                   <span className="text-[10px] font-bold text-slate-400">{selectedReq.items.length} TOTAL ITEMS</span>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                        <th className="px-4 py-3 w-12 text-center">#</th>
                        <th className="px-4 py-3">Item Name</th>
                        <th className="px-4 py-3">Specification</th>
                        <th className="px-4 py-3 text-center">Qty</th>
                        <th className="px-4 py-3">Unit</th>
                        <th className="px-4 py-3">Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedReq.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 text-center text-slate-400 font-mono text-xs">{idx + 1}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{item.item_name}</td>
                          <td className="px-4 py-3 text-slate-600 text-xs italic">{item.specification || '—'}</td>
                          <td className="px-4 py-3 text-center font-bold text-blue-600">{item.quantity}</td>
                          <td className="px-4 py-3 text-slate-600">{item.unit}</td>
                          <td className="px-4 py-3 text-slate-600 truncate max-w-[150px]">{item.purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-right">
                <button 
                  onClick={() => setSelectedReq(null)}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm font-bold"
                >
                  Close Window
                </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
