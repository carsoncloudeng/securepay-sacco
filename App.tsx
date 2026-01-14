
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { 
  Shield, 
  Lock, 
  Users, 
  Activity, 
  BarChart3, 
  Settings, 
  LogOut, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  FileText, 
  Search,
  Bell,
  Cpu,
  Fingerprint,
  ShieldAlert,
  Zap,
  ShieldCheck,
  RefreshCcw,
  UserX,
  Filter,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  UserCheck,
  Unlock,
  AlertCircle,
  XCircle,
  Terminal,
  Clock,
  CircleDashed,
  BrainCircuit,
  Power,
  Flame,
  ShieldX,
  TriangleAlert
} from 'lucide-react';
import { TEST_USERS, ROLE_LABELS, ROLE_DESCRIPTIONS, MOCK_TRANSACTIONS, MOCK_AUDIT_LOGS, MOCK_MEMBERS } from './constants';
import { User, UserRole, Transaction, SecurityEvent, Member } from './types';
import { getSecurityInsight } from './services/geminiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// --- Shared Components ---

const RoleBadge = ({ role }: { role: UserRole }) => {
  const styles = {
    [UserRole.ADMIN]: 'bg-red-500/20 text-red-400 border-red-500/50',
    [UserRole.SECURITY_ANALYST]: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    [UserRole.FINANCE_MANAGER]: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    [UserRole.SUPPORT_LEAD]: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
    [UserRole.JUNIOR_CLERK]: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${styles[role]}`}>
      {ROLE_LABELS[role]}
    </span>
  );
};

// --- Page Components ---

const Login = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = TEST_USERS[email];
    if (user && user.password === password) {
      onLogin(user);
    } else {
      setError('Invalid credentials. Select a persona below to auto-fill.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-teal-600/10 border border-teal-500/30 mb-6">
            <Shield className="w-10 h-10 text-teal-500" />
          </div>
          <h1 className="text-4xl font-bold mb-2 tracking-tight">SecurePay Sacco</h1>
          <p className="text-slate-400">Trust Console • Member Asset Protection</p>
        </div>

        <div className="glass-panel rounded-3xl p-8 border border-slate-800 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Internal SACCO Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                placeholder="Enter email..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Cryptographic Access Key</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                placeholder="Enter password..."
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button 
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
            >
              <Fingerprint className="w-5 h-5" />
              Secure Login
            </button>
          </form>
        </div>

        <div className="mt-8 glass-panel rounded-2xl p-6 border border-slate-800">
          <h3 className="text-sm font-bold text-teal-400 uppercase tracking-widest mb-4">Select Staff Persona</h3>
          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
            {Object.values(TEST_USERS).map((u) => (
              <div key={u.email} className="text-xs p-3 rounded-lg bg-slate-900/50 border border-slate-800 flex justify-between items-center group cursor-pointer hover:border-slate-700" onClick={() => {setEmail(u.email); setPassword(u.password)}}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-slate-200">{u.name}</p>
                    <RoleBadge role={u.role} />
                  </div>
                  <p className="text-slate-500">{u.email}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SecurityFeed = ({ user, isSystemLocked }: { user: User, isSystemLocked: boolean }) => {
  const [investigations, setInvestigations] = useState<Record<string, { status: 'loading' | 'done', text?: string }>>({});
  const [filterUser, setFilterUser] = useState<string>('All Users');

  const isForensicsAllowed = useMemo(() => 
    [UserRole.ADMIN, UserRole.SECURITY_ANALYST].includes(user.role), 
  [user.role]);

  const runInvestigation = async (txnId: string) => {
    if (isSystemLocked) return;
    if (!isForensicsAllowed) {
      alert(`ACCESS DENIED: Insufficient clearance level for Advanced AI Fraud Forensics.`);
      return;
    }
    const txn = MOCK_TRANSACTIONS.find(t => t.id === txnId);
    if (!txn) return;

    setInvestigations(prev => ({ ...prev, [txnId]: { status: 'loading' } }));
    const insight = await getSecurityInsight(txn);
    setInvestigations(prev => ({ ...prev, [txnId]: { status: 'done', text: insight } }));
  };

  const filteredLogs = useMemo(() => {
    return MOCK_AUDIT_LOGS.filter(log => {
      const userMatch = filterUser === 'All Users' || log.user === filterUser;
      return userMatch;
    });
  }, [filterUser]);

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-500 border-red-500/50 bg-red-500/10';
      case 'HIGH': return 'text-orange-500 border-orange-500/50 bg-orange-500/10';
      case 'MEDIUM': return 'text-amber-500 border-amber-500/50 bg-amber-500/10';
      default: return 'text-slate-400 border-slate-700 bg-slate-800/50';
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20 relative">
       <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Activity className="w-6 h-6 text-teal-500" />
              Sacco Security Intelligence
            </h1>
            <p className="text-slate-400">Protecting cooperative assets with automated AI forensics</p>
          </div>
       </div>

       <div className="space-y-4">
         <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest">Member Account Anomalies</h3>
         </div>
         {MOCK_TRANSACTIONS.filter(t => t.status === 'FLAGGED').map(txn => {
           const investigation = investigations[txn.id];
           const isDone = investigation?.status === 'done';
           const isLoading = investigation?.status === 'loading';

           return (
             <div key={txn.id} className={`glass-panel p-6 rounded-2xl border transition-all duration-300 ${isSystemLocked ? 'opacity-50 border-slate-800 pointer-events-none' : 'border-red-500/20 bg-red-950/10 hover:border-red-500/40'}`}>
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-500/10 rounded-xl shrink-0 border border-red-500/20">
                      <TrendingUp className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-100 text-lg">Potential Breach: {txn.id}</h4>
                        {/* Status Indicator */}
                        {isDone ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-tighter">
                            <CheckCircle2 className="w-3 h-3" /> AI Scan Complete
                          </span>
                        ) : isLoading ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 text-[9px] font-black uppercase tracking-tighter animate-pulse">
                            <CircleDashed className="w-3 h-3 animate-spin" /> Scanning...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase tracking-tighter">
                            <Clock className="w-3 h-3" /> Pending Scan
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mt-1">Member: {txn.customer} | Amount: <span className="text-red-400 font-bold">${txn.amount.toLocaleString()}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isSystemLocked ? (
                       <div className="flex items-center gap-2 px-4 py-2 bg-red-950/40 border border-red-900 rounded-lg text-red-500 text-[10px] font-black uppercase tracking-tight">
                          <Lock className="w-3 h-3" /> SYSTEM FROZEN
                       </div>
                    ) : isForensicsAllowed ? (
                      <>
                        {!investigation ? (
                          <button 
                            onClick={() => runInvestigation(txn.id)}
                            className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-xl shadow-teal-600/20 active:scale-95 border border-teal-400/20"
                          >
                            <Cpu className="w-4 h-4" /> INITIATE AI FORENSICS
                          </button>
                        ) : isLoading ? (
                          <div className="flex items-center gap-3 text-teal-400 text-xs font-bold px-6 py-3 bg-teal-500/10 rounded-xl border border-teal-500/30">
                            <RefreshCcw className="w-4 h-4 animate-spin" /> RUNNING HEURISTICS...
                          </div>
                        ) : (
                          <button 
                             onClick={() => runInvestigation(txn.id)}
                             className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
                          >
                             <RefreshCcw className="w-4 h-4" /> RE-SCAN ASSETS
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-500 text-[10px] font-bold uppercase tracking-tight italic">
                         <Lock className="w-3 h-3" /> Permission Denied
                      </div>
                    )}
                  </div>
               </div>

               {isDone && (
                 <div className="mt-8 p-6 bg-slate-950/80 rounded-2xl border border-teal-500/30 shadow-2xl animate-in fade-in zoom-in-95 duration-700">
                    <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-600/20 rounded-lg border border-teal-600/40">
                          <BrainCircuit className="w-5 h-5 text-teal-400" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-teal-400 uppercase tracking-[0.2em]">Forensic Report Cluster</p>
                          <p className="text-[9px] text-slate-500">SecurePay AI Core v2.4 • Root Auth</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-mono">HASH: 0x82A..FF1</span>
                      </div>
                    </div>
                    <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-normal prose prose-invert max-w-none">
                      {investigation.text}
                    </div>
                 </div>
               )}
             </div>
           );
         })}
       </div>

       <div className="space-y-6">
          <div className="flex items-center gap-2">
             <FileText className="w-5 h-5 text-teal-500" />
             <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest">Sacco Compliance Logs</h3>
          </div>
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                   <thead>
                      <tr className="bg-slate-900/50 border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                         <th className="px-6 py-4">LOG ID</th>
                         <th className="px-6 py-4">Operator</th>
                         <th className="px-6 py-4">Event</th>
                         <th className="px-6 py-4 text-center">Threat Lvl</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800/50">
                      {filteredLogs.map(log => (
                         <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="px-6 py-4 font-mono text-slate-500">{log.id}</td>
                            <td className="px-6 py-4 text-slate-200">{log.user}</td>
                            <td className="px-6 py-4 font-bold text-slate-300">{log.type}</td>
                            <td className="px-6 py-4 text-center">
                               <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase ${getSeverityStyle(log.severity)}`}>
                                  {log.severity}
                               </span>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
       </div>
    </div>
  );
};

const Dashboard = ({ user, members, onToggleFreeze, isSystemLocked }: { user: User, members: Member[], onToggleFreeze: (id: string) => void, isSystemLocked: boolean }) => {
  const isAdmin = user.role === UserRole.ADMIN;
  
  const stats = [
    { label: 'Asset Integrity', value: isSystemLocked ? 'SYSTEM SHUT DOWN' : '100%', icon: Shield, color: isSystemLocked ? 'text-red-500' : 'text-emerald-500' },
    { label: 'Active Members', value: isSystemLocked ? 'NO ACCESS' : members.filter(m => !m.isFrozen).length.toString(), icon: Users, color: isSystemLocked ? 'text-red-400' : 'text-teal-500' },
    { label: 'Frozen Assets', value: isSystemLocked ? 'ALL FUNDS FROZEN' : `$${members.filter(m => m.isFrozen).reduce((acc, m) => acc + m.balance, 0).toLocaleString()}`, icon: Lock, color: 'text-red-500' },
    { label: 'Sacco Node Sync', value: isSystemLocked ? 'OFFLINE' : '99.99%', icon: Activity, color: isSystemLocked ? 'text-slate-600' : 'text-blue-500' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-teal-500" />
            Strategic Console
          </h1>
          <p className="text-slate-400">Monitoring member savings for {user.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <div key={idx} className={`glass-panel p-5 rounded-2xl border transition-all duration-1000 ${isSystemLocked && s.label === 'Asset Integrity' ? 'border-red-500 shadow-lg shadow-red-500/20 bg-red-500/5 animate-pulse scale-105' : 'border-slate-800'}`}>
            <div className={`p-2 rounded-lg bg-slate-900 w-fit mb-4 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{s.label}</p>
            <p className="text-xl font-bold text-white mt-1 whitespace-nowrap overflow-hidden text-ellipsis">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <h3 className="font-bold text-lg flex items-center gap-3">
          <UserCheck className="w-5 h-5 text-teal-500" />
          Member Account Management
        </h3>
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden relative">
          {isSystemLocked && (
            <div className="absolute inset-0 bg-red-950/20 backdrop-blur-[1px] pointer-events-none z-10 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 p-6 bg-slate-950/80 border border-red-500/40 rounded-3xl shadow-2xl scale-110 animate-in zoom-in-95">
                    <XCircle className="w-12 h-12 text-red-500" />
                    <p className="text-red-500 font-black uppercase tracking-tighter text-2xl">NO ACCESS</p>
                    <p className="text-slate-400 text-xs italic">ALL FUNDS FROZEN • SYSTEM SHUT DOWN</p>
                </div>
            </div>
          )}
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-6 py-4">MEMBER ID</th>
                <th className="px-6 py-4">NAME</th>
                <th className="px-6 py-4 text-right">BALANCE</th>
                <th className="px-6 py-4 text-center">STATUS</th>
                <th className="px-6 py-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {members.map(member => {
                const effectiveFrozen = isSystemLocked || member.isFrozen;
                return (
                  <tr key={member.id} className={`hover:bg-slate-900/40 transition-colors ${effectiveFrozen ? 'bg-red-500/5' : ''}`}>
                    <td className="px-6 py-4 font-mono text-slate-500">{member.id}</td>
                    <td className="px-6 py-4 font-bold text-slate-200">{member.name}</td>
                    <td className="px-6 py-4 text-right font-mono text-emerald-400">${member.balance.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {effectiveFrozen ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 border border-red-500/50 text-[10px] font-black uppercase">
                            {isSystemLocked ? 'FROZEN' : 'Frozen'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 text-[10px] font-black uppercase">Active</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isAdmin ? (
                        <button 
                          disabled={isSystemLocked}
                          onClick={() => onToggleFreeze(member.id)}
                          className={`p-2 rounded-lg transition-all ${isSystemLocked ? 'opacity-20 cursor-not-allowed' : ''} ${
                            member.isFrozen ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'
                          }`}
                        >
                          {member.isFrozen ? <Unlock className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-600 italic">No Access</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StaffRanksPage = () => {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <h1 className="text-2xl font-bold text-white flex items-center gap-3">
        <Users className="w-6 h-6 text-teal-500" />
        Staff Rank Directory
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.values(UserRole).map((role) => (
          <div key={role} className="glass-panel p-6 rounded-3xl border border-slate-800">
            <div className="flex items-start justify-between mb-4">
              <RoleBadge role={role} />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">{ROLE_LABELS[role]}</h3>
            <p className="text-sm text-slate-400 leading-relaxed italic">{ROLE_DESCRIPTIONS[role]}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsPage = ({ 
  user, 
  is2FAActive, 
  onToggle2FA, 
  isSystemLocked, 
  onToggleSystemLock, 
  onPurgeSessions,
  isPurging
}: { 
  user: User, 
  is2FAActive: boolean, 
  onToggle2FA: () => void,
  isSystemLocked: boolean,
  onToggleSystemLock: () => void,
  onPurgeSessions: () => void,
  isPurging: boolean
}) => {
  const isAdmin = user.role === UserRole.ADMIN;
  const [showConfirm, setShowConfirm] = useState(false);
  
  const handleLockoutClick = () => {
    if (isSystemLocked) {
       onToggleSystemLock();
    } else {
       setShowConfirm(true);
    }
  };

  const confirmLockout = () => {
    setShowConfirm(false);
    onToggleSystemLock();
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <h1 className="text-2xl font-bold text-white flex items-center gap-3">
        <Settings className="w-6 h-6 text-teal-500" />
        Sacco Infrastructure Shield
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-8 rounded-3xl border border-slate-800">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-teal-500" /> Security Policy Control
          </h3>
          <div className="space-y-4">
            {isAdmin ? (
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <div>
                  <p className="font-bold text-sm">Member 2FA Mandatory</p>
                  <p className="text-[10px] text-slate-500">Enforce biometric auth for all members</p>
                </div>
                <button 
                  onClick={onToggle2FA}
                  className={`w-10 h-6 rounded-full flex items-center px-1 transition-all ${is2FAActive ? 'bg-teal-600' : 'bg-slate-700'} cursor-pointer`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-all ${is2FAActive ? 'ml-auto' : 'ml-0'}`}></div>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/20 border border-slate-800/50 opacity-60 grayscale">
                <div>
                  <p className="font-bold text-sm">Member 2FA Mandatory</p>
                  <p className="text-[10px] text-slate-500">Tier 5 Administrative clearance required</p>
                </div>
                <Lock className="w-4 h-4 text-slate-600" />
              </div>
            )}
            
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <p className="font-bold text-sm">HSM Root Cluster</p>
              <div className="w-10 h-6 bg-teal-600 rounded-full flex items-center px-1">
                <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
              </div>
            </div>
          </div>
        </div>

        <div className={`glass-panel p-8 rounded-3xl border ${isAdmin ? 'border-slate-800' : 'border-red-500/30 bg-red-500/5'} relative overflow-hidden`}>
          {!isAdmin && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] z-10 flex items-center justify-center p-6 text-center">
                <div className="bg-slate-900 p-6 rounded-2xl border border-red-500/30">
                   <Lock className="w-8 h-8 text-red-500 mx-auto mb-3" />
                   <p className="text-red-400 font-bold text-sm uppercase tracking-tight">Access Denied</p>
                   <p className="text-[10px] text-slate-600 mt-2">Requires Tier 5 Clearance</p>
                </div>
            </div>
          )}
          <h3 className="text-lg font-bold mb-6">Staff Override Modules</h3>
          <div className="space-y-4">
             <div className="space-y-2">
                <button 
                  onClick={handleLockoutClick}
                  className={`w-full py-4 border font-black text-xs rounded-xl uppercase transition-all flex items-center justify-center gap-3 ${
                    isSystemLocked 
                    ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30' 
                    : 'bg-red-600/10 border-red-500/40 text-red-500 hover:bg-red-600/20'
                  }`}
                >
                   {isSystemLocked ? <Power className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                   {isSystemLocked ? 'Deactivate Killswitch' : 'Emergency Sacco Lockout'}
                </button>
                <p className="text-[9px] text-slate-500 text-center px-4 leading-tight italic">
                  * Triggers immediate system-wide freeze. Prevents all member asset movement.
                </p>
             </div>

             <div className="space-y-2">
                <button 
                  disabled={isPurging}
                  onClick={onPurgeSessions}
                  className={`w-full py-4 bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold rounded-xl uppercase hover:bg-slate-700 transition-all flex items-center justify-center gap-3 ${isPurging ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                   {isPurging ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                   {isPurging ? 'Purging Enclaves...' : 'Purge Staff Session Tokens'}
                </button>
                <p className="text-[9px] text-slate-500 text-center px-4 leading-tight italic">
                  * Invalidates all cryptographic session keys. Requires full re-authentication across Sacco nodes.
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* DETAILED CONFIRMATION DIALOG */}
      {showConfirm && (
        <div className="fixed inset-0 z-[300] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="max-w-xl w-full glass-panel border-red-500/50 p-8 rounded-[32px] shadow-[0_0_100px_rgba(239,68,68,0.2)] animate-in zoom-in-95">
             <div className="flex items-center gap-4 mb-8 border-b border-red-500/20 pb-6">
                <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center border border-red-500/40 shrink-0">
                  <TriangleAlert className="w-10 h-10 text-red-500 animate-pulse" />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-white uppercase tracking-tighter">System Isolation</h2>
                   <p className="text-red-400 text-xs font-bold uppercase tracking-widest">Protocol 000-X Confirmation</p>
                </div>
             </div>

             <div className="space-y-6 mb-10">
                <p className="text-slate-300 text-sm leading-relaxed">
                  Executing an <span className="text-red-500 font-black">Emergency Sacco Lockout</span> is a Tier 5 Administrative action with the following immediate global consequences:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-xs text-slate-400">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span><strong className="text-slate-200">Asset Isolation:</strong> Immediate freeze of ALL member savings, withdrawals, and loan disbursements.</span>
                  </li>
                  <li className="flex items-start gap-3 text-xs text-slate-400">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span><strong className="text-slate-200">Access Revocation:</strong> Denial of service for all staff levels. Dashboards will enter Isolated Mode.</span>
                  </li>
                  <li className="flex items-start gap-3 text-xs text-slate-400">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span><strong className="text-slate-200">Node Sync:</strong> Sacco network nodes will disconnect from the public ledger to prevent capital flight.</span>
                  </li>
                </ul>
                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                   <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest text-center">
                     "SYSTEM SHUT DOWN - NO ACCESS - ALL FUNDS FROZEN"
                   </p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="py-4 bg-slate-900 border border-slate-800 text-slate-400 font-bold rounded-2xl hover:text-white transition-all text-sm"
                >
                  Cancel Operation
                </button>
                <button 
                  onClick={confirmLockout}
                  className="py-4 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-600/30 hover:bg-red-500 transition-all text-sm uppercase tracking-tighter flex items-center justify-center gap-2"
                >
                  <ShieldX className="w-5 h-5" /> Confirm Lockout
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Layout ---

const MainLayout = ({ 
  user, 
  onLogout, 
  is2FAActive, 
  onToggle2FA, 
  isSystemLocked, 
  isLockingDown,
  onToggleSystemLock, 
  onPurgeSessions,
  isPurging
}: { 
  user: User, 
  onLogout: () => void, 
  is2FAActive: boolean, 
  onToggle2FA: () => void,
  isSystemLocked: boolean,
  isLockingDown: boolean,
  onToggleSystemLock: () => void,
  onPurgeSessions: () => void,
  isPurging: boolean
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);

  const toggleMemberFreeze = (id: string) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, isFrozen: !m.isFrozen } : m));
  };
  
  const NavItem = ({ id, label, icon: Icon, disabled = false }: { id: string, label: string, icon: any, disabled?: boolean }) => (
    <button 
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(id)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left ${
        activeTab === id 
          ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' 
          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium hidden lg:block">{label}</span>
    </button>
  );

  return (
    <div className={`min-h-screen flex transition-colors duration-1000 ${isSystemLocked ? 'bg-red-950/20' : 'bg-slate-950'}`}>
      
      {/* FULL SYSTEM SHUT DOWN SPLASH SCREEN (Transition) */}
      {isLockingDown && (
        <div className="fixed inset-0 z-[350] bg-red-700 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
           <div className="animate-pulse space-y-8 max-w-4xl">
              <div className="relative mx-auto w-32 h-32">
                 <ShieldAlert className="w-32 h-32 text-white absolute inset-0 animate-ping opacity-25" />
                 <ShieldAlert className="w-32 h-32 text-white relative z-10" />
              </div>
              <h2 className="text-7xl font-black text-white uppercase tracking-tighter leading-none">SYSTEM SHUT DOWN</h2>
              <div className="space-y-4">
                 <p className="text-white font-black text-4xl uppercase tracking-widest border-y-4 border-white py-4">NO ACCESS • ALL FUNDS FROZEN</p>
                 <p className="text-red-200 text-lg font-mono tracking-widest">[ SECURITY KILLSWITCH ENGAGED: 000-X ]</p>
              </div>
           </div>
        </div>
      )}

      {/* Global Lockdown Alert Overlay for non-admins */}
      {isSystemLocked && user.role !== UserRole.ADMIN && !isLockingDown && (
        <div className="fixed inset-0 z-[100] bg-red-950/90 backdrop-blur-md flex items-center justify-center p-8 text-center animate-in fade-in duration-500">
           <div className="max-w-md w-full glass-panel border-red-500/50 p-12 rounded-[40px] space-y-8 shadow-[0_0_100px_rgba(239,68,68,0.3)]">
              <div className="w-24 h-24 bg-red-600/20 rounded-full border border-red-500 flex items-center justify-center mx-auto animate-pulse">
                <ShieldAlert className="w-12 h-12 text-red-500" />
              </div>
              <div className="space-y-4">
                 <h2 className="text-4xl font-black text-white uppercase tracking-tighter">System Shut Down</h2>
                 <p className="text-red-400 font-bold text-sm tracking-widest uppercase underline decoration-2 underline-offset-4">No Access • All Funds Frozen</p>
                 <p className="text-slate-300 text-sm leading-relaxed">
                   The SACCO Administrator has triggered a global emergency lockout. All financial operations, forensic analysis, and member data access are currently suspended to prevent potential capital flight.
                 </p>
              </div>
              <div className="pt-6">
                <button onClick={onLogout} className="w-full py-4 bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl font-bold flex items-center justify-center gap-2 hover:text-white transition-all">
                  <LogOut className="w-4 h-4" /> Secure Disconnect
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Admin Quick Settings Overlay when Locked */}
      {isSystemLocked && user.role === UserRole.ADMIN && activeTab !== 'settings' && (
        <div className="fixed bottom-8 right-8 z-[60] animate-in slide-in-from-bottom-8 duration-500">
           <button 
             onClick={() => setActiveTab('settings')}
             className="px-6 py-4 bg-red-600 text-white font-black rounded-full shadow-2xl flex items-center gap-3 animate-bounce shadow-red-600/40 border-2 border-white/20"
           >
              <Lock className="w-5 h-5" /> SYSTEM FROZEN: ACCESS CONTROL
           </button>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`w-20 lg:w-64 border-r border-slate-800 flex flex-col fixed h-full z-50 transition-colors duration-500 ${isSystemLocked ? 'bg-red-950/40' : 'bg-slate-950'}`}>
        <div className="p-6 mb-4">
          <div className="flex items-center gap-3 lg:px-2">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden lg:block">SecurePay Sacco</span>
          </div>
        </div>

        <nav className="flex-grow px-4 space-y-2">
          <NavItem id="dashboard" label="Sacco Console" icon={BarChart3} />
          <NavItem id="feed" label="Security Feed" icon={Activity} />
          <NavItem id="users" label="Staff Ranks" icon={Users} />
          <NavItem id="settings" label="Sacco Shield" icon={Settings} />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="lg:px-4 mb-4 hidden lg:block text-slate-400">
            <div className="flex items-center gap-3 mb-2">
              <img src={user.avatar} className="w-10 h-10 rounded-xl border border-slate-700" alt="Avatar" />
              <p className="font-bold text-sm truncate">{user.name}</p>
            </div>
            <RoleBadge role={user.role} />
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-colors">
            <LogOut className="w-5 h-5" /> <span className="hidden lg:block">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow ml-20 lg:ml-64 min-h-screen">
        <header className={`h-20 border-b border-slate-800 sticky top-0 backdrop-blur-xl z-40 px-8 flex items-center justify-between transition-colors duration-500 ${isSystemLocked ? 'bg-red-950/90' : 'bg-slate-950/80'}`}>
           <div className="flex-grow max-w-xl">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" placeholder="Search Sacco Archives..." className="w-full bg-slate-900 border border-slate-800 rounded-full py-2 pl-10 pr-4 text-xs focus:ring-1 focus:ring-teal-500 outline-none" />
             </div>
           </div>
           <div className="flex items-center gap-6">
              {isSystemLocked ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white text-[9px] font-black rounded-full uppercase animate-pulse shadow-lg shadow-red-600/50">
                   <ShieldAlert className="w-3 h-3" /> System Frozen
                </div>
              ) : is2FAActive && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-500 text-[9px] font-black rounded-full uppercase">
                  <Fingerprint className="w-3 h-3" /> 2FA Active
                </div>
              )}
              <Bell className="w-5 h-5 text-slate-500 cursor-pointer" />
              <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${isSystemLocked ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></div>
                 <span className={`text-[10px] font-bold uppercase tracking-widest ${isSystemLocked ? 'text-red-400' : 'text-slate-400'}`}>
                    Sacco Core: {isSystemLocked ? 'Locked' : 'Online'}
                 </span>
              </div>
           </div>
        </header>

        {/* Persistent Warning Bar when locked */}
        {isSystemLocked && (
            <div className="bg-red-600 text-white px-8 py-2 flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest animate-pulse sticky top-20 z-30 shadow-[0_5px_15px_rgba(239,68,68,0.4)]">
                <Flame className="w-4 h-4" />
                SYSTEM SHUT DOWN • NO ACCESS • ALL FUNDS FROZEN
                <Flame className="w-4 h-4" />
            </div>
        )}

        <div className="p-8 max-w-[1200px] mx-auto">
          {activeTab === 'dashboard' && <Dashboard user={user} members={members} onToggleFreeze={toggleMemberFreeze} isSystemLocked={isSystemLocked} />}
          {activeTab === 'feed' && <SecurityFeed user={user} isSystemLocked={isSystemLocked} />}
          {activeTab === 'settings' && (
            <SettingsPage 
              user={user} 
              is2FAActive={is2FAActive} 
              onToggle2FA={onToggle2FA} 
              isSystemLocked={isSystemLocked}
              onToggleSystemLock={onToggleSystemLock}
              onPurgeSessions={onPurgeSessions}
              isPurging={isPurging}
            />
          )}
          {activeTab === 'users' && <StaffRanksPage />}
        </div>
      </main>

      {/* Purge Sequence Overlay */}
      {isPurging && (
        <div className="fixed inset-0 z-[110] bg-black flex items-center justify-center p-8 animate-in fade-in duration-300">
           <div className="max-w-2xl w-full font-mono text-emerald-500 space-y-4">
              <div className="flex items-center gap-3 text-emerald-400 mb-8 border-b border-emerald-900 pb-4">
                <Terminal className="w-6 h-6" />
                <span className="text-xl font-bold uppercase tracking-widest">Sacco Enclave Purge In Progress</span>
              </div>
              <div className="space-y-1 text-xs sm:text-sm">
                <p>[SYSTEM] Accessing Cryptographic Vault...</p>
                <p>[SYSTEM] Validating Admin Signature... DONE</p>
                <p className="animate-pulse">[PROCESS] Revoking JWT Cluster #4829...</p>
                <p className="animate-pulse delay-75">[PROCESS] Invalidating Staff Sessions: 42 Active...</p>
                <p className="animate-pulse delay-150">[PROCESS] Rotating Root Sacco Keys...</p>
                <p>[SYSTEM] Clearing Member Access Caches...</p>
                <div className="h-1 bg-emerald-950 rounded-full mt-8 overflow-hidden">
                   <div className="h-full bg-emerald-500 w-full animate-grow-slow"></div>
                </div>
                <p className="text-center mt-4 text-[10px] uppercase tracking-[0.3em]">Finalizing Security Rotation</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isPurging, setIsPurging] = useState(false);
  const [isLockingDown, setIsLockingDown] = useState(false);
  
  // App-level state for 2FA Mandatory with localStorage persistence
  const [is2FAMandatory, setIs2FAMandatory] = useState<boolean>(() => {
    const saved = localStorage.getItem('securepay_2fa_mandatory');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Global Sacco Lock State
  const [isSystemLocked, setIsSystemLocked] = useState<boolean>(() => {
    const saved = localStorage.getItem('securepay_system_locked');
    return saved !== null ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('securepay_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    localStorage.setItem('securepay_2fa_mandatory', JSON.stringify(is2FAMandatory));
  }, [is2FAMandatory]);

  useEffect(() => {
    localStorage.setItem('securepay_system_locked', JSON.stringify(isSystemLocked));
  }, [isSystemLocked]);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('securepay_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('securepay_user');
  };

  const handleToggle2FA = () => {
    setIs2FAMandatory(prev => !prev);
  };

  const handleToggleSystemLock = () => {
    if (!isSystemLocked) {
      // The SettingsPage handles its own Confirmation Modal now, 
      // but we keep this for direct triggers or fallbacks
      setIsLockingDown(true);
      setTimeout(() => {
        setIsSystemLocked(true);
        setIsLockingDown(false);
      }, 3000);
    } else {
      setIsSystemLocked(false);
    }
  };

  const handlePurgeSessions = async () => {
    if (window.confirm("CRITICAL: You are about to purge all session tokens. This will immediately log out every operator from the Sacco network. Proceed?")) {
      setIsPurging(true);
      // Simulate technical purge duration
      setTimeout(() => {
        setIsPurging(false);
        handleLogout();
      }, 4500);
    }
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
        <Route 
          path="/" 
          element={
            user ? (
              <MainLayout 
                user={user} 
                onLogout={handleLogout} 
                is2FAActive={is2FAMandatory} 
                onToggle2FA={handleToggle2FA} 
                isSystemLocked={isSystemLocked}
                isLockingDown={isLockingDown}
                onToggleSystemLock={handleToggleSystemLock}
                onPurgeSessions={handlePurgeSessions}
                isPurging={isPurging}
              />
            ) : <Navigate to="/login" />
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
}
