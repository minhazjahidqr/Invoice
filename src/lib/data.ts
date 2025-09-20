
'use client';

import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  onSnapshot,
  writeBatch,
  getDoc,
  Timestamp,
} from 'firebase/firestore';

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

// ========== Generic Firestore Functions ==========

export async function addData<T extends { id?: string }>(collectionName: string, data: T): Promise<T & { id: string }> {
  const docRef = await addDoc(collection(db, collectionName), data);
  const id = docRef.id;
  await updateDoc(docRef, { id });
  return { ...data, id };
}

export async function updateData<T>(collectionName: string, id: string, data: Partial<T>) {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data);
}

export async function deleteData(collectionName: string, id: string) {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
}

export async function getData<T>(collectionName: string, id: string): Promise<T | null> {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as T;
    }
    return null;
}

export function subscribeToCollection<T>(collectionName: string, callback: (data: T[]) => void) {
  const q = query(collection(db, collectionName));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const data: T[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as unknown as T);
    });
    callback(data);
  });
  return unsubscribe;
}


// ========== Initial Data Seeding (if necessary) ==========

const defaultQuotationItems: QuotationItem[] = [
    { id: '1', description: 'Hikvision 8-Channel DVR', brandName: 'Hikvision', quantity: 1, unitPrice: 150, total: 150, imageUrl: 'https://picsum.photos/seed/dvr/100/100', imageHint: 'security dvr' },
    { id: '2', description: '2MP Dome Camera', brandName: 'Hikvision', quantity: 4, unitPrice: 55, total: 220, imageUrl: 'https://picsum.photos/seed/camera/100/100', imageHint: 'dome camera' },
    { id: '3', description: '1TB Surveillance Hard Drive', brandName: 'Seagate', quantity: 1, unitPrice: 60, total: 60, imageUrl: 'https://picsum.photos/seed/hdd/100/100', imageHint: 'hard drive' },
    { id: '4', description: '100m CAT6 Cable', brandName: 'Generic', quantity: 1, unitPrice: 40, total: 40, imageUrl: 'https://picsum.photos/seed/cable/100/100', imageHint: 'ethernet cable' },
    { id: '5', description: 'Installation & Configuration Labor', brandName: 'QuoteCraft', quantity: 8, unitPrice: 75, total: 600, imageUrl: 'https://picsum.photos/seed/labor/100/100', imageHint: 'technician working' },
];

const initialMockClients: Omit<Client, 'id'>[] = [
  { name: 'Innovate Corp', email: 'contact@innovatecorp.com', phone: '+1-202-555-0149', address: '123 Innovation Drive, Tech City' },
  { name: 'Quantum Solutions', email: 'hello@quantumsolutions.dev', phone: '+1-202-555-0128', address: '456 Quantum Way, Silicon Valley' },
  { name: 'Apex Industries', email: 'info@apexindustries.net', phone: '+1-202-555-0182', address: '789 Apex Lane, Industrial Park' },
];

