
'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { addData, updateData, deleteData, subscribeToCollection, type Client } from '@/lib/data';
import { MoreHorizontal, UserPlus, MapPin, Trash2, Pencil, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ClientForm } from './client-form';
import { useToast } from '@/hooks/use-toast';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = subscribeToCollection<Client>('clients', setClients);
    return () => unsubscribe();
  }, []);

  const handleClientSave = async (clientToSave: Omit<Client, 'id'> & { id?: string }) => {
    let message = '';
    try {
      if (clientToSave.id) {
        await updateData('clients', clientToSave.id, clientToSave);
        message = `The details for ${clientToSave.name} have been updated.`;
      } else {
        const newClient = await addData('clients', clientToSave);
        message = `Client ${newClient.name} has been added.`;
      }
      toast({
        title: 'Client Saved',
        description: message,
      });
      setFormDialogOpen(false);
      setEditingClient(undefined);
    } catch (error) {
      toast({
        title: 'Error Saving Client',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteClient = async (clientId: string) => {
    const clientToDelete = clients.find(c => c.id === clientId);
    if (!clientToDelete) return;

    try {
      await deleteData('clients', clientId);
      toast({
        title: 'Client Deleted',
        description: `The client ${clientToDelete.name} has been deleted.`,
        variant: 'destructive',
      });
    } catch (error) {
      toast({
        title: 'Error Deleting Client',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setFormDialogOpen(true);
  };
  
  const handleAddNewClick = () => {
    setEditingClient(undefined);
    setFormDialogOpen(true);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    client.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.address && client.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AppLayout>
      <Dialog open={formDialogOpen} onOpenChange={(isOpen) => {
        setFormDialogOpen(isOpen);
        if (!isOpen) setEditingClient(undefined);
      }}>
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <CardTitle className="font-headline">Clients</CardTitle>
                <CardDescription>
                  View and manage your client information.
                </CardDescription>
              </div>
              <Button onClick={handleAddNewClick} className="w-full md:w-auto">
                <UserPlus className="mr-2 h-4 w-4" /> Add New Client
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Filter clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                    <TableHead className="text-right">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                        <div>{client.name}</div>
                        <div className="text-muted-foreground text-sm md:hidden mt-1">{client.phone}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{client.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{client.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                         <AlertDialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                {client.address && (
                                  <DropdownMenuItem asChild>
                                    <a 
                                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client.address)}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center"
                                    >
                                      <MapPin className="mr-2 h-4 w-4"/>
                                      View on Map
                                    </a>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleEditClick(client)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the client
                                  &quot;{client.name}&quot; and all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteClient(client.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                         </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredClients.length === 0 && (
               <div className="text-center py-10 text-muted-foreground">
                  No clients found.
              </div>
            )}
          </CardContent>
        </Card>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
            <DialogDescription>
              {editingClient 
                ? `Update the details for ${editingClient.name}.`
                : 'Fill in the details below to create a new client.'
              }
            </DialogDescription>
          </DialogHeader>
          <ClientForm client={editingClient} onSave={handleClientSave} />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
