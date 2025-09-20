
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { subscribeToCollection, addData, updateData, deleteData, type Project, type Client } from '@/lib/data';
import { MoreHorizontal, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { ProjectForm } from './project-form';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    const unsubProjects = subscribeToCollection<Project>('projects', setProjects);
    const unsubClients = subscribeToCollection<Client>('clients', setClients);

    return () => {
      unsubProjects();
      unsubClients();
    };
  }, []);

  const handleProjectSave = async (project: Omit<Project, 'id'> & { id?: string }) => {
    try {
      if (project.id) {
        await updateData('projects', project.id, project);
        toast({
          title: 'Project Updated',
          description: `The details for ${project.name} have been updated.`
        });
      } else {
        await addData('projects', project);
        toast({
          title: 'Project Added',
          description: `The project ${project.name} has been created.`
        });
      }
      setDialogOpen(false);
      setEditingProject(undefined);
    } catch (error) {
       toast({
        title: 'Error',
        description: `Failed to save project.`,
        variant: 'destructive',
      });
    }
  };
  
  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setDialogOpen(true);
  };
  
  const handleAddNewClick = () => {
    setEditingProject(undefined);
    setDialogOpen(true);
  };
  
  const handleDeleteProject = async (projectId: string) => {
    const projectToDelete = projects.find(p => p.id === projectId);
    if (!projectToDelete) return;
    
    try {
        await deleteData('projects', projectId);
        toast({
            title: 'Project Deleted',
            description: `The project "${projectToDelete.name}" has been deleted.`,
            variant: 'destructive',
        });
    } catch (error) {
        toast({
            title: 'Error Deleting Project',
            description: (error as Error).message,
            variant: 'destructive',
        });
    }
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
      <Dialog open={dialogOpen} onOpenChange={(isOpen) => {
          setDialogOpen(isOpen);
          if (!isOpen) setEditingProject(undefined);
      }}>
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <CardTitle className="font-headline">Projects</CardTitle>
                <CardDescription>
                  Track all your projects from start to finish.
                </CardDescription>
              </div>
               <Button onClick={handleAddNewClick} className="w-full md:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Project
                </Button>
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
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">
                        <span className="sr-only">Actions</span>
                    </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                        <TableCell className="font-medium">
                            <Link href={`/projects/${project.id}`} className="hover:underline">
                                {project.name}
                            </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{getClientName(project.clientId)}</TableCell>
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
                                <DropdownMenuItem asChild>
                                    <Link href={`/projects/${project.id}`}>View Details</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleEditClick(project)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    This will permanently delete the project &quot;{project.name}&quot;.
                                    This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteProject(project.id)}>
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
            {filteredProjects.length === 0 && (
               <div className="text-center py-10 text-muted-foreground">
                  No projects found for &quot;{searchTerm}&quot;.
              </div>
            )}
          </CardContent>
        </Card>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
            <DialogDescription>
              {editingProject 
                ? `Update the details for ${editingProject.name}.`
                : 'Fill in the details below to create a new project.'
              }
            </DialogDescription>
          </DialogHeader>
          <ProjectForm project={editingProject} onSave={handleProjectSave} clients={clients} />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
