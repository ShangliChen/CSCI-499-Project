import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const [counselors, setCounselors] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const secret = localStorage.getItem('adminSecret');
    if (!secret) {
      navigate('/admin-login');
      return;
    }
    const fetchData = async () => {
      try {
        const qs = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : '';
        const res = await fetch(`http://localhost:5000/api/admin/counselors${qs}`, {
          headers: { 'x-admin-secret': secret },
        });
        const data = await res.json();
        if (data.success) {
          setCounselors(data.data);
        } else {
          setMessage(data.message || 'Failed to load counselors');
        }
      } catch (err) {
        setMessage('Failed to load counselors');
      }
    };
    fetchData();
  }, [navigate, statusFilter]);

  const logout = () => {
    localStorage.removeItem('adminSecret');
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen bg-[#f0fff0] p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Administrator Panel</h1>
          <button onClick={logout} className="text-sm text-gray-700 hover:underline">Logout</button>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <label className="text-sm">Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {message && <p className="mb-4 text-red-600 text-sm">{message}</p>}

        <ul className="divide-y">
          {counselors.map((c) => (
            <li key={c._id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-gray-600">{c.email} · {c.school_id}</div>
                <div className="text-xs text-gray-500">Status: {c.verificationStatus || 'n/a'}</div>
              </div>
              <button
                onClick={() => navigate(`/admin/counselors/${c._id}`)}
                className="text-[#98FF98] hover:underline text-sm"
              >
                Review
              </button>
            </li>
          ))}
          {counselors.length === 0 && (
            <li className="py-6 text-center text-gray-600 text-sm">No counselors found</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default AdminDashboard;