async function seedInitialData() {
    console.log("Checking if initial data seeding is necessary...");

    const collectionsToSeed = {
        clients: initialMockClients,
    };

    const batch = writeBatch(db);
    let shouldSeed = false;

    for (const [name, data] of Object.entries(collectionsToSeed)) {
        const collectionRef = collection(db, name);
        const snapshot = await getDocs(query(collectionRef));
        if (snapshot.empty) {
            console.log(`Collection "${name}" is empty. Seeding...`);
            shouldSeed = true;
            data.forEach((item) => {
                const docRef = doc(collectionRef); 
                batch.set(docRef, { ...item, id: docRef.id });
            });
        } else {
            console.log(`Collection "${name}" already has data.`);
        }
    }

    if (shouldSeed) {
        try {
            await batch.commit();
            console.log("Initial data seeded successfully.");
            
            // Now seed dependent data
            const clientsSnapshot = await getDocs(collection(db, "clients"));
            const clients = clientsSnapshot.docs.map(doc => doc.data() as Client);
            
            if (clients.length > 0) {
              const projectsSnapshot = await getDocs(collection(db, "projects"));
              if(projectsSnapshot.empty) {
                  const projectBatch = writeBatch(db);
                  const initialMockProjects: Omit<Project, 'id' | 'clientId'>[] = [
                      { name: 'Office Security Upgrade' },
                      { name: 'New HQ Network Setup' },
                      { name: 'Warehouse Surveillance System' },
                      { name: 'Retail Store Audio System' },
                  ];
                  initialMockProjects.forEach((proj, index) => {
                      const client = clients[index % clients.length];
                      const docRef = doc(collection(db, 'projects'));
                      projectBatch.set(docRef, { ...proj, clientId: client.id, id: docRef.id });
                  });
                  await projectBatch.commit();
                  console.log("Projects seeded.");
              }


              const quotationsSnapshot = await getDocs(collection(db, "quotations"));
              if(quotationsSnapshot.empty) {
                  const quotationBatch = writeBatch(db);
                  const initialMockQuotations: Omit<Quotation, 'id' | 'clientId' | 'items'>[] = [
                    { projectName: 'Office Security Upgrade', date: Timestamp.fromDate(new Date('2024-07-15')).toDate().toISOString(), total: 1075, status: 'Approved' },
                    { projectName: 'New HQ Network Setup', date: Timestamp.fromDate(new Date('2024-07-18')).toDate().toISOString(), total: 25000, status: 'Sent' },
                    { projectName: 'Warehouse Surveillance System', date: Timestamp.fromDate(new Date('2024-07-20')).toDate().toISOString(), total: 8500, status: 'Draft' },
                    { projectName: 'Retail Store Audio System', date: Timestamp.fromDate(new Date('2024-07-22')).toDate().toISOString(), total: 4200, status: 'Rejected' },
                    { projectName: 'Phase 2 Network Expansion', date: Timestamp.fromDate(new Date('2024-07-25')).toDate().toISOString(), total: 18000, status: 'Sent' },
                  ];
                  initialMockQuotations.forEach((quo, index) => {
                      const client = clients[index % clients.length];
                      const docRef = doc(collection(db, 'quotations'));
                      quotationBatch.set(docRef, { ...quo, clientId: client.id, id: docRef.id, items: defaultQuotationItems });
                  });
                  await quotationBatch.commit();
                  console.log("Quotations seeded.");
              }

              const invoicesSnapshot = await getDocs(collection(db, "invoices"));
               if(invoicesSnapshot.empty) {
                  const invoiceBatch = writeBatch(db);
                  const quotations = (await getDocs(collection(db, "quotations"))).docs.map(d => d.data() as Quotation);
                  const initialMockInvoices: Omit<Invoice, 'id' | 'clientId' | 'quotationId' | 'items'>[] = [
                    { projectName: 'Office Security Upgrade', date: Timestamp.fromDate(new Date('2024-07-20')).toDate().toISOString(), dueDate: Timestamp.fromDate(new Date('2024-08-19')).toDate().toISOString(), total: 12500, status: 'Sent' },
                    { projectName: 'Legacy System Maintenance', date: Timestamp.fromDate(new Date('2024-06-10')).toDate().toISOString(), dueDate: Timestamp.fromDate(new Date('2024-07-10')).toDate().toISOString(), total: 1500, status: 'Paid' },
                    { projectName: 'Fire Alarm Inspection', date: Timestamp.fromDate(new Date('2024-05-01')).toDate().toISOString(), dueDate: Timestamp.fromDate(new Date('2024-05-31')).toDate().toISOString(), total: 800, status: 'Overdue' },
                    { projectName: 'Q2 Support Contract', date: Timestamp.fromDate(new Date('2024-07-01')).toDate().toISOString(), dueDate: Timestamp.fromDate(new Date('2024-07-31')).toDate().toISOString(), total: 3000, status: 'Paid' },
                  ];
                   initialMockInvoices.forEach((inv, index) => {
                      const client = clients[index % clients.length];
                      const quotation = quotations[index % quotations.length];
                      const docRef = doc(collection(db, 'invoices'));
                      invoiceBatch.set(docRef, { ...inv, clientId: client.id, quotationId: quotation?.id || '', id: docRef.id, items: defaultQuotationItems });
                  });
                  await invoiceBatch.commit();
                  console.log("Invoices seeded.");
               }
            }
        } catch (error) {
            console.error("Error seeding data:", error);
        }
    }
}

if (typeof window !== 'undefined') {
  seedInitialData();
}

export { defaultQuotationItems };

// LEGACY functions to be removed.
export function getFromStorage<T>(key: string, fallback: T): T { return fallback; }
export function saveToStorage<T>(key: string, data: T) {}
