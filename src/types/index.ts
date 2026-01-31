// TSP Metal Works - Manufacturing ERP Type Definitions

// ============================================
// CLIENT TYPES
// ============================================
export interface Client {
  id: string;
  companyName: string;
  address: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  gstNumber: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// PROJECT / JOB TYPES
// ============================================
export type ProjectStatus = 
  | 'enquiry' 
  | 'design' 
  | 'fabrication' 
  | 'assembly' 
  | 'testing' 
  | 'delivered';

export type MachineType = 
  | 'packing_machine' 
  | 'conveyor' 
  | 'custom';

export interface Project {
  id: string;
  projectNo: string; // JOB-001 format
  clientId: string;
  client?: Client;
  machineType: MachineType;
  modelCapacitySpec: string;
  orderValue: number;
  startDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  status: ProjectStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// PURCHASE TYPES
// ============================================
export type PurchaseStatus = 'ordered' | 'received' | 'cancelled';

export type PurchaseUnit = 'kg' | 'nos' | 'meter' | 'liter' | 'piece' | 'set';

export interface Purchase {
  id: string;
  purchaseNo: string; // PUR-001 format
  date: string;
  supplierName: string;
  materialComponentName: string;
  specification: string;
  quantity: number;
  unit: PurchaseUnit;
  rate: number;
  totalAmount: number; // auto-calculated
  projectId: string;
  project?: Project;
  status: PurchaseStatus;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// STOCK / INVENTORY TYPES
// ============================================
export interface StockItem {
  id: string;
  materialName: string;
  specification: string;
  category: 'raw_material' | 'component';
  unit: PurchaseUnit;
  currentStock: number;
  minimumStock: number;
  stockValue: number;
  lastUpdated: string;
}

// ============================================
// SALES ORDER TYPES
// ============================================
export type SalesStatus = 
  | 'order_confirmed' 
  | 'in_production' 
  | 'ready' 
  | 'delivered';

export interface SalesOrder {
  id: string;
  salesOrderNo: string; // SO-001 format
  clientId: string;
  client?: Client;
  projectId: string;
  project?: Project;
  machineDescription: string;
  quantity: number;
  orderValue: number;
  deliveryDate: string;
  status: SalesStatus;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// BILLING / INVOICE TYPES
// ============================================
export type InvoiceType = 'advance' | 'stage' | 'final';
export type PaymentStatus = 'pending' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  invoiceNo: string; // TSP-INV-001 format
  invoiceDate: string;
  clientId: string;
  client?: Client;
  projectId: string;
  project?: Project;
  invoiceType: InvoiceType;
  invoicePercentage: number;
  subtotal: number;
  gstPercentage: number;
  gstAmount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  dueDate: string;
  paidDate?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DOCUMENT TYPES
// ============================================
export type DocumentCategory = 
  | 'drawing' 
  | 'bom' 
  | 'client_approval' 
  | 'transport' 
  | 'other';

export interface Document {
  id: string;
  name: string;
  category: DocumentCategory;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  linkedTo: 'project' | 'purchase' | 'sales' | 'invoice';
  linkedId: string;
  uploadedAt: string;
  uploadedBy: string;
}

// ============================================
// ACTIVITY LOG TYPES
// ============================================
export interface ActivityLog {
  id: string;
  entityType: 'project' | 'purchase' | 'sales' | 'invoice' | 'client';
  entityId: string;
  action: string;
  description: string;
  performedBy: string;
  performedAt: string;
}

// ============================================
// DASHBOARD KPI TYPES
// ============================================
export interface DashboardKPIs {
  totalClients: number;
  activeProjects: number;
  projectsDelivered: number;
  totalPurchaseValue: number;
  totalSalesValue: number;
  pendingInvoices: number;
  pendingInvoiceAmount: number;
  estimatedProfit: number;
}

export interface OperationalWidget {
  projectsUnderFabrication: Project[];
  projectsUnderAssembly: Project[];
  upcomingDeliveries: Project[];
  lowStockAlerts: StockItem[];
  recentPurchases: Purchase[];
  recentInvoices: Invoice[];
}

// ============================================
// AUTH TYPES
// ============================================
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'staff';
  isActive: boolean;
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// FORM TYPES
// ============================================
export type ClientFormData = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;
export type ProjectFormData = Omit<Project, 'id' | 'projectNo' | 'createdAt' | 'updatedAt' | 'client'>;
export type PurchaseFormData = Omit<Purchase, 'id' | 'purchaseNo' | 'totalAmount' | 'createdAt' | 'updatedAt' | 'project'>;
export type SalesOrderFormData = Omit<SalesOrder, 'id' | 'salesOrderNo' | 'createdAt' | 'updatedAt' | 'client' | 'project'>;
export type InvoiceFormData = Omit<Invoice, 'id' | 'invoiceNo' | 'gstAmount' | 'totalAmount' | 'createdAt' | 'updatedAt' | 'client' | 'project'>;
