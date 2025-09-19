
'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { mockClients, type Client } from '@/lib/data';
import { MoreHorizontal, UserPlus, MapPin, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ClientForm } from './client-form';
import { useToast } from '@/hooks/use-toast';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const { toast } = useToast();

  const handleClientSave = (clientToSave: Client) => {
    let message = '';
    if (clientToSave.id && clients.some(c => c.id === clientToSave.id)) {
      setClients(clients.map(c => c.id === clientToSave.id ? clientToSave : c));
      message = `The details for ${clientToSave.name} have been updated.`;
    } else {
      const newClient = { ...clientToSave, id: `cli-${Date.now()}` };
      setClients([newClient, ...clients]);
      message = `Client ${newClient.name} has been added.`;
    }
    toast({
      title: 'Client Saved',
      description: message,
    });
    setFormDialogOpen(false);
    setEditingClient(undefined);
  };
  
  const handleDeleteClient = (clientId: string) => {
    const clientToDelete = clients.find(c => c.id === clientId);
    if (!clientToDelete) return;

    setClients(clients.filter(c => c.id !== clientId));
    toast({
      title: 'Client Deleted',
      description: `The client ${clientToDelete.name} has been deleted.`,
      variant: 'destructive',
    });
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline">Clients</CardTitle>
                <CardDescription>
                  View and manage your client information.
                </CardDescription>
              </div>
              <Button onClick={handleAddNewClick}>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="hidden md:table-cell">Address</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{client.address}</TableCell>
                    <TableCell>
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
                              <DropdownMenuItem>View Details</DropdownMenuItem>
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
                                <DropdownMenuItem className="text-destructive">
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
            {filteredClients.length === 0 && (
               <div className="text-center py-10 text-muted-foreground">
                  No clients found for &quot;{searchTerm}&quot;.
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
