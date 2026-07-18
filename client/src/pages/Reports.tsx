import React, { useState, useEffect, useRef } from 'react';
import { Download, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import Skeleton from '../components/ui/Skeleton';
import api from '../services/api';

export default function Reports() {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, savingRate: 0 });
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, trendRes] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/reports/trend')
      ]);
      setSummary(sumRes.data);
      setTrendData(trendRes.data);
    } catch (error) {
      console.error('Error fetching reports', error);
      toast.error('Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('FinanceTracker-Laporan.pdf');
      toast.success('Laporan PDF berhasil diunduh');
    } catch (error) {
      console.error('Failed to export PDF', error);
      toast.error('Gagal mengekspor PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/reports/export/excel', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_Keuangan_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('Data Excel berhasil diunduh');
    } catch (error) {
      console.error('Failed to export Excel', error);
      toast.error('Gagal mengekspor Excel');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h1>
          <p className="text-gray-500">Ringkasan aktivitas keuangan Anda</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-4 w-4 text-red-500" /> Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <Download className="h-4 w-4" /> Export Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <Skeleton className="h-6 w-1/4 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/5" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div ref={reportRef} className="space-y-6 bg-gray-50 p-4 -m-4 rounded-xl">
          {/* Ringkasan */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500">Pemasukan Bulan Ini</h3>
              <p className="text-2xl font-bold text-emerald-500 mt-2">Rp {summary.totalIncome.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500">Pengeluaran Bulan Ini</h3>
              <p className="text-2xl font-bold text-red-500 mt-2">Rp {summary.totalExpense.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500">Saldo Bersih</h3>
              <p className="text-2xl font-bold text-blue-500 mt-2">Rp {summary.balance.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500">Saving Rate</h3>
              <p className="text-2xl font-bold text-indigo-500 mt-2">{summary.savingRate}%</p>
            </div>
          </div>

          {/* Tren Pemasukan & Pengeluaran */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Tren Pemasukan & Pengeluaran (12 Bulan)</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} width={80} tickFormatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                  <Tooltip 
                    formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="Pemasukan" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Pengeluaran" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
