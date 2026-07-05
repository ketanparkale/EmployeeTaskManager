import { useState } from 'react';
import api from '../api/client';

const reports = [
  { key: 'completed', label: 'Completed Tasks' },
  { key: 'pending', label: 'Pending Tasks' },
  { key: 'employee-wise', label: 'Employee-wise Tasks' },
];

export default function ReportsPage() {
  const [busy, setBusy] = useState('');

  async function download(key: string, format: 'excel' | 'csv') {
    setBusy(`${key}-${format}`);
    try {
      const res = await api.get(`/reports/${key}`, {
        params: { format },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${key}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy('');
    }
  }

  return (
    <div>
      <h2>Reports</h2>
      <p className="muted">Download task reports as Excel or CSV.</p>

      {reports.map((r) => (
        <div className="card" key={r.key}>
          <div className="row-between">
            <strong>{r.label}</strong>
            <div className="actions">
              <button className="btn btn-sm" disabled={busy === `${r.key}-excel`} onClick={() => download(r.key, 'excel')}>
                Excel
              </button>
              <button className="btn btn-light btn-sm" disabled={busy === `${r.key}-csv`} onClick={() => download(r.key, 'csv')}>
                CSV
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
