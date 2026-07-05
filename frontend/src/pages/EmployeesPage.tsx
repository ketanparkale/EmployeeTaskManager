import { useEffect, useState, type FormEvent } from 'react';
import api from '../api/client';
import type { Employee, PagedResult } from '../types';

const emptyForm = {
  fullName: '',
  email: '',
  password: '',
  department: '',
  designation: '',
};

export default function EmployeesPage() {
  const [data, setData] = useState<PagedResult<Employee> | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  async function loadEmployees() {
    const res = await api.get<PagedResult<Employee>>('/users', {
      params: { search, sortBy, sortDir, page, pageSize },
    });
    setData(res.data);
  }

  useEffect(() => {
    loadEmployees();
  }, [search, sortBy, sortDir, page]);

  function applySearch(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  function toggleSort(column: string) {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  }

  function setField(name: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function startCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
    setShowForm(true);
  }

  function startEdit(emp: Employee) {
    setForm({
      fullName: emp.fullName,
      email: emp.email,
      password: '',
      department: emp.department,
      designation: emp.designation,
    });
    setEditingId(emp.id);
    setError('');
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        const { fullName, email, department, designation } = form;
        await api.put(`/users/${editingId}`, { fullName, email, department, designation });
      } else {
        await api.post('/users', form);
      }
      setShowForm(false);
      loadEmployees();
    } catch (err) {
      const anyErr = err as { response?: { data?: { message?: string } } };
      setError(anyErr.response?.data?.message ?? 'Could not save the employee.');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this employee?')) return;
    await api.delete(`/users/${id}`);
    loadEmployees();
  }

  const arrow = (col: string) => (sortBy === col ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '');

  return (
    <div>
      <div className="row-between">
        <h2>Employees</h2>
        <button className="btn" onClick={startCreate}>+ New Employee</button>
      </div>

      <form className="toolbar" onSubmit={applySearch}>
        <input
          placeholder="Search name, email, department…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{ maxWidth: 300 }}
        />
        <button className="btn" type="submit">Search</button>
      </form>

      {showForm && (
        <form className="card" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit Employee' : 'New Employee'}</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Full name</label>
              <input value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} required />
            </div>
          </div>

          {!editingId && (
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={form.password} onChange={(e) => setField('password', e.target.value)} required />
              <div className="muted" style={{ fontSize: '0.8rem' }}>Min 8 chars, with uppercase, lowercase, and a number.</div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <input value={form.department} onChange={(e) => setField('department', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Designation</label>
              <input value={form.designation} onChange={(e) => setField('designation', e.target.value)} required />
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          <div className="actions" style={{ marginTop: '0.5rem' }}>
            <button className="btn" type="submit">{editingId ? 'Update' : 'Create'}</button>
            <button className="btn btn-light" type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th onClick={() => toggleSort('name')}>Name{arrow('name')}</th>
              <th onClick={() => toggleSort('email')}>Email{arrow('email')}</th>
              <th onClick={() => toggleSort('department')}>Department{arrow('department')}</th>
              <th onClick={() => toggleSort('designation')}>Designation{arrow('designation')}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.fullName}</td>
                <td>{emp.email}</td>
                <td>{emp.department}</td>
                <td>{emp.designation}</td>
                <td>
                  <div className="actions">
                    <button className="btn btn-light btn-sm" onClick={() => startEdit(emp)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {data && data.items.length === 0 && (
              <tr><td colSpan={5} className="muted">No employees found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="toolbar" style={{ marginTop: '1rem' }}>
          <button className="btn btn-light btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
          <span className="muted">Page {data.page} of {data.totalPages} ({data.totalCount} total)</span>
          <button className="btn btn-light btn-sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
