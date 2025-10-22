import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      setMessage('Please enter the administrator password');
      return;
    }
    // Store what the admin entered; backend will validate via header
    localStorage.setItem('adminSecret', password);
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0fff0]">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-xl font-bold mb-6 text-center">Administrator Login</h2>
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />
        <button type="submit" className="bg-[#98FF98] text-black w-full py-2 rounded-lg hover:bg-[#87e687] transition">
          Login
        </button>
        {message && <p className="mt-4 text-center text-red-600">{message}</p>}
      </form>
    </div>
  );
}

export default AdminLogin;
