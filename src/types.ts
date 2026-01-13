export interface CertificateStruct {
  studentName: string;
  courseName: string;
  grade: string;
  imageURL: string;
  issueDate: bigint;
  signature: string;
}

export interface CertificateData extends CertificateStruct {
  tokenId: number;
}

// Lịch sử giao dịch
export interface TransactionHistory {
  type: 'mint' | 'burn' | 'transfer';
  tokenId: number;
  from: string;
  to: string;
  timestamp: number;
  txHash: string;
  studentName?: string;
  courseName?: string;
}

// Thông báo
export interface Notification {
  id: string;
  type: 'new_certificate' | 'revoked' | 'transfer';
  message: string;
  tokenId: number;
  timestamp: number;
  read: boolean;
}

// Batch mint item
export interface BatchMintItem {
  receiver: string;
  tokenId: number;
  studentName: string;
  courseName: string;
  grade: string;
  imageURL: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
}

export enum ViewState {
  LANDING = 'LANDING',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  ADMIN_MINT = 'ADMIN_MINT',
  ADMIN_MANAGE = 'ADMIN_MANAGE',
  ADMIN_BATCH = 'ADMIN_BATCH',
  ADMIN_HISTORY = 'ADMIN_HISTORY',
  USER_PORTFOLIO = 'USER_PORTFOLIO',
  PUBLIC_VERIFY = 'PUBLIC_VERIFY',
}

// Augment window for Ethereum
declare global {
  interface Window {
    ethereum: any;
  }
}