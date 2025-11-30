import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ProfileProps {
  user: any;
  userType: 'admin' | 'student';
  onBack: () => void;
  onUpdate?: (user: any) => void;
}

export function Profile({ user, userType, onBack, onUpdate }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);

  const handleSave = () => {
    // Validate phone number if provided
    if (formData.phone && formData.phone.trim()) {
      const digitsOnly = formData.phone.replace(/\D/g, '');
      if (digitsOnly.length !== 10) {
        toast.error('Phone number must be exactly 10 digits');
        return;
      }
    }
    
    // In a real app, this would save to backend
    if (onUpdate) {
      onUpdate(formData);
    }
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  const getYearDisplay = (year: string) => {
    if (!year) return '';
    // If it's already a number (1, 2, 3, 4), display as "Year X"
    if (['1', '2', '3', '4'].includes(year)) {
      return `Year ${year}`;
    }
    // For backward compatibility with old data
    const yearMap: Record<string, string> = {
      freshman: 'Year 1',
      sophomore: 'Year 2',
      junior: 'Year 3',
      senior: 'Year 4',
      graduate: 'Year 4'
    };
    return yearMap[year.toLowerCase()] || year;
  };

  const displayName = user.fullName || user.name;
  const displayYear = user.academicYear || user.year;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button variant="ghost" onClick={onBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1>Profile Settings</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarFallback className="text-lg">
                    {displayName.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{displayName}</CardTitle>
                <CardDescription>
                  {userType === 'admin' ? user.department : `${user.major} • ${getYearDisplay(displayYear)}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Role</Label>
                    <div className="mt-1">
                      <Badge variant="secondary" className="capitalize">
                        {userType}
                      </Badge>
                    </div>
                  </div>
                  
                  {userType === 'student' && (
                    <>
                      <div>
                        <Label>Student ID</Label>
                        <p className="mt-1">{user.studentId}</p>
                      </div>
                      <div>
                        <Label>Academic Year</Label>
                        <p className="mt-1">{getYearDisplay(displayYear)}</p>
                      </div>
                      {user.averageGrade && (
                        <div>
                          <Label>Average Grade</Label>
                          <p className="mt-1">{user.averageGrade}</p>
                          <p className="text-xs text-muted-foreground mt-1">Assigned by instructor</p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {userType === 'admin' && (
                    <div>
                      <Label>Courses Managing</Label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {user.courses?.map((course: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {course}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Manage your profile information and preferences
                    </CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.fullName || formData.name}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value, name: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {userType === 'admin' && (
                    <>
                      <div>
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="office">Office Location</Label>
                        <Input
                          id="office"
                          value={formData.office || ''}
                          onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                          disabled={!isEditing}
                          placeholder="e.g., Science Building Room 204"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone || ''}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          disabled={!isEditing}
                          placeholder="e.g., 1234567890 or (555) 123-4567"
                        />
                        {isEditing && (
                          <p className="text-xs text-muted-foreground mt-1">Must be 10 digits</p>
                        )}
                      </div>
                    </>
                  )}

                  {userType === 'student' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="studentId">Student ID</Label>
                          <Input
                            id="studentId"
                            value={formData.studentId}
                            disabled={true}
                          />
                        </div>
                        <div>
                          <Label htmlFor="major">Major</Label>
                          <Input
                            id="major"
                            value={formData.major}
                            onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone || ''}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          disabled={!isEditing}
                          placeholder="e.g., 1234567890 or (555) 123-4567"
                        />
                        {isEditing && (
                          <p className="text-xs text-muted-foreground mt-1">Must be 10 digits</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="academicYear">Academic Year</Label>
                        {isEditing ? (
                          <Select
                            value={formData.academicYear || formData.year}
                            onValueChange={(value) => setFormData({ ...formData, academicYear: value, year: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select your year" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Year 1</SelectItem>
                              <SelectItem value="2">Year 2</SelectItem>
                              <SelectItem value="3">Year 3</SelectItem>
                              <SelectItem value="4">Year 4</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id="academicYear"
                            value={getYearDisplay(formData.academicYear || formData.year)}
                            disabled={true}
                          />
                        )}
                      </div>
                      <div>
                        <Label htmlFor="averageGrade">
                          Average Grade
                          <span className="text-xs text-muted-foreground ml-2">(Set by instructor only)</span>
                        </Label>
                        <Input
                          id="averageGrade"
                          value={formData.averageGrade || 'Not assigned yet'}
                          disabled={true}
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio || ''}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
