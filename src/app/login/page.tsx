
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Icons } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { login, updateUser, type User } from '@/lib/auth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const formSchema = z.object({
  username: z.string().min(1, 'Username or Email is required.'),
  password: z.string().min(1, 'Password is required.'),
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [firstLoginUser, setFirstLoginUser] = useState<User | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: 'user',
      password: '',
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleLogin = async (values: z.infer<typeof formSchema>) => {
    try {
      const user = await login(values.username, values.password);
      if (user) {
        if (user.requiresPasswordChange) {
          setFirstLoginUser(user);
        } else {
          toast({
            title: 'Login Successful',
            description: `Welcome back, ${user.name}!`,
          });
          router.push('/');
        }
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid username or password.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Login Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handlePasswordSet = async (values: z.infer<typeof passwordSchema>) => {
    if (!firstLoginUser) return;
    try {
      await updateUser({ id: firstLoginUser.id, password: values.newPassword });
      toast({
        title: 'Password Set Successfully',
        description: 'You can now log in with your new password.',
      });
      setFirstLoginUser(null);
      // Automatically log in the user after they set their password
      const loggedInUser = await login(firstLoginUser.email, values.newPassword);
       if (loggedInUser) {
          router.push('/');
       } else {
          // This case should ideally not happen
          form.reset();
       }
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  }

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <Icons.Logo className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="font-headline">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username or Email</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., user or user@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <Dialog open={!!firstLoginUser} onOpenChange={(isOpen) => !isOpen && setFirstLoginUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Your New Password</DialogTitle>
            <DialogDescription>
              For security, please set a new password for your account.
            </DialogDescription>
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordSet)} className="space-y-4">
               <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Set Password and Login</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
