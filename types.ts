
export enum UserRole {
  ADMIN = 'ADMIN',
  SECURITY_ANALYST = 'SECURITY_ANALYST',
  FINANCE_MANAGER = 'FINANCE_MANAGER',
  SUPPORT_LEAD = 'SUPPORT_LEAD',
  JUNIOR_CLERK = 'JUNIOR_CLERK'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  permissions: string[];
}

export interface Member {
  id: string;
  name: string;
  balance: number;
  isFrozen: boolean;
  lastActive: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FLAGGED' | 'FAILED';
  timestamp: string;
  customer: string;
  customerID: string;
  riskScore: number;
  location: string;
  method: string;
}

export interface SecurityEvent {
  id: string;
  type: 'LOGIN' | 'PRIVILEGE_ATTEMPT' | 'DATA_EXPORT' | 'CONFIG_CHANGE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  user: string;
  timestamp: string;
}
