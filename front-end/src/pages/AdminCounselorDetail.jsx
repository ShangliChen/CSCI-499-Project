import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function AdminCounselorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [counselor, setCounselor] = useState(null);
  const [message, setMessage] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    const secret = localStorage.getItem('adminSecret');
    if (!secret) {
      navigate('/admin-login');
      return;
    }
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/counselors/${id}`, {
          headers: { 'x-admin-secret': secret },
        });
        const data = await res.json();
        if (data.success) setCounselor(data.data);
        else setMessage(data.message || 'Unable to load counselor');
      } catch (err) {
        setMessage('Unable to load counselor');
      }
    };
    load();
  }, [id, navigate]);

  const approve = async () => {
    const secret = localStorage.getItem('adminSecret');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/counselors/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': secret,
        },
      });
      const data = await res.json();
      if (data.success) {
        setCounselor(data.data);
        setMessage('Counselor approved');
      } else setMessage(data.message || 'Failed to approve');
    } catch (err) {
      setMessage('Failed to approve');
    }
  };

  const reject = async () => {
    const secret = localStorage.getItem('adminSecret');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/counselors/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': secret,
        },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) {
        setCounselor(data.data);
        setMessage('Counselor rejected');
        setRejecting(false);
      } else setMessage(data.message || 'Failed to reject');
    } catch (err) {
      setMessage('Failed to reject');
    }
  };

  if (!counselor) {
    return (
      <div className="min-h-screen bg-[#f0fff0] p-6">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
          {message ? <p className="text-red-600">{message}</p> : <p>Loading...</p>}
        </div>
      </div>
    );
  }

  const imageUrl = (p) => (p ? `${API_BASE_URL}${p}` : null);

  return (
    <div className="min-h-screen bg-[#f0fff0] p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
        <button className="text-sm text-gray-700 hover:underline" onClick={() => navigate('/admin')}>&larr; Back</button>
        <h1 className="text-2xl font-bold mt-2 mb-4">Counselor Review</h1>

        {message && <p className="mb-4 text-sm text-gray-700">{message}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="font-semibold">Name</div>
            <div className="text-gray-700">{counselor.name}</div>
          </div>
          <div>
            <div className="font-semibold">Email</div>
            <div className="text-gray-700">{counselor.email}</div>
          </div>
          <div>
            <div className="font-semibold">School ID</div>
            <div className="text-gray-700">{counselor.school_id}</div>
          </div>
          <div>
            <div className="font-semibold">License #</div>
            <div className="text-gray-700">{counselor.license || '-'}</div>
          </div>
          <div>
            <div className="font-semibold">Status</div>
            <div className="text-gray-700">{counselor.verificationStatus || '-'}</div>
          </div>
          {counselor.verificationStatus === 'rejected' && (
            <div className="md:col-span-2">
              <div className="font-semibold">Rejection Reason</div>
              <div className="text-gray-700">{counselor.rejectionReason || '-'}</div>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="font-semibold mb-2">ID Picture</div>
            {imageUrl(counselor.idPicture) ? (
              <img src={imageUrl(counselor.idPicture)} alt="ID" className="rounded border" />
            ) : (
              <div className="text-sm text-gray-500">No image uploaded</div>
            )}
          </div>
          <div>
            <div className="font-semibold mb-2">License Picture</div>
            {imageUrl(counselor.licensePicture) ? (
              <img src={imageUrl(counselor.licensePicture)} alt="License" className="rounded border" />
            ) : (
              <div className="text-sm text-gray-500">No image uploaded</div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={approve}
            className="bg-[#98FF98] text-black px-4 py-2 rounded hover:bg-[#87e687]"
          >
            Approve
          </button>
          <button
            onClick={() => setRejecting((v) => !v)}
            className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200"
          >
            {rejecting ? 'Cancel' : 'Reject'}
          </button>
        </div>

        {rejecting && (
          <div className="mt-4">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter rejection reason"
              className="w-full border rounded p-2"
              rows={4}
            />
            <div className="mt-2">
              <button onClick={reject} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm">
                Confirm Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCounselorDetail;
