
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { login, updateUser, type User } from '@/lib/auth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserEditForm } from '@/app/settings/user-edit-form';


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('user');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [firstLoginUser, setFirstLoginUser] = useState<User | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(username, password);
      if (user.requiresPasswordChange) {
        setFirstLoginUser(user);
        setLoading(false);
      } else {
        toast({
          title: 'Login Successful',
          description: "Welcome back!",
        });
        router.push('/');
      }
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };
  
  const handlePasswordSet = (user: User) => {
    try {
        const updatedUser = { ...user, requiresPasswordChange: false };
        updateUser(updatedUser);
        toast({
            title: 'Password Updated',
            description: 'Your new password has been set. Please log in again.',
        });
        setFirstLoginUser(null);
        setPassword('');
    } catch(error) {
         toast({
            title: 'Update Failed',
            description: (error as Error).message,
            variant: 'destructive',
        });
    }
  }

  const handleForgotPassword = () => {
    toast({
        title: 'Forgot Password',
        description: 'Password reset is not available in this demo. Please contact an administrator.',
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Dialog open={!!firstLoginUser} onOpenChange={(isOpen) => !isOpen && setFirstLoginUser(null)}>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your dashboard. Default: user / password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="user"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <button 
                      type="button"
                      onClick={handleForgotPassword}
                      className="ml-auto inline-block text-sm underline"
                  >
                      Forgot your password?
                  </button>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Set Your New Password</DialogTitle>
                <DialogDescription>
                    For your security, please set a new password for your account.
                </DialogDescription>
            </DialogHeader>
            {firstLoginUser && (
                 <UserEditForm user={firstLoginUser} onSave={handlePasswordSet} />
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
