import { useEffect, useState, type FormEvent } from 'react';
import api from '../api/client';
import { useAppSelector } from '../app/hooks';
import type { TaskItem, Employee, Priority, Status } from '../types';

const emptyForm = {
  title: '',
  description: '',
  priority: 'Medium' as Priority,
  status: 'Pending' as Status,
  startDate: '',
  dueDate: '',
  assignedToUserId: 0,
};

export default function TasksPage() {
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'Admin';

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  async function loadTasks() {
    const res = await api.get<TaskItem[]>('/tasks');
    setTasks(res.data);
  }

  useEffect(() => {
    loadTasks();
    if (isAdmin) {
      api.get('/users?pageSize=1000').then((res) => setEmployees(res.data.items));
    }
  }, [isAdmin]);

  function setField(name: keyof typeof form, value: string | number) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function startCreate() {
    setForm({ ...emptyForm, assignedToUserId: isAdmin ? 0 : user!.userId });
    setEditingId(null);
    setError('');
    setShowForm(true);
  }

  function startEdit(task: TaskItem) {
    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      startDate: task.startDate.substring(0, 10),
      dueDate: task.dueDate.substring(0, 10),
      assignedToUserId: task.assignedToUserId,
    });
    setEditingId(task.id);
    setError('');
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (new Date(form.dueDate) < new Date(form.startDate)) {
      setError('Due date must not be earlier than start date.');
      return;
    }

    const payload = {
      ...form,
      assignedToUserId: isAdmin ? form.assignedToUserId : user!.userId,
    };

    try {
      if (editingId) {
        await api.put(`/tasks/${editingId}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      loadTasks();
    } catch (err) {
      const anyErr = err as { response?: { data?: { message?: string } } };
      setError(anyErr.response?.data?.message ?? 'Could not save the task.');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${id}`);
    loadTasks();
  }

  async function viewAttachment(taskId: number) {
    const res = await api.get(`/tasks/${taskId}/attachment`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    window.open(url, '_blank');
  }

  async function handleUpload(taskId: number, file: File) {
    const data = new FormData();
    data.append('file', file);
    try {
      await api.post(`/tasks/${taskId}/attachment`, data);
      loadTasks();
    } catch (err) {
      const anyErr = err as { response?: { data?: { message?: string } } };
      alert(anyErr.response?.data?.message ?? 'Upload failed.');
    }
  }

  return (
    <div>
      <div className="row-between">
        <h2>Tasks</h2>
        <button className="btn" onClick={startCreate}>+ New Task</button>
      </div>

      {showForm && (
        <form className="card" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit Task' : 'New Task'}</h3>

          <div className="form-group">
            <label>Title</label>
            <input value={form.title} onChange={(e) => setField('title', e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setField('description', e.target.value)} rows={2} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select value={form.priority} onChange={(e) => setField('priority', e.target.value)}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setField('status', e.target.value)}>
                <option value="Pending">Pending</option>
                <option value="InProgress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setField('startDate', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setField('dueDate', e.target.value)} required />
            </div>
          </div>

          {isAdmin && (
            <div className="form-group">
              <label>Assign to</label>
              <select
                value={form.assignedToUserId}
                onChange={(e) => setField('assignedToUserId', Number(e.target.value))}
                required
              >
                <option value={0} disabled>Select an employee…</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                ))}
              </select>
            </div>
          )}

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
              <th>Title</th>
              <th>Assignee</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Start</th>
              <th>Due</th>
              <th>File</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.assignedToName}</td>
                <td><span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span></td>
                <td><span className={`badge badge-${task.status.toLowerCase()}`}>{task.status}</span></td>
                <td>{task.startDate.substring(0, 10)}</td>
                <td>{task.dueDate.substring(0, 10)}</td>
                <td>
                  {task.attachmentPath ? (
                    <button className="btn btn-light btn-sm" onClick={() => viewAttachment(task.id)}>View</button>
                  ) : (
                    <label className="btn btn-light btn-sm" style={{ cursor: 'pointer' }}>
                      Attach
                        <input
                          type="file"
                          style={{ display: 'none' }}
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => e.target.files?.[0] && handleUpload(task.id, e.target.files[0])}
                        />
                    </label>
                  )}
                </td>
                <td>
                  <div className="actions">
                    {task.status !== 'Completed' && (
                      <button className="btn btn-light btn-sm" onClick={() => startEdit(task)}>Edit</button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr><td colSpan={8} className="muted">No tasks yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
