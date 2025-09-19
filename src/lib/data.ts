

export type QuotationItem = {
  id: string;
  description: string;
  brandName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  imageUrl?: string;
  imageHint?: string;
};

export type Quotation = {
  id: string;
  clientId: string;
  projectName: string;
  date: string;
  total: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected';
  items: QuotationItem[];
};

export type Invoice = {
  id: string;
  quotationId: string;
  clientId: string;
  projectName: string;
  date: string;
  dueDate: string;
  total: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Pending';
  items: QuotationItem[];
};

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export type Project = {
  id: string;
  name: string;
  clientId: string;
}

const defaultQuotationItems: QuotationItem[] = [
    { id: '1', description: 'Hikvision 8-Channel DVR', brandName: 'Hikvision', quantity: 1, unitPrice: 150, total: 150, imageUrl: 'https://picsum.photos/seed/dvr/100/100', imageHint: 'security dvr' },
    { id: '2', description: '2MP Dome Camera', brandName: 'Hikvision', quantity: 4, unitPrice: 55, total: 220, imageUrl: 'https://picsum.photos/seed/camera/100/100', imageHint: 'dome camera' },
    { id: '3', description: '1TB Surveillance Hard Drive', brandName: 'Seagate', quantity: 1, unitPrice: 60, total: 60, imageUrl: 'https://picsum.photos/seed/hdd/100/100', imageHint: 'hard drive' },
    { id: '4', description: '100m CAT6 Cable', brandName: 'Generic', quantity: 1, unitPrice: 40, total: 40, imageUrl: 'https://picsum.photos/seed/cable/100/100', imageHint: 'ethernet cable' },
    { id: '5', description: 'Installation & Configuration Labor', brandName: 'QuoteCraft', quantity: 8, unitPrice: 75, total: 600, imageUrl: 'https://picsum.photos/seed/labor/100/100', imageHint: 'technician working' },
];

const initialMockClients: Client[] = [
  { id: 'cli-1', name: 'Innovate Corp', email: 'contact@innovatecorp.com', phone: '+1-202-555-0149', address: '123 Innovation Drive, Tech City' },
  { id: 'cli-2', name: 'Quantum Solutions', email: 'hello@quantumsolutions.dev', phone: '+1-202-555-0128', address: '456 Quantum Way, Silicon Valley' },
  { id: 'cli-3', name: 'Apex Industries', email: 'info@apexindustries.net', phone: '+1-202-555-0182', address: '789 Apex Lane, Industrial Park' },
];

const initialMockProjects: Project[] = [
    { id: 'proj-1', name: 'Office Security Upgrade', clientId: 'cli-1' },
    { id: 'proj-2', name: 'New HQ Network Setup', clientId: 'cli-2' },
    { id: 'proj-3', name: 'Warehouse Surveillance System', clientId: 'cli-3' },
    { id: 'proj-4', name: 'Retail Store Audio System', clientId: 'cli-1' },
];

const initialMockQuotations: Quotation[] = [
  { id: 'Q-2024-001', clientId: 'cli-1', projectName: 'Office Security Upgrade', date: '2024-07-15', total: 12500, status: 'Approved', items: defaultQuotationItems },
  { id: 'Q-2024-002', clientId: 'cli-2', projectName: 'New HQ Network Setup', date: '2024-07-18', total: 25000, status: 'Sent', items: defaultQuotationItems },
  { id: 'Q-2024-003', clientId: 'cli-3', projectName: 'Warehouse Surveillance System', date: '2024-07-20', total: 8500, status: 'Draft', items: defaultQuotationItems },
  { id: 'Q-2024-004', clientId: 'cli-1', projectName: 'Retail Store Audio System', date: '2024-07-22', total: 4200, status: 'Rejected', items: defaultQuotationItems },
  { id: 'Q-2024-005', clientId: 'cli-2', projectName: 'Phase 2 Network Expansion', date: '2024-07-25', total: 18000, status: 'Sent', items: defaultQuotationItems },
];

const initialMockInvoices: Invoice[] = [
  { id: 'INV-2024-001', quotationId: 'Q-2024-001', clientId: 'cli-1', projectName: 'Office Security Upgrade', date: '2024-07-20', dueDate: '2024-08-19', total: 12500, status: 'Sent', items: defaultQuotationItems },
  { id: 'INV-2024-002', quotationId: 'Q-2023-015', clientId: 'cli-3', projectName: 'Legacy System Maintenance', date: '2024-06-10', dueDate: '2024-07-10', total: 1500, status: 'Paid', items: defaultQuotationItems },
  { id: 'INV-2024-003', quotationId: 'Q-2024-000', clientId: 'cli-2', projectName: 'Fire Alarm Inspection', date: '2024-05-01', dueDate: '2024-05-31', total: 800, status: 'Overdue', items: defaultQuotationItems },
  { id: 'INV-2024-004', quotationId: 'Q-2023-018', clientId: 'cli-1', projectName: 'Q2 Support Contract', date: '2024-07-01', dueDate: '2024-07-31', total: 3000, status: 'Paid', items: defaultQuotationItems },
];

export function getFromStorage<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    const stored = window.localStorage.getItem(key);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error(`Error parsing localStorage key "${key}":`, e);
            // If parsing fails, initialize with fallback
            saveToStorage(key, fallback);
            return fallback;
        }
    } else {
      // If not stored, initialize with fallback
      saveToStorage(key, fallback);
    }
    return fallback;
}

export function saveToStorage<T>(key: string, data: T) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, JSON.stringify(data));
}

// Initialize storage if it's empty
if (typeof window !== 'undefined') {
    if (!localStorage.getItem('clients')) saveToStorage('clients', initialMockClients);
    if (!localStorage.getItem('projects')) saveToStorage('projects', initialMockProjects);
    if (!localStorage.getItem('quotations')) saveToStorage('quotations', initialMockQuotations);
    if (!localStorage.getItem('invoices')) saveToStorage('invoices', initialMockInvoices);
}

export { defaultQuotationItems };
