
'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { getFromStorage, saveToStorage, type Project, type Client } from '@/lib/data';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ProjectForm } from './project-form';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = () => {
      setProjects(getFromStorage('projects', []));
      setClients(getFromStorage('clients', []));
    };

    loadData();

    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const updateProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    saveToStorage('projects', newProjects);
    window.dispatchEvent(new Event('storage'));
  }

  const handleProjectSave = (project: Omit<Project, 'id'> & { id?: string }) => {
    let newProjects;
    if (project.id) {
      newProjects = projects.map(p => p.id === project.id ? project as Project : p);
    } else {
      const newProject = { ...project, id: `proj-${Date.now()}` } as Project;
      newProjects = [newProject, ...projects];
    }
    updateProjects(newProjects);
    toast({
      title: 'Project Saved',
      description: `The details for ${project.name} have been saved.`
    });
    setDialogOpen(false);
  };
  
  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Unknown Client';
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getClientName(project.clientId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <CardTitle className="font-headline">Projects</CardTitle>
                <CardDescription>
                  Track all your projects from start to finish.
                </CardDescription>
              </div>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Project
                </Button>
              </DialogTrigger>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Filter projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell className="text-muted-foreground">{getClientName(project.clientId)}</TableCell>
                    <TableCell>
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredProjects.length === 0 && (
               <div className="text-center py-10 text-muted-foreground">
                  No projects found for &quot;{searchTerm}&quot;.
              </div>
            )}
          </CardContent>
        </Card>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new project.
            </DialogDescription>
          </DialogHeader>
          <ProjectForm onSave={handleProjectSave} clients={clients} />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
