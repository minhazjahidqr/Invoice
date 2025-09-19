
'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/app-layout';
import { QuotationForm } from './quotation-form';
import { mockClients, type Client } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewQuotationPage() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setClients(mockClients);
    const handleStorageChange = () => {
      const newClients = JSON.parse(localStorage.getItem('clients') || '[]');
      setClients(newClients);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleClientsUpdate = (updatedClients: Client[]) => {
    setClients(updatedClients);
  };

  return (
    <AppLayout>
      <div className="mx-auto grid max-w-4xl flex-1 auto-rows-max gap-4">
        <div className="flex items-center gap-4">
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 font-headline">
            Create Quotation
          </h1>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Quotation Details</CardTitle>
                <CardDescription>Fill out the details below to create a new quotation.</CardDescription>
            </CardHeader>
            <CardContent>
                 <QuotationForm 
                    clients={clients}
                    onClientsUpdate={handleClientsUpdate}
                 />
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
