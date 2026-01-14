
import { UserRole, User, SecurityEvent, Member } from './types';

export const TEST_USERS: Record<string, User & { password: string }> = {
  'admin@securepaysacco.coop': {
    id: 'u1',
    name: 'Alexander V.',
    email: 'admin@securepaysacco.coop',
    password: 'Admin123!',
    role: UserRole.ADMIN,
    avatar: 'https://picsum.photos/seed/admin/200',
    permissions: ['ALL_ACCESS', 'USER_MGMT', 'SYSTEM_CONFIG', 'AUDIT_LOGS']
  },
  'sarah.analyst@securepaysacco.coop': {
    id: 'u2',
    name: 'Sarah Chen',
    email: 'sarah.analyst@securepaysacco.coop',
    password: 'Security2024!',
    role: UserRole.SECURITY_ANALYST,
    avatar: 'https://picsum.photos/seed/sarah/200',
    permissions: ['FRAUD_MONITOR', 'TRANSACTION_RECOVERY', 'RISK_ASSESSMENT']
  },
  'mark.finance@securepaysacco.coop': {
    id: 'u3',
    name: 'Mark Henderson',
    email: 'mark.finance@securepaysacco.coop',
    password: 'Finance888',
    role: UserRole.FINANCE_MANAGER,
    avatar: 'https://picsum.photos/seed/mark/200',
    permissions: ['FINANCIAL_REPORTS', 'PAYOUT_APPROVAL', 'MERCHANT_SETTINGS']
  },
  'jenny.support@securepaysacco.coop': {
    id: 'u4',
    name: 'Jenny Garcia',
    email: 'jenny.support@securepaysacco.coop',
    password: 'Helpdesk1',
    role: UserRole.SUPPORT_LEAD,
    avatar: 'https://picsum.photos/seed/jenny/200',
    permissions: ['REFUND_PROCESS', 'CUSTOMER_VIEW', 'TICKET_MGMT']
  },
  'bob.clerk@securepaysacco.coop': {
    id: 'u5',
    name: 'Robert Smith',
    email: 'bob.clerk@securepaysacco.coop',
    password: 'EntryLevel',
    role: UserRole.JUNIOR_CLERK,
    avatar: 'https://picsum.photos/seed/bob/200',
    permissions: ['VIEW_ONLY_BASIC', 'SEARCH_RECORDS']
  }
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Complete system oversight. Responsible for cryptographic key management, root-level configurations, and emergency fund overrides. Highest clearance level (Tier 5).',
  [UserRole.SECURITY_ANALYST]: 'Focused on forensic investigation. Triggers AI-driven deep-packet analysis, mitigates flagged threats, and maintains Sacco network integrity. Level 4 clearance.',
  [UserRole.FINANCE_MANAGER]: 'Manages treasury operations. Oversees loan disbursements, member payout ledgers, and generates financial compliance snapshots. Level 3 clearance.',
  [UserRole.SUPPORT_LEAD]: 'Primary point for member identity verification. Processes refunds, manages account recoveries, and handles high-priority member service incidents. Level 2 clearance.',
  [UserRole.JUNIOR_CLERK]: 'Entry-level administrative support. Has view-only access to basic transaction records and verified member searches. Strictly limited to Tier 1 data.',
};

export const MOCK_MEMBERS: Member[] = [
  { id: 'M-401', name: 'V. Petrov', balance: 125000.00, isFrozen: false, lastActive: '2024-05-20 14:22' },
  { id: 'M-222', name: 'L. White', balance: 450.20, isFrozen: false, lastActive: '2024-05-20 14:25' },
  { id: 'M-902', name: 'G. Schmidt', balance: 8900.00, isFrozen: true, lastActive: '2024-05-20 14:28' },
  { id: 'M-111', name: 'A. Patel', balance: 15400.00, isFrozen: false, lastActive: '2024-05-20 14:35' },
  { id: 'M-009', name: 'Anonymous Member', balance: 32000.00, isFrozen: false, lastActive: '2024-05-20 14:30' },
];

export const MOCK_TRANSACTIONS = [
  { id: 'TXN-9081', amount: 12500.00, currency: 'USD', status: 'FLAGGED', timestamp: '2024-05-20 14:22', customer: 'V. Petrov', customerID: 'M-401', riskScore: 88, location: 'Moscow, RU', method: 'Sacco Wire' },
  { id: 'TXN-9082', amount: 45.20, currency: 'USD', status: 'COMPLETED', timestamp: '2024-05-20 14:25', customer: 'L. White', customerID: 'M-222', riskScore: 2, location: 'San Francisco, US', method: 'Sacco Debit' },
  { id: 'TXN-9083', amount: 890.00, currency: 'EUR', status: 'PENDING', timestamp: '2024-05-20 14:28', customer: 'G. Schmidt', customerID: 'M-902', riskScore: 15, location: 'Berlin, DE', method: 'Mobile Money' },
  { id: 'TXN-9084', amount: 3200.00, currency: 'USD', status: 'FLAGGED', timestamp: '2024-05-20 14:30', customer: 'Anonymous', customerID: 'M-009', riskScore: 92, location: 'Lagos, NG', method: 'Sacco Transfer' },
  { id: 'TXN-9085', amount: 150.00, currency: 'GBP', status: 'COMPLETED', timestamp: '2024-05-20 14:35', customer: 'A. Patel', customerID: 'M-111', riskScore: 5, location: 'London, UK', method: 'Sacco Pay' },
];

export const MOCK_AUDIT_LOGS: SecurityEvent[] = [
  { id: 'EV-100', type: 'LOGIN', severity: 'LOW', description: 'Standard SACCO session established.', user: 'Alexander V.', timestamp: '2024-05-20 09:00' },
  { id: 'EV-101', type: 'DATA_EXPORT', severity: 'MEDIUM', description: 'Member savings ledger export for Audit Q2.', user: 'Mark Henderson', timestamp: '2024-05-20 10:15' },
  { id: 'EV-102', type: 'PRIVILEGE_ATTEMPT', severity: 'HIGH', description: 'Blocked write attempt to member loan headers.', user: 'Robert Smith', timestamp: '2024-05-20 11:30' },
  { id: 'EV-103', type: 'CONFIG_CHANGE', severity: 'CRITICAL', description: 'Firewall ruleset updated via Admin CLI.', user: 'Alexander V.', timestamp: '2024-05-20 12:45' },
  { id: 'EV-104', type: 'LOGIN', severity: 'LOW', description: 'Remote SACCO node connection.', user: 'Sarah Chen', timestamp: '2024-05-20 13:20' },
  { id: 'EV-105', type: 'DATA_EXPORT', severity: 'MEDIUM', description: 'Member metadata dump (GDPR compliant).', user: 'Jenny Garcia', timestamp: '2024-05-21 08:45' },
  { id: 'EV-106', type: 'PRIVILEGE_ATTEMPT', severity: 'HIGH', description: 'Unauthorized access to SACCO root certificate store.', user: 'Jenny Garcia', timestamp: '2024-05-21 09:12' },
  { id: 'EV-107', type: 'LOGIN', severity: 'LOW', description: 'Standard office node login.', user: 'Sarah Chen', timestamp: '2024-05-21 10:05' },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'SACCO Administrator',
  [UserRole.SECURITY_ANALYST]: 'Security Forensic Analyst',
  [UserRole.FINANCE_MANAGER]: 'Treasury Manager',
  [UserRole.SUPPORT_LEAD]: 'Member Services Lead',
  [UserRole.JUNIOR_CLERK]: 'SACCO Junior Staff'
};
