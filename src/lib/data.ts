
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

export async function addData<T>(collectionName: string, data: Omit<T, 'id'>): Promise<T & { id: string }> {
  const docRef = await addDoc(collection(db, collectionName), data);
  const id = docRef.id;
  await updateDoc(docRef, { id });
  return { ...data, id } as T & { id: string };
}

export async function updateData<T>(collectionName: string, id: string, data: Partial<T>) {
  // To get the actual document ID, we need to query by our custom 'id' field
  const q = query(collection(db, collectionName), where("id", "==", id));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    throw new Error(`Document with id ${id} not found in ${collectionName}`);
  }
  
  const docRef = querySnapshot.docs[0].ref;
  await updateDoc(docRef, data);
}


export async function deleteData(collectionName: string, id: string) {
  const q = query(collection(db, collectionName), where("id", "==", id));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    console.warn(`Document with id ${id} not found for deletion in ${collectionName}`);
    return;
  }

  const docRef = querySnapshot.docs[0].ref;
  await deleteDoc(docRef);
}


export async function getData<T>(collectionName: string, id: string): Promise<T | null> {
    const q = query(collection(db, collectionName), where("id", "==", id));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }
    
    return querySnapshot.docs[0].data() as T;
}

export function subscribeToCollection<T>(collectionName: string, callback: (data: T[]) => void) {
  const q = query(collection(db, collectionName));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const data: T[] = [];
    querySnapshot.forEach((doc) => {
      data.push(doc.data() as T);
    });
    callback(data);
  }, (error) => {
      console.error(`Error subscribing to ${collectionName}: `, error);
  });
  return unsubscribe;
}


// ========== Initial Data Seeding (if necessary) ==========

export const defaultQuotationItems: QuotationItem[] = [
    { id: '1', description: 'Hikvision 8-Channel DVR', brandName: 'Hikvision', quantity: 1, unitPrice: 150, total: 150, imageUrl: 'https://picsum.photos/seed/dvr/100/100', imageHint: 'security dvr' },
    { id: '2', description: '2MP Dome Camera', brandName: 'Hikvision', quantity: 4, unitPrice: 55, total: 220, imageUrl: 'https://picsum.photos/seed/camera/100/100', imageHint: 'dome camera' },
    { id: '3', description: '1TB Surveillance Hard Drive', brandName: 'Seagate', quantity: 1, unitPrice: 60, total: 60, imageUrl: 'https://picsum.photos/seed/hdd/100/100', imageHint: 'hard drive' },
    { id: '4', description: '100m CAT6 Cable', brandName: 'Generic', quantity: 1, unitPrice: 40, total: 40, imageUrl: 'https://picsum.photos/seed/cable/100/100', imageHint: 'ethernet cable' },
    { id: '5', description: 'Installation & Configuration Labor', brandName: 'QuoteCraft', quantity: 8, unitPrice: 75, total: 600, imageUrl: 'https://picsum.photos/seed/labor/100/100', imageHint: 'technician working' },
];

async function seedCollection<T>(collectionName: string, data: Omit<T, 'id'>[], checkField: keyof Omit<T, 'id'>) {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(query(collectionRef));
    if (snapshot.empty) {
        console.log(`Collection "${collectionName}" is empty. Seeding...`);
        const batch = writeBatch(db);
        data.forEach(item => {
            const docRef = doc(collectionRef);
            batch.set(docRef, { ...item, id: docRef.id });
        });
        await batch.commit();
        console.log(`Seeded ${data.length} documents into "${collectionName}".`);
    } else {
         console.log(`Collection "${collectionName}" already has data.`);
    }
}


