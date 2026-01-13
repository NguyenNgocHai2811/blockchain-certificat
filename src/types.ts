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

export enum ViewState {
  LANDING = 'LANDING',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  ADMIN_MINT = 'ADMIN_MINT',
  ADMIN_MANAGE = 'ADMIN_MANAGE',
  USER_PORTFOLIO = 'USER_PORTFOLIO',
  PUBLIC_VERIFY = 'PUBLIC_VERIFY',
}

// Augment window for Ethereum
declare global {
  interface Window {
    ethereum: any;
  }
}