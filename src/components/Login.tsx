import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { GraduationCap, Users } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface LoginProps {
  onLogin: (userType: 'admin' | 'student', userData: any) => void;
  onShowRegistration: () => void;
  accounts: any[];
}

export function Login({ onLogin, onShowRegistration, accounts }: LoginProps) {
  const [adminForm, setAdminForm] = useState({ email: '', password: '' });
  const [studentForm, setStudentForm] = useState({ email: '', password: '' });
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find account in registered accounts
    const account = accounts.find(
      acc => acc.email.toLowerCase() === adminForm.email.toLowerCase() && acc.userType === 'admin'
    );

    if (!account) {
      toast.error('Account not found. Please create an account first.');
      return;
    }

    if (account.password !== adminForm.password) {
      toast.error('Incorrect password. Please try again.');
      return;
    }

    // Login successful - pass the stored user data
    toast.success('Login successful!');
    onLogin('admin', account);
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find account in registered accounts
    const account = accounts.find(
      acc => acc.email.toLowerCase() === studentForm.email.toLowerCase() && acc.userType === 'student'
    );

    if (!account) {
      toast.error('Account not found. Please create an account first.');
      return;
    }

    if (account.password !== studentForm.password) {
      toast.error('Incorrect password. Please try again.');
      return;
    }

    // Login successful - pass the stored user data
    toast.success('Login successful!');
    onLogin('student', account);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle>FEDF-PS35</CardTitle>
          <CardDescription>
            {activeTab === 'student' ? 'Sign in to Student Portal' : 'Sign in to Admin Portal'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="student" className="w-full" onValueChange={(value) => setActiveTab(value as 'student' | 'admin')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Student
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Admin
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="student">
              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-email">Email</Label>
                  <Input
                    id="student-email"
                    type="email"
                    placeholder="student@university.edu"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-password">Password</Label>
                  <Input
                    id="student-password"
                    type="password"
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Sign In as Student
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="admin">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@university.edu"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Sign In as Admin
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <Button 
              variant="link" 
              onClick={onShowRegistration}
              className="text-sm"
            >
              Don't have an account? Create one
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