async function seedInitialData() {
    console.log("Checking if initial data seeding is necessary...");

    const initialMockClients: Omit<Client, 'id'>[] = [
        { name: 'Innovate Corp', email: 'contact@innovatecorp.com', phone: '+1-202-555-0149', address: '123 Innovation Drive, Tech City' },
        { name: 'Quantum Solutions', email: 'hello@quantumsolutions.dev', phone: '+1-202-555-0128', address: '456 Quantum Way, Silicon Valley' },
        { name: 'Apex Industries', email: 'info@apexindustries.net', phone: '+1-202-555-0182', address: '789 Apex Lane, Industrial Park' },
    ];
    await seedCollection<Client>('clients', initialMockClients, 'name');

    const clientsSnapshot = await getDocs(collection(db, "clients"));
    const clients = clientsSnapshot.docs.map(doc => doc.data() as Client);

    if (clients.length > 0) {
        const initialMockProjects: Omit<Project, 'id'>[] = [
            { name: 'Office Security Upgrade', clientId: clients[0].id },
            { name: 'New HQ Network Setup', clientId: clients[1].id },
            { name: 'Warehouse Surveillance System', clientId: clients[2].id },
            { name: 'Retail Store Audio System', clientId: clients[0].id },
        ];
        await seedCollection<Project>('projects', initialMockProjects, 'name');
        
        const initialMockQuotations: Omit<Quotation, 'id'>[] = [
          { clientId: clients[0].id, projectName: 'Office Security Upgrade', date: new Date('2024-07-15').toISOString(), total: 1075, status: 'Approved', items: defaultQuotationItems },
          { clientId: clients[1].id, projectName: 'New HQ Network Setup', date: new Date('2024-07-18').toISOString(), total: 25000, status: 'Sent', items: defaultQuotationItems },
          { clientId: clients[2].id, projectName: 'Warehouse Surveillance System', date: new Date('2024-07-20').toISOString(), total: 8500, status: 'Draft', items: defaultQuotationItems },
          { clientId: clients[0].id, projectName: 'Retail Store Audio System', date: new Date('2024-07-22').toISOString(), total: 4200, status: 'Rejected', items: defaultQuotationItems },
        ];
        await seedCollection<Quotation>('quotations', initialMockQuotations, 'projectName');

        const quotationsSnapshot = await getDocs(collection(db, "quotations"));
        const quotations = quotationsSnapshot.docs.map(d => d.data() as Quotation);

        if (quotations.length > 0) {
            const initialMockInvoices: Omit<Invoice, 'id'>[] = [
                { quotationId: quotations[0].id, clientId: clients[0].id, projectName: 'Office Security Upgrade', date: new Date('2024-07-20').toISOString(), dueDate: new Date('2024-08-19').toISOString(), total: 1075, status: 'Sent', items: defaultQuotationItems },
                { quotationId: quotations[1].id, clientId: clients[1].id, projectName: 'Legacy System Maintenance', date: new Date('2024-06-10').toISOString(), dueDate: new Date('2024-07-10').toISOString(), total: 1500, status: 'Paid', items: defaultQuotationItems },
                { quotationId: quotations[2].id, clientId: clients[2].id, projectName: 'Fire Alarm Inspection', date: new Date('2024-05-01').toISOString(), dueDate: new Date('2024-05-31').toISOString(), total: 800, status: 'Overdue', items: defaultQuotationItems },
                { quotationId: quotations[3].id, clientId: clients[0].id, projectName: 'Q2 Support Contract', date: new Date('2024-07-01').toISOString(), dueDate: new Date('2024-07-31').toISOString(), total: 3000, status: 'Paid', items: defaultQuotationItems },
            ];
             await seedCollection<Invoice>('invoices', initialMockInvoices, 'projectName');
        }
    }
}

if (typeof window !== 'undefined') {
  // Check if seeding has been done
  if (!localStorage.getItem('isDataSeeded')) {
    seedInitialData().then(() => {
      localStorage.setItem('isDataSeeded', 'true');
      console.log('Finished data seeding.');
    }).catch(console.error);
  }
}

// LEGACY functions to be removed.
export function getFromStorage<T>(key: string, fallback: T): T { return fallback; }
export function saveToStorage<T>(key: string, data: T) {}
