import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('nova_user') || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('nova_token') || '');
  const [page, setPage] = useState('home');
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Signup state
  const [signupData, setSignupData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  // OTP state
  const [otpEmail, setOtpEmail] = useState('');
  const [otpVal, setOtpVal] = useState('');
  // Login state
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  // Registration state
  const [regData, setRegData] = useState({
    mobileNumber: '', college: '', course: '', branch: '', yearOfStudy: '3rd Year',
    domain: 'AI & Machine Learning', projectName: '', pptUrl: '', prototypeUrl: '', demoVideoUrl: '', teamSize: 1
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [myEntry, setMyEntry] = useState(null);

  useEffect(() => {
    if (token) {
      fetch(`${API_BASE}/hackathon/my-entry`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => { if (data.success && data.data) setMyEntry(data.data); })
        .catch(() => {});
    }
  }, [token]);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      return setMsg({ type: 'err', text: 'Passwords do not match' });
    }
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');
      setOtpEmail(signupData.email);
      setMsg({ type: 'ok', text: 'OTP sent to your email!' });
      setPage('otp');
    } catch (err) { setMsg({ type: 'err', text: err.message }); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, otp: otpVal })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      localStorage.setItem('nova_token', data.token);
      localStorage.setItem('nova_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setMsg({ type: 'ok', text: 'Account verified successfully!' });
      setPage('dashboard');
    } catch (err) { setMsg({ type: 'err', text: err.message }); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('nova_token', data.token);
      localStorage.setItem('nova_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setMsg({ type: 'ok', text: 'Logged in successfully!' });
      setPage('dashboard');
    } catch (err) { setMsg({ type: 'err', text: err.message }); }
  };

  const handleLogout = () => {
    localStorage.removeItem('nova_token');
    localStorage.removeItem('nova_user');
    setToken('');
    setUser(null);
    setPage('home');
  };

  const handleHackathonRegister = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...regData, leaderName: user.fullName, leaderEmail: user.email, teamMembers };
      const res = await fetch(`${API_BASE}/hackathon/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setMyEntry(data.data);
      setMsg({ type: 'ok', text: 'Registered for Code-a-Nova Hackathon!' });
      setPage('dashboard');
    } catch (err) { setMsg({ type: 'err', text: err.message }); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <h1 onClick={() => setPage('home')} className="text-xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent cursor-pointer">
          Code-a-Nova
        </h1>
        <div className="flex gap-4 items-center text-sm">
          <button onClick={() => setPage('home')} className="hover:text-cyan-400">Home</button>
          {user ? (
            <>
              <button onClick={() => setPage('dashboard')} className="hover:text-cyan-400">Dashboard</button>
              <button onClick={() => setPage('register')} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-1.5 rounded-lg">Register Team</button>
              <button onClick={handleLogout} className="text-slate-400 hover:text-rose-400">Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => setPage('login')} className="hover:text-cyan-400">Login</button>
              <button onClick={() => setPage('signup')} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-1.5 rounded-lg">Sign Up</button>
            </>
          )}
        </div>
      </nav>

      {msg.text && (
        <div className={`p-3 text-center text-sm ${msg.type === 'err' ? 'bg-rose-500/20 text-rose-300 border-b border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border-b border-emerald-500/30'}`}>
          {msg.text}
        </div>
      )}

      <main className="flex-1 max-w-4xl w-full mx-auto p-6">
        {page === 'home' && (
          <div className="text-center py-16 space-y-6">
            <h2 className="text-4xl font-extrabold text-slate-50">Build the Future at <span className="text-cyan-400">Code-a-Nova 2026</span></h2>
            <p className="text-slate-400 max-w-xl mx-auto">Join India's premier online developer hackathon. Build innovative MERN stack projects, compete for prizes, and secure developer internships.</p>
            <div className="flex justify-center gap-4 pt-4">
              <button onClick={() => setPage(user ? 'register' : 'signup')} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/20">
                {user ? 'Submit Your Project' : 'Register Now'}
              </button>
            </div>
          </div>
        )}

        {page === 'signup' && (
          <form onSubmit={handleSignup} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md mx-auto space-y-4">
            <h3 className="text-xl font-bold text-cyan-400 text-center">Create Account</h3>
            <input type="text" placeholder="Full Name" required value={signupData.fullName} onChange={e => setSignupData({...signupData, fullName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white" />
            <input type="email" placeholder="Email Address" required value={signupData.email} onChange={e => setSignupData({...signupData, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white" />
            <input type="password" placeholder="Password (min 8 chars)" required value={signupData.password} onChange={e => setSignupData({...signupData, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white" />
            <input type="password" placeholder="Confirm Password" required value={signupData.confirmPassword} onChange={e => setSignupData({...signupData, confirmPassword: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white" />
            <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-lg">Sign Up</button>
          </form>
        )}

        {page === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md mx-auto space-y-4 text-center">
            <h3 className="text-xl font-bold text-cyan-400">Verify Email OTP</h3>
            <p className="text-xs text-slate-400">Enter the 6-digit verification code sent to {otpEmail}</p>
            <input type="text" placeholder="6-Digit OTP" maxLength={6} required value={otpVal} onChange={e => setOtpVal(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-center text-xl tracking-widest text-white" />
            <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-lg">Verify Account</button>
          </form>
        )}

        {page === 'login' && (
          <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md mx-auto space-y-4">
            <h3 className="text-xl font-bold text-cyan-400 text-center">Login</h3>
            <input type="email" placeholder="Email Address" required value={loginData.email} onChange={e => setLoginData({...loginData, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white" />
            <input type="password" placeholder="Password" required value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white" />
            <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-lg">Login</button>
          </form>
        )}

        {page === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-cyan-400">Participant Dashboard</h3>
              <p className="text-slate-300 mt-1">Name: {user?.fullName}</p>
              <p className="text-slate-400 text-sm">Email: {user?.email}</p>
            </div>
            {myEntry ? (
              <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 space-y-2">
                <h4 className="font-bold text-emerald-400">Hackathon Entry Registered</h4>
                <p className="text-sm">Project: <strong>{myEntry.projectName}</strong> ({myEntry.domain})</p>
                <p className="text-xs text-slate-400">Team Size: {myEntry.teamSize}</p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
                <p className="text-slate-400 mb-3">No active hackathon submission found.</p>
                <button onClick={() => setPage('register')} className="bg-cyan-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm">Register Team Entry</button>
              </div>
            )}
          </div>
        )}

        {page === 'register' && (
          <form onSubmit={handleHackathonRegister} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-bold text-cyan-400">Hackathon Team Registration</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="10-digit Mobile Number" required value={regData.mobileNumber} onChange={e => setRegData({...regData, mobileNumber: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white" />
              <input type="text" placeholder="College / University" required value={regData.college} onChange={e => setRegData({...regData, college: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white" />
              <input type="text" placeholder="Course (e.g. B.Tech)" required value={regData.course} onChange={e => setRegData({...regData, course: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white" />
              <input type="text" placeholder="Branch (e.g. CSE)" required value={regData.branch} onChange={e => setRegData({...regData, branch: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white" />
              <input type="text" placeholder="Project Name" required value={regData.projectName} onChange={e => setRegData({...regData, projectName: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white" />
              <input type="url" placeholder="PPT URL (https://...)" required value={regData.pptUrl} onChange={e => setRegData({...regData, pptUrl: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white" />
              <input type="url" placeholder="GitHub Prototype URL" required value={regData.prototypeUrl} onChange={e => setRegData({...regData, prototypeUrl: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white" />
              <input type="url" placeholder="Demo Video URL (Optional)" value={regData.demoVideoUrl} onChange={e => setRegData({...regData, demoVideoUrl: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white" />
            </div>
            <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-lg">Submit Hackathon Entry</button>
          </form>
        )}
      </main>

      <footer className="border-t border-slate-800 text-center text-xs text-slate-500 py-4">
        © 2026 Code-a-Nova. Built by Sudarshan A Patil (Team Frontier).
      </footer>
    </div>
  );
}
