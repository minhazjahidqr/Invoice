export type Quotation = {
  id: string;
  client: string;
  projectName: string;
  date: string;
  total: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected';
};

export type Invoice = {
  id: string;
  quotationId: string;
  client: string;
  projectName: string;
  date: string;
  dueDate: string;
  total: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Pending';
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

export const mockClients: Client[] = [
  { id: 'cli-1', name: 'Innovate Corp', email: 'contact@innovatecorp.com', phone: '+1-202-555-0149', address: '123 Innovation Drive, Tech City' },
  { id: 'cli-2', name: 'Quantum Solutions', email: 'hello@quantumsolutions.dev', phone: '+1-202-555-0128', address: '456 Quantum Way, Silicon Valley' },
  { id: 'cli-3', name: 'Apex Industries', email: 'info@apexindustries.net', phone: '+1-202-555-0182', address: '789 Apex Lane, Industrial Park' },
];

export const mockProjects: Project[] = [
    { id: 'proj-1', name: 'Office Security Upgrade', clientId: 'cli-1' },
    { id: 'proj-2', name: 'New HQ Network Setup', clientId: 'cli-2' },
    { id: 'proj-3', name: 'Warehouse Surveillance System', clientId: 'cli-3' },
    { id: 'proj-4', name: 'Retail Store Audio System', clientId: 'cli-1' },
];

export const mockQuotations: Quotation[] = [
  { id: 'Q-2024-001', client: 'Innovate Corp', projectName: 'Office Security Upgrade', date: '2024-07-15', total: 12500, status: 'Approved' },
  { id: 'Q-2024-002', client: 'Quantum Solutions', projectName: 'New HQ Network Setup', date: '2024-07-18', total: 25000, status: 'Sent' },
  { id: 'Q-2024-003', client: 'Apex Industries', projectName: 'Warehouse Surveillance System', date: '2024-07-20', total: 8500, status: 'Draft' },
  { id: 'Q-2024-004', client: 'Innovate Corp', projectName: 'Retail Store Audio System', date: '2024-07-22', total: 4200, status: 'Rejected' },
  { id: 'Q-2024-005', client: 'Quantum Solutions', projectName: 'Phase 2 Network Expansion', date: '2024-07-25', total: 18000, status: 'Sent' },
];

export const mockInvoices: Invoice[] = [
  { id: 'INV-2024-001', quotationId: 'Q-2024-001', client: 'Innovate Corp', projectName: 'Office Security Upgrade', date: '2024-07-20', dueDate: '2024-08-19', total: 12500, status: 'Sent' },
  { id: 'INV-2024-002', quotationId: 'Q-2023-015', client: 'Old Client LLC', projectName: 'Legacy System Maintenance', date: '2024-06-10', dueDate: '2024-07-10', total: 1500, status: 'Paid' },
  { id: 'INV-2024-003', quotationId: 'Q-2024-000', client: 'Another Company', projectName: 'Fire Alarm Inspection', date: '2024-05-01', dueDate: '2024-05-31', total: 800, status: 'Overdue' },
  { id: 'INV-2024-004', quotationId: 'Q-2023-018', client: 'Ongoing Partner', projectName: 'Q2 Support Contract', date: '2024-07-01', dueDate: '2024-07-31', total: 3000, status: 'Paid' },
];

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

export const defaultQuotationItems: QuotationItem[] = [
    { id: '1', description: 'Hikvision 8-Channel DVR', brandName: 'Hikvision', quantity: 1, unitPrice: 150, total: 150, imageUrl: 'https://picsum.photos/seed/dvr/100/100', imageHint: 'security dvr' },
    { id: '2', description: '2MP Dome Camera', brandName: 'Hikvision', quantity: 4, unitPrice: 55, total: 220, imageUrl: 'https://picsum.photos/seed/camera/100/100', imageHint: 'dome camera' },
    { id: '3', description: '1TB Surveillance Hard Drive', brandName: 'Seagate', quantity: 1, unitPrice: 60, total: 60, imageUrl: 'https://picsum.photos/seed/hdd/100/100', imageHint: 'hard drive' },
    { id: '4', description: '100m CAT6 Cable', brandName: 'Generic', quantity: 1, unitPrice: 40, total: 40, imageUrl: 'https://picsum.photos/seed/cable/100/100', imageHint: 'ethernet cable' },
    { id: '5', description: 'Installation & Configuration Labor', brandName: 'QuoteCraft', quantity: 8, unitPrice: 75, total: 600, imageUrl: 'https://picsum.photos/seed/labor/100/100', imageHint: 'technician working' },
];
