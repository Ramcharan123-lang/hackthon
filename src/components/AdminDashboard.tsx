import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Plus, Eye, FileText, Users, Calendar, BarChart3, MessageCircle, LogOut, ExternalLink, Edit, CheckCircle2, Clock, Target, AlertCircle, Trash2 } from 'lucide-react';
import { GroupChat } from './GroupChat';
import { toast } from 'sonner@2.0.3';
import * as api from '../utils/api';

interface AdminDashboardProps {
  user: any;
  onShowProfile: () => void;
  onLogout: () => void;
  projects: any[];
  onUpdateProjects: (projects: any[]) => void;
  submissions: any[];
  onUpdateSubmissions: (submissions: any[]) => void;
  tasks: any[];
  onCreateStudentAccount: (studentData: any) => any;
  allAccounts: any[];
  messages: any[];
  onUpdateMessages: (messages: any[]) => void;
}

export function AdminDashboard({ user, onShowProfile, onLogout, projects, onUpdateProjects, submissions, onUpdateSubmissions, tasks, onCreateStudentAccount, allAccounts, messages, onUpdateMessages }: AdminDashboardProps) {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isMonitorProjectOpen, setIsMonitorProjectOpen] = useState(false);
  const [isViewSubmissionOpen, setIsViewSubmissionOpen] = useState(false);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [isCreateStudentOpen, setIsCreateStudentOpen] = useState(false);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  
  const [newProject, setNewProject] = useState({
    title: '',
    course: '',
    groups: '',
    dueDate: '',
    description: '',
    status: 'Not Started',
    objectives: '',
    deliverables: '',
    evaluationCriteria: ''
  });
  
  const [editProject, setEditProject] = useState({
    title: '',
    course: '',
    groups: '',
    dueDate: '',
    description: '',
    status: 'Not Started',
    objectives: '',
    deliverables: '',
    evaluationCriteria: ''
  });

  const [gradeData, setGradeData] = useState({
    grade: '',
    feedback: ''
  });

  const [newStudent, setNewStudent] = useState({
    email: '',
    password: '',
    name: '',
    studentId: '',
    phone: '',
    academicYear: '',
    branch: '',
    groupNumber: ''
  });

  // Default milestones for projects
  const defaultMilestones = [
    { id: 1, name: 'Project Proposal', completed: false, dueDate: '' },
    { id: 2, name: 'Design Phase', completed: false, dueDate: '' },
    { id: 3, name: 'Implementation', completed: false, dueDate: '' },
    { id: 4, name: 'Final Report', completed: false, dueDate: '' }
  ];

  const [milestones, setMilestones] = useState(defaultMilestones);

  const handleUpdateMembers = (projectId: number, members: string[]) => {
    const updatedProjects = projects.map(p => 
      p.id === projectId 
        ? { ...p, groupMembers: members }
        : p
    );
    onUpdateProjects(updatedProjects);
  };

  const handleCreateProject = async () => {
    // Validation
    if (!newProject.title.trim()) {
      toast.error('Please enter a project title');
      return;
    }
    if (!newProject.course.trim()) {
      toast.error('Please enter a course code');
      return;
    }
    if (!newProject.groups || parseInt(newProject.groups) < 1) {
      toast.error('Please enter a valid number of groups');
      return;
    }
    if (!newProject.dueDate) {
      toast.error('Please select a due date');
      return;
    }
    if (!newProject.description.trim()) {
      toast.error('Please enter a project description');
      return;
    }

    try {
      // Create new project object
      const projectData = {
        title: newProject.title.trim(),
        course: newProject.course.trim(),
        groups: parseInt(newProject.groups),
        progress: 0,
        dueDate: newProject.dueDate,
        status: newProject.status,
        description: newProject.description.trim(),
        objectives: newProject.objectives.trim(),
        deliverables: newProject.deliverables.trim(),
        evaluationCriteria: newProject.evaluationCriteria.trim(),
        groupMembers: [user.fullName || user.name],
        myRole: 'Team Lead',
        milestones: milestones.map(m => ({ ...m }))
      };

      const response = await api.createProject(projectData);
      
      if (response.success) {
        onUpdateProjects([...projects, response.project]);

        // Reset form
        setNewProject({
          title: '',
          course: '',
          groups: '',
          dueDate: '',
          description: '',
          status: 'Not Started',
          objectives: '',
          deliverables: '',
          evaluationCriteria: ''
        });
        setMilestones(defaultMilestones);
        setIsCreateProjectOpen(false);

        toast.success('Project created successfully!');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project. Please try again.');
    }
  };

  const handleEditProject = (project: any) => {
    setSelectedProject(project);
    setEditProject({
      title: project.title,
      course: project.course,
      groups: project.groups.toString(),
      dueDate: project.dueDate,
      description: project.description,
      status: project.status,
      objectives: project.objectives || '',
      deliverables: project.deliverables || '',
      evaluationCriteria: project.evaluationCriteria || ''
    });
    setIsEditProjectOpen(true);
  };

  const handleSaveEditProject = async () => {
    if (!editProject.title.trim() || !editProject.course.trim() || !editProject.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const updateData = {
        title: editProject.title.trim(),
        course: editProject.course.trim(),
        groups: parseInt(editProject.groups),
        dueDate: editProject.dueDate,
        status: editProject.status,
        description: editProject.description.trim(),
        objectives: editProject.objectives.trim(),
        deliverables: editProject.deliverables.trim(),
        evaluationCriteria: editProject.evaluationCriteria.trim()
      };

      const response = await api.updateProject(selectedProject.id, updateData);
      
      if (response.success) {
        const updatedProjects = projects.map(p => 
          p.id === selectedProject.id ? { ...p, ...updateData } : p
        );

        onUpdateProjects(updatedProjects);
        setIsEditProjectOpen(false);
        setSelectedProject(null);
        toast.success('Project updated successfully!');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project. Please try again.');
    }
  };

  const handleMonitorProject = (project: any) => {
    setSelectedProject(project);
    setIsMonitorProjectOpen(true);
  };

  const handleOpenDeleteDialog = (project: any) => {
    setProjectToDelete(project);
    setIsDeleteProjectOpen(true);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      const response = await api.deleteProject(projectToDelete.id);
      
      if (response.success) {
        const updatedProjects = projects.filter(p => p.id !== projectToDelete.id);
        onUpdateProjects(updatedProjects);
        setIsDeleteProjectOpen(false);
        setProjectToDelete(null);
        toast.success('Project deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project. Please try again.');
    }
  };

  const handleViewSubmission = (submission: any) => {
    setSelectedSubmission(submission);
    setIsViewSubmissionOpen(true);
  };

  const handleOpenGradeDialog = (submission: any) => {
    setSelectedSubmission(submission);
    setGradeData({
      grade: submission.grade || '',
      feedback: submission.feedback || ''
    });
    setIsGradeDialogOpen(true);
  };

  const handleSaveGrade = async () => {
    if (!gradeData.grade.trim()) {
      toast.error('Please enter a grade');
      return;
    }

    try {
      const updateData = {
        grade: gradeData.grade.trim(),
        feedback: gradeData.feedback.trim(),
        status: 'Graded'
      };

      const response = await api.updateSubmission(selectedSubmission.id, updateData);
      
      if (response.success) {
        const updatedSubmissions = submissions.map(s =>
          s.id === selectedSubmission.id ? { ...s, ...updateData } : s
        );

        onUpdateSubmissions(updatedSubmissions);
        setIsGradeDialogOpen(false);
        setIsViewSubmissionOpen(false);
        setGradeData({ grade: '', feedback: '' });
        toast.success('Grade assigned successfully!');
      }
    } catch (error) {
      console.error('Error saving grade:', error);
      toast.error('Failed to save grade. Please try again.');
    }
  };

  const handleAcceptSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      const updateData = {
        status: 'Accepted',
        reviewedDate: new Date().toISOString().split('T')[0]
      };

      const response = await api.updateSubmission(selectedSubmission.id, updateData);
      
      if (response.success) {
        const updatedSubmissions = submissions.map(s =>
          s.id === selectedSubmission.id ? { ...s, ...updateData } : s
        );

        onUpdateSubmissions(updatedSubmissions);
        setIsViewSubmissionOpen(false);
        toast.success('Submission accepted successfully!');
      }
    } catch (error) {
      console.error('Error accepting submission:', error);
      toast.error('Failed to accept submission. Please try again.');
    }
  };

  const handleRejectSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      const updateData = {
        status: 'Rejected',
        reviewedDate: new Date().toISOString().split('T')[0]
      };

      const response = await api.updateSubmission(selectedSubmission.id, updateData);
      
      if (response.success) {
        const updatedSubmissions = submissions.map(s =>
          s.id === selectedSubmission.id ? { ...s, ...updateData } : s
        );

        onUpdateSubmissions(updatedSubmissions);
        setIsViewSubmissionOpen(false);
        toast.success('Submission rejected.');
      }
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast.error('Failed to reject submission. Please try again.');
    }
  };

  const getProjectSubmissions = (projectId: number) => {
    return submissions.filter(s => s.projectId === projectId);
  };

  const getProjectTasks = (projectId: number) => {
    return tasks.filter(t => t.projectId === projectId);
  };

  const handleCreateStudent = () => {
    // Validation
    if (!newStudent.email.trim()) {
      toast.error('Please enter student email');
      return;
    }
    if (!newStudent.password.trim()) {
      toast.error('Please enter password');
      return;
    }
    if (newStudent.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!newStudent.name.trim()) {
      toast.error('Please enter student name');
      return;
    }
    if (!newStudent.studentId.trim()) {
      toast.error('Please enter student ID');
      return;
    }
    if (!newStudent.phone.trim()) {
      toast.error('Please enter phone number');
      return;
    }
    
    // Validate phone number (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(newStudent.phone)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }
    
    if (!newStudent.academicYear) {
      toast.error('Please select academic year');
      return;
    }
    if (!newStudent.branch.trim()) {
      toast.error('Please enter branch');
      return;
    }
    if (!newStudent.groupNumber.trim()) {
      toast.error('Please enter group number');
      return;
    }

    // Check if email already exists
    const emailExists = allAccounts.some(
      account => account.email.toLowerCase() === newStudent.email.toLowerCase()
    );

    if (emailExists) {
      toast.error('An account with this email already exists');
      return;
    }

    // Create the student account
    onCreateStudentAccount({
      email: newStudent.email.trim(),
      password: newStudent.password.trim(),
      name: newStudent.name.trim(),
      studentId: newStudent.studentId.trim(),
      phone: newStudent.phone.trim(),
      academicYear: newStudent.academicYear,
      branch: newStudent.branch.trim(),
      groupNumber: newStudent.groupNumber.trim()
    });

    // Reset form
    setNewStudent({
      email: '',
      password: '',
      name: '',
      studentId: '',
      phone: '',
      academicYear: '',
      branch: '',
      groupNumber: ''
    });

    setIsCreateStudentOpen(false);
    toast.success('Student account created successfully!');
  };

  const studentAccounts = allAccounts.filter(acc => acc.userType === 'student');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1>Admin Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.fullName || user.name}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onShowProfile}>
                View Profile
              </Button>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-muted-foreground truncate">Active Projects</dt>
                    <dd>{projects.length}</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-muted-foreground truncate">Total Groups</dt>
                    <dd>{projects.reduce((sum, p) => sum + p.groups, 0)}</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-muted-foreground truncate">Pending Reviews</dt>
                    <dd>{submissions.filter(s => s.status === 'Pending Review').length}</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-muted-foreground truncate">Total Tasks</dt>
                    <dd>{tasks.length}</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="students">
              <Users className="h-4 w-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageCircle className="h-4 w-4 mr-2" />
              Group Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Project Management</CardTitle>
                    <CardDescription>
                      Create and manage group projects for your courses
                    </CardDescription>
                  </div>
                  <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                        <DialogDescription>
                          Fill in the details to create a new group project with milestones and evaluation criteria.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        {/* Project Title */}
                        <div className="space-y-2">
                          <Label htmlFor="project-title">
                            Project Title <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="project-title"
                            placeholder="e.g., E-commerce Website Development"
                            value={newProject.title}
                            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                          />
                        </div>

                        {/* Course Code and Number of Groups */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="course-code">
                              Course Code <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="course-code"
                              placeholder="24SC..."
                              value={newProject.course}
                              onChange={(e) => setNewProject({ ...newProject, course: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="num-groups">
                              Number of Groups <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="num-groups"
                              type="number"
                              min="1"
                              placeholder="e.g., 4"
                              value={newProject.groups}
                              onChange={(e) => setNewProject({ ...newProject, groups: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Due Date and Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="due-date">
                              Due Date <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="due-date"
                              type="date"
                              value={newProject.dueDate}
                              onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="status">Project Status</Label>
                            <Select
                              value={newProject.status}
                              onValueChange={(value) => setNewProject({ ...newProject, status: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Not Started">Not Started</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Review">Review</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Project Description */}
                        <div className="space-y-2">
                          <Label htmlFor="description">
                            Project Description <span className="text-destructive">*</span>
                          </Label>
                          <Textarea
                            id="description"
                            placeholder="Provide detailed description of the project requirements..."
                            rows={3}
                            value={newProject.description}
                            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                          />
                        </div>

                        {/* Objectives */}
                        <div className="space-y-2">
                          <Label htmlFor="objectives">Project Objectives</Label>
                          <Textarea
                            id="objectives"
                            placeholder="List the learning objectives and goals for this project..."
                            rows={3}
                            value={newProject.objectives}
                            onChange={(e) => setNewProject({ ...newProject, objectives: e.target.value })}
                          />
                        </div>

                        {/* Deliverables */}
                        <div className="space-y-2">
                          <Label htmlFor="deliverables">Expected Deliverables</Label>
                          <Textarea
                            id="deliverables"
                            placeholder="What should students submit? (e.g., source code, documentation, presentation...)"
                            rows={3}
                            value={newProject.deliverables}
                            onChange={(e) => setNewProject({ ...newProject, deliverables: e.target.value })}
                          />
                        </div>

                        {/* Evaluation Criteria */}
                        <div className="space-y-2">
                          <Label htmlFor="evaluation">Evaluation Criteria / Rubric</Label>
                          <Textarea
                            id="evaluation"
                            placeholder="How will this project be graded? (e.g., Code quality: 40%, Documentation: 30%, Presentation: 30%...)"
                            rows={3}
                            value={newProject.evaluationCriteria}
                            onChange={(e) => setNewProject({ ...newProject, evaluationCriteria: e.target.value })}
                          />
                        </div>

                        {/* Milestones */}
                        <div className="space-y-3">
                          <Label>Project Milestones</Label>
                          <div className="border rounded-lg p-4 space-y-3">
                            {milestones.map((milestone, index) => (
                              <div key={milestone.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                                <Input
                                  placeholder="Milestone name"
                                  value={milestone.name}
                                  onChange={(e) => {
                                    const updated = [...milestones];
                                    updated[index].name = e.target.value;
                                    setMilestones(updated);
                                  }}
                                  className="flex-1"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateProjectOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateProject}>
                          Create Project
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                      <h3 className="mb-2">No Projects Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first project to get started with managing student group work.
                      </p>
                      <Button onClick={() => setIsCreateProjectOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Project
                      </Button>
                    </div>
                  ) : (
                    projects.map((project) => (
                      <div key={project.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="mb-1">{project.title}</h3>
                            <div className="flex gap-2 mb-2">
                              <Badge variant="secondary">{project.course}</Badge>
                              <Badge variant="outline">{project.groups} Groups</Badge>
                              <Badge variant={project.status === 'In Progress' ? 'default' : 'secondary'}>
                                {project.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{project.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleMonitorProject(project)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Monitor
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEditProject(project)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleOpenDeleteDialog(project)}
                              className="border-red-600 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>

                        {/* Milestones */}
                        {project.milestones && project.milestones.length > 0 && (
                          <div className="mb-3 flex gap-2">
                            {project.milestones.map((milestone: any) => (
                              <Badge key={milestone.id} variant={milestone.completed ? 'default' : 'outline'}>
                                <Target className="h-3 w-3 mr-1" />
                                {milestone.name}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>Due: {project.dueDate}</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                          <p className="text-sm text-muted-foreground">{project.progress}% complete</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>Project Submissions</CardTitle>
                <CardDescription>
                  Review and grade student group submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submissions.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                    <h3 className="mb-2">No Submissions Yet</h3>
                    <p className="text-muted-foreground">
                      Student submissions will appear here once projects are assigned and students submit their work.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell>
                            <div>
                              <div>{submission.projectTitle}</div>
                              <div className="text-xs text-muted-foreground">{submission.course}</div>
                            </div>
                          </TableCell>
                          <TableCell>{submission.studentName}</TableCell>
                          <TableCell>{submission.studentId}</TableCell>
                          <TableCell>{submission.submittedDate}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                submission.status === 'Accepted' ? 'default' :
                                submission.status === 'Rejected' ? 'destructive' :
                                submission.status === 'Graded' ? 'default' : 'secondary'
                              }
                              className={
                                submission.status === 'Accepted' ? 'bg-green-600 hover:bg-green-700' : ''
                              }
                            >
                              {submission.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{submission.grade || 'Not graded'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleViewSubmission(submission)}>
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => handleOpenGradeDialog(submission)}
                                variant={submission.status === 'Graded' ? 'secondary' : 'default'}
                              >
                                {submission.status === 'Graded' ? 'Update Grade' : 'Grade'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Student Accounts</CardTitle>
                    <CardDescription>
                      Manage student accounts and access
                    </CardDescription>
                  </div>
                  <Dialog open={isCreateStudentOpen} onOpenChange={setIsCreateStudentOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Student Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create Student Account</DialogTitle>
                        <DialogDescription>
                          Create a new student account with login credentials and profile information.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="student-email">
                              Email <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="student-email"
                              type="email"
                              placeholder="student@university.edu"
                              value={newStudent.email}
                              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="student-password">
                              Password <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="student-password"
                              type="password"
                              placeholder="At least 6 characters"
                              value={newStudent.password}
                              onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="student-name">
                              Full Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="student-name"
                              placeholder="John Doe"
                              value={newStudent.name}
                              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="student-id">
                              Student ID <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="student-id"
                              placeholder="2400001234"
                              value={newStudent.studentId}
                              onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="student-phone">
                            Phone Number <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="student-phone"
                            type="tel"
                            placeholder="9876543210 (10 digits)"
                            maxLength={10}
                            value={newStudent.phone}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              setNewStudent({ ...newStudent, phone: value });
                            }}
                          />
                          <p className="text-xs text-muted-foreground">
                            For WhatsApp, Telegram, or Signal contact
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="student-year">
                              Academic Year <span className="text-destructive">*</span>
                            </Label>
                            <Select
                              value={newStudent.academicYear}
                              onValueChange={(value) => setNewStudent({ ...newStudent, academicYear: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select year" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Year 1</SelectItem>
                                <SelectItem value="2">Year 2</SelectItem>
                                <SelectItem value="3">Year 3</SelectItem>
                                <SelectItem value="4">Year 4</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="student-branch">
                              Branch <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="student-branch"
                              placeholder="e.g., CSE, ECE, ME"
                              value={newStudent.branch}
                              onChange={(e) => setNewStudent({ ...newStudent, branch: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="student-group">
                              Group Number <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="student-group"
                              type="number"
                              placeholder="1"
                              value={newStudent.groupNumber}
                              onChange={(e) => setNewStudent({ ...newStudent, groupNumber: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => {
                          setIsCreateStudentOpen(false);
                          setNewStudent({
                            email: '',
                            password: '',
                            name: '',
                            studentId: '',
                            phone: '',
                            academicYear: '',
                            branch: '',
                            groupNumber: ''
                          });
                        }}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateStudent}>
                          Create Account
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {studentAccounts.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                    <h3 className="mb-2">No Student Accounts Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create student accounts to allow them to access the platform and participate in projects.
                    </p>
                    <Button onClick={() => setIsCreateStudentOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Student Account
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Group</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentAccounts.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.studentId}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.phone}</TableCell>
                          <TableCell>Year {student.academicYear}</TableCell>
                          <TableCell>{student.branch}</TableCell>
                          <TableCell>{student.groupNumber}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            {projects.length === 0 ? (
              <Card>
                <CardContent className="p-12">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                    <h3 className="mb-2">No Group Chats Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create a project first to enable group chat functionality. Group chats are automatically created for each project.
                    </p>
                    <Button onClick={() => setIsCreateProjectOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Project
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <GroupChat 
                currentUser={user.fullName || user.name}
                projects={projects}
                onUpdateMembers={handleUpdateMembers}
                userType="admin"
                messages={messages}
                onUpdateMessages={onUpdateMessages}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Project Dialog */}
      <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the project details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-project-title">
                Project Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-project-title"
                value={editProject.title}
                onChange={(e) => setEditProject({ ...editProject, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-course-code">
                  Course Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-course-code"
                  placeholder="24SC..."
                  value={editProject.course}
                  onChange={(e) => setEditProject({ ...editProject, course: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-num-groups">
                  Number of Groups <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-num-groups"
                  type="number"
                  min="1"
                  value={editProject.groups}
                  onChange={(e) => setEditProject({ ...editProject, groups: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-due-date">
                  Due Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-due-date"
                  type="date"
                  value={editProject.dueDate}
                  onChange={(e) => setEditProject({ ...editProject, dueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Project Status</Label>
                <Select
                  value={editProject.status}
                  onValueChange={(value) => setEditProject({ ...editProject, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Review">Review</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">
                Project Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="edit-description"
                rows={3}
                value={editProject.description}
                onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-objectives">Project Objectives</Label>
              <Textarea
                id="edit-objectives"
                rows={2}
                value={editProject.objectives}
                onChange={(e) => setEditProject({ ...editProject, objectives: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-deliverables">Expected Deliverables</Label>
              <Textarea
                id="edit-deliverables"
                rows={2}
                value={editProject.deliverables}
                onChange={(e) => setEditProject({ ...editProject, deliverables: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-evaluation">Evaluation Criteria</Label>
              <Textarea
                id="edit-evaluation"
                rows={2}
                value={editProject.evaluationCriteria}
                onChange={(e) => setEditProject({ ...editProject, evaluationCriteria: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProjectOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditProject}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Monitor Project Dialog */}
      <Dialog open={isMonitorProjectOpen} onOpenChange={setIsMonitorProjectOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Monitoring</DialogTitle>
            <DialogDescription>
              Detailed overview of project progress, milestones, tasks, and submissions
            </DialogDescription>
          </DialogHeader>
          
          {selectedProject && (
            <div className="space-y-6 py-4">
              {/* Project Overview */}
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="mb-3">{selectedProject.title}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Course Code</Label>
                    <p className="mt-1">{selectedProject.course}</p>
                  </div>
                  <div>
                    <Label>Number of Groups</Label>
                    <p className="mt-1">{selectedProject.groups}</p>
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <p className="mt-1">{selectedProject.dueDate}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">
                      <Badge variant={selectedProject.status === 'In Progress' ? 'default' : 'secondary'}>
                        {selectedProject.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              {selectedProject.objectives && (
                <div className="space-y-2">
                  <Label>Project Objectives</Label>
                  <p className="text-sm p-3 bg-muted rounded-lg">
                    {selectedProject.objectives}
                  </p>
                </div>
              )}

              {selectedProject.deliverables && (
                <div className="space-y-2">
                  <Label>Expected Deliverables</Label>
                  <p className="text-sm p-3 bg-muted rounded-lg">
                    {selectedProject.deliverables}
                  </p>
                </div>
              )}

              {selectedProject.evaluationCriteria && (
                <div className="space-y-2">
                  <Label>Evaluation Criteria</Label>
                  <p className="text-sm p-3 bg-muted rounded-lg">
                    {selectedProject.evaluationCriteria}
                  </p>
                </div>
              )}

              {/* Milestones */}
              {selectedProject.milestones && selectedProject.milestones.length > 0 && (
                <div className="space-y-3">
                  <Label>Project Milestones</Label>
                  <div className="space-y-2">
                    {selectedProject.milestones.map((milestone: any) => (
                      <div key={milestone.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <Checkbox checked={milestone.completed} />
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span className={milestone.completed ? 'line-through text-muted-foreground' : ''}>
                          {milestone.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Overview */}
              <div className="space-y-3">
                <Label>Overall Progress</Label>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion</span>
                    <span>{selectedProject.progress}%</span>
                  </div>
                  <Progress value={selectedProject.progress} className="h-2" />
                </div>
              </div>

              {/* Student Tasks */}
              <div className="space-y-3">
                <Label>Student Tasks ({getProjectTasks(selectedProject.id).length})</Label>
                {getProjectTasks(selectedProject.id).length > 0 ? (
                  <div className="space-y-2">
                    {getProjectTasks(selectedProject.id).map((task: any) => (
                      <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Checkbox checked={task.status === 'Completed'} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={task.status === 'Completed' ? 'line-through text-muted-foreground text-sm' : 'text-sm'}>
                              {task.title}
                            </span>
                            <Badge variant="outline" className="text-xs">{task.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">Assigned to: {task.assignee}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                    No tasks created yet
                  </p>
                )}
              </div>

              {/* Submissions */}
              <div className="space-y-3">
                <Label>Submissions</Label>
                {getProjectSubmissions(selectedProject.id).length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getProjectSubmissions(selectedProject.id).map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell>
                              <div>
                                <div className="text-sm">{submission.studentName}</div>
                                <div className="text-xs text-muted-foreground">{submission.studentId}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{submission.submittedDate}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  submission.status === 'Accepted' ? 'default' :
                                  submission.status === 'Rejected' ? 'destructive' :
                                  submission.status === 'Graded' ? 'default' : 'secondary'
                                }
                                className={
                                  submission.status === 'Accepted' ? 'bg-green-600 hover:bg-green-700' : ''
                                }
                              >
                                {submission.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{submission.grade || 'Not graded'}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {submission.status !== 'Accepted' && submission.status !== 'Rejected' && (
                                  <>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="border-green-600 text-green-600 hover:bg-green-50"
                                      onClick={async () => {
                                        try {
                                          const updateData = {
                                            status: 'Accepted',
                                            reviewedDate: new Date().toISOString().split('T')[0]
                                          };
                                          const response = await api.updateSubmission(submission.id, updateData);
                                          if (response.success) {
                                            const updatedSubmissions = submissions.map(s =>
                                              s.id === submission.id ? { ...s, ...updateData } : s
                                            );
                                            onUpdateSubmissions(updatedSubmissions);
                                            toast.success('Submission accepted!');
                                          }
                                        } catch (error) {
                                          toast.error('Failed to accept submission');
                                        }
                                      }}
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="border-red-600 text-red-600 hover:bg-red-50"
                                      onClick={async () => {
                                        try {
                                          const updateData = {
                                            status: 'Rejected',
                                            reviewedDate: new Date().toISOString().split('T')[0]
                                          };
                                          const response = await api.updateSubmission(submission.id, updateData);
                                          if (response.success) {
                                            const updatedSubmissions = submissions.map(s =>
                                              s.id === submission.id ? { ...s, ...updateData } : s
                                            );
                                            onUpdateSubmissions(updatedSubmissions);
                                            toast.success('Submission rejected');
                                          }
                                        } catch (error) {
                                          toast.error('Failed to reject submission');
                                        }
                                      }}
                                    >
                                      <AlertCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => {
                                    setIsMonitorProjectOpen(false);
                                    handleViewSubmission(submission);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Review
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted rounded-lg">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No submissions yet for this project
                    </p>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Days Until Due</p>
                        <p>
                          {Math.ceil((new Date(selectedProject.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Submissions</p>
                        <p>{getProjectSubmissions(selectedProject.id).length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tasks Created</p>
                        <p>{getProjectTasks(selectedProject.id).length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMonitorProjectOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsMonitorProjectOpen(false);
              handleEditProject(selectedProject);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Submission Dialog */}
      <Dialog open={isViewSubmissionOpen} onOpenChange={setIsViewSubmissionOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Review Project Submission</DialogTitle>
            <DialogDescription>
              Review the student's submitted work and provide feedback.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label>Project</Label>
                  <p className="mt-1">{selectedSubmission.projectTitle}</p>
                  <p className="text-sm text-muted-foreground">{selectedSubmission.course}</p>
                </div>
                <div>
                  <Label>Student</Label>
                  <p className="mt-1">{selectedSubmission.studentName}</p>
                  <p className="text-sm text-muted-foreground">ID: {selectedSubmission.studentId}</p>
                </div>
                <div>
                  <Label>Submitted Date</Label>
                  <p className="mt-1">{selectedSubmission.submittedDate}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <Badge 
                      variant={
                        selectedSubmission.status === 'Accepted' ? 'default' :
                        selectedSubmission.status === 'Rejected' ? 'destructive' :
                        selectedSubmission.status === 'Graded' ? 'default' : 'secondary'
                      }
                      className={
                        selectedSubmission.status === 'Accepted' ? 'bg-green-600 hover:bg-green-700' : ''
                      }
                    >
                      {selectedSubmission.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Status Alert for Admin */}
              {selectedSubmission.status === 'Accepted' && (
                <div className="p-4 bg-green-50 border border-green-600 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-900">This submission has been accepted.</p>
                  </div>
                </div>
              )}
              {selectedSubmission.status === 'Rejected' && (
                <div className="p-4 bg-red-50 border border-red-600 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-sm text-red-900">This submission has been rejected.</p>
                  </div>
                </div>
              )}

              {selectedSubmission.pdfFile && (
                <div className="space-y-2">
                  <Label>Submitted PDF Document</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <iframe
                      src={selectedSubmission.pdfFile}
                      className="w-full h-[500px]"
                      title="Submitted PDF"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = selectedSubmission.pdfFile;
                        link.download = selectedSubmission.pdfFileName || 'submission.pdf';
                        link.click();
                      }}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Download PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedSubmission.pdfFile, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open in New Tab
                    </Button>
                  </div>
                </div>
              )}

              {selectedSubmission.projectLink && (
                <div className="space-y-2">
                  <Label>Project Link/File URL</Label>
                  <div className="flex items-center gap-2">
                    <Input value={selectedSubmission.projectLink} readOnly />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedSubmission.projectLink, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Project Description</Label>
                <Textarea
                  value={selectedSubmission.description}
                  readOnly
                  rows={4}
                  className="bg-muted"
                />
              </div>

              {selectedSubmission.notes && (
                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={selectedSubmission.notes}
                    readOnly
                    rows={3}
                    className="bg-muted"
                  />
                </div>
              )}

              {selectedSubmission.grade && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div>
                    <Label>Grade</Label>
                    <p className="mt-1">{selectedSubmission.grade}</p>
                  </div>
                  {selectedSubmission.feedback && (
                    <div>
                      <Label>Feedback</Label>
                      <p className="mt-1 text-sm">{selectedSubmission.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-between items-center">
            <div className="flex gap-2">
              {selectedSubmission?.status !== 'Accepted' && selectedSubmission?.status !== 'Rejected' && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleRejectSubmission}
                    className="border-red-600 text-red-600 hover:bg-red-50"
                  >
                    Reject
                  </Button>
                  <Button 
                    onClick={handleAcceptSubmission}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Accept
                  </Button>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsViewSubmissionOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setIsViewSubmissionOpen(false);
                handleOpenGradeDialog(selectedSubmission);
              }}>
                {selectedSubmission?.status === 'Graded' ? 'Update Grade' : 'Assign Grade'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grade Assignment Dialog */}
      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Grade & Feedback</DialogTitle>
            <DialogDescription>
              Provide a grade and feedback for this submission.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <span className="text-muted-foreground">Student:</span> {selectedSubmission.studentName}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Project:</span> {selectedSubmission.projectTitle}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">
                  Grade <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="grade"
                  placeholder="e.g., A, 95/100, Pass, etc."
                  value={gradeData.grade}
                  onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback (Optional)</Label>
                <Textarea
                  id="feedback"
                  placeholder="Provide constructive feedback on the submission..."
                  rows={5}
                  value={gradeData.feedback}
                  onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveGrade}>
              {selectedSubmission?.status === 'Graded' ? 'Update Grade' : 'Assign Grade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Confirmation Dialog */}
      <Dialog open={isDeleteProjectOpen} onOpenChange={setIsDeleteProjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {projectToDelete && (
            <div className="py-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">Project:</span> <span>{projectToDelete.title}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Course:</span> <span>{projectToDelete.course}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Groups:</span> <span>{projectToDelete.groups}</span>
                </p>
              </div>
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-900">
                  ⚠️ Warning: Deleting this project will also remove all associated tasks, submissions, and chat messages.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteProjectOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProject}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
