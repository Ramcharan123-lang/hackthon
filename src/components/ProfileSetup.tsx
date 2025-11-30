import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { User } from 'lucide-react';

interface ProfileSetupProps {
  userType: 'admin' | 'student';
  initialData: any;
  onComplete: (profileData: any) => void;
}

export function ProfileSetup({ userType, initialData, onComplete }: ProfileSetupProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    major: '',
    academicYear: '',
    bio: '',
    studentId: '',
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      // Extract only digits from phone number
      const digitsOnly = formData.phone.replace(/\D/g, '');
      if (digitsOnly.length !== 10) {
        newErrors.phone = 'Phone number must be exactly 10 digits';
      }
    }

    if (userType === 'student') {
      if (!formData.studentId.trim()) {
        newErrors.studentId = 'Student ID is required';
      }

      if (!formData.major.trim()) {
        newErrors.major = 'Major is required';
      }

      if (!formData.academicYear) {
        newErrors.academicYear = 'Academic year is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    toast.success('Profile completed successfully!');
    onComplete(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                Please provide your information to get started
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                className={errors.fullName ? 'border-destructive' : ''}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                readOnly
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed after registration</p>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="e.g., 1234567890 or (555) 123-4567"
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
              <p className="text-xs text-muted-foreground">Enter 10-digit phone number</p>
            </div>

            {/* Student-specific fields */}
            {userType === 'student' && (
              <>
                {/* Student ID */}
                <div className="space-y-2">
                  <Label htmlFor="studentId">
                    Student ID <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="studentId"
                    value={formData.studentId}
                    onChange={(e) => handleChange('studentId', e.target.value)}
                    placeholder="Enter your student ID"
                    className={errors.studentId ? 'border-destructive' : ''}
                  />
                  {errors.studentId && (
                    <p className="text-sm text-destructive">{errors.studentId}</p>
                  )}
                </div>

                {/* Major */}
                <div className="space-y-2">
                  <Label htmlFor="major">
                    Major <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="major"
                    value={formData.major}
                    onChange={(e) => handleChange('major', e.target.value)}
                    placeholder="e.g., Computer Science"
                    className={errors.major ? 'border-destructive' : ''}
                  />
                  {errors.major && (
                    <p className="text-sm text-destructive">{errors.major}</p>
                  )}
                </div>

                {/* Academic Year */}
                <div className="space-y-2">
                  <Label htmlFor="academicYear">
                    Academic Year <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.academicYear}
                    onValueChange={(value) => handleChange('academicYear', value)}
                  >
                    <SelectTrigger className={errors.academicYear ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select your year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Year 1</SelectItem>
                      <SelectItem value="2">Year 2</SelectItem>
                      <SelectItem value="3">Year 3</SelectItem>
                      <SelectItem value="4">Year 4</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.academicYear && (
                    <p className="text-sm text-destructive">{errors.academicYear}</p>
                  )}
                </div>
              </>
            )}

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">
                Bio {userType === 'student' && <span className="text-muted-foreground">(Optional)</span>}
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Tell us a bit about yourself..."
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full">
              Complete Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
