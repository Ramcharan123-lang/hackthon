import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { GraduationCap, Users, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface RegistrationProps {
  onRegister: (userType: 'admin' | 'student', userData: any) => void;
  onBackToLogin: () => void;
  existingAccounts: any[];
}

export function Registration({ onRegister, onBackToLogin, existingAccounts }: RegistrationProps) {
  const [adminForm, setAdminForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [studentForm, setStudentForm] = useState({ email: '', password: '', confirmPassword: '' });

  const handleAdminRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (adminForm.password !== adminForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate password length
    if (adminForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Check if account already exists
    const accountExists = existingAccounts.some(
      account => account.email.toLowerCase() === adminForm.email.toLowerCase()
    );

    if (accountExists) {
      toast.error('An account with this email already exists. Please login instead.');
      return;
    }

    // Create new account
    toast.success('Account created successfully! Please complete your profile.');
    onRegister('admin', {
      email: adminForm.email,
      password: adminForm.password,
      profileComplete: false
    });
  };

  const handleStudentRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (studentForm.password !== studentForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate password length
    if (studentForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Check if account already exists
    const accountExists = existingAccounts.some(
      account => account.email.toLowerCase() === studentForm.email.toLowerCase()
    );

    if (accountExists) {
      toast.error('An account with this email already exists. Please login instead.');
      return;
    }

    // Create new account
    toast.success('Account created successfully! Please complete your profile.');
    onRegister('student', {
      email: studentForm.email,
      password: studentForm.password,
      profileComplete: false
    });
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
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Register for Project Management Platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="student" className="w-full">
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
              <form onSubmit={handleStudentRegister} className="space-y-4">
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
                    placeholder="At least 6 characters"
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-confirm-password">Confirm Password</Label>
                  <Input
                    id="student-confirm-password"
                    type="password"
                    placeholder="Re-enter your password"
                    value={studentForm.confirmPassword}
                    onChange={(e) => setStudentForm({ ...studentForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create Student Account
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="admin">
              <form onSubmit={handleAdminRegister} className="space-y-4">
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
                    placeholder="At least 6 characters"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-confirm-password">Confirm Password</Label>
                  <Input
                    id="admin-confirm-password"
                    type="password"
                    placeholder="Re-enter your password"
                    value={adminForm.confirmPassword}
                    onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create Admin Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <Button 
              variant="link" 
              onClick={onBackToLogin}
              className="text-sm flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Already have an account? Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
