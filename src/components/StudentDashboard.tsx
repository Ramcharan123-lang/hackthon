import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, Users, CheckCircle, Clock, FileText, Upload, MessageCircle, LogOut, Plus, Target, AlertCircle, ExternalLink, Trash2 } from 'lucide-react';
import { GroupChat } from './GroupChat';
import { toast } from 'sonner@2.0.3';
import * as api from '../utils/api';

interface StudentDashboardProps {
  user: any;
  onShowProfile: () => void;
  onLogout: () => void;
  projects: any[];
  onUpdateProjects: (projects: any[]) => void;
  onUpdateSubmissions: (submissions: any[]) => void;
  submissions: any[];
  tasks: any[];
  onUpdateTasks: (tasks: any[]) => void;
  messages: any[];
  onUpdateMessages: (messages: any[]) => void;
}

export function StudentDashboard({ user, onShowProfile, onLogout, projects, onUpdateProjects, onUpdateSubmissions, submissions, tasks, onUpdateTasks, messages, onUpdateMessages }: StudentDashboardProps) {
  const handleUpdateMembers = (projectId: number, members: string[]) => {
    // Update project members - students can now add members to their groups
    const updatedProjects = projects.map(p => 
      p.id === projectId 
        ? { ...p, groupMembers: members }
        : p
    );
    onUpdateProjects(updatedProjects);
  };

  // Submit work state
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [selectedProjectForSubmission, setSelectedProjectForSubmission] = useState<any>(null);
  const [submissionData, setSubmissionData] = useState({
    projectLink: '',
    description: '',
    notes: '',
    pdfFile: null as string | null,
    pdfFileName: ''
  });

  // Task management state
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedProjectForTask, setSelectedProjectForTask] = useState<any>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'Medium',
    dueDate: '',
    status: 'Todo'
  });

  // View project details state
  const [isProjectDetailsOpen, setIsProjectDetailsOpen] = useState(false);
  const [selectedProjectDetails, setSelectedProjectDetails] = useState<any>(null);

  // View submission state
  const [isViewSubmissionOpen, setIsViewSubmissionOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  // Delete submission state
  const [isDeleteSubmissionOpen, setIsDeleteSubmissionOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<any>(null);

  const handleOpenSubmitDialog = (project: any) => {
    setSelectedProjectForSubmission(project);
    setIsSubmitDialogOpen(true);
  };

  const handleViewSubmission = (projectId: number) => {
    const submission = getMySubmission(projectId);
    if (submission) {
      setSelectedSubmission(submission);
      setIsViewSubmissionOpen(true);
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload only PDF files');
        e.target.value = '';
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const pdfData = event.target?.result as string;
        setSubmissionData({
          ...submissionData,
          pdfFile: pdfData,
          pdfFileName: file.name
        });
        toast.success('PDF uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitWork = async () => {
    if (!submissionData.pdfFile) {
      toast.error('Please upload a PDF file');
      return;
    }
    if (!submissionData.description.trim()) {
      toast.error('Please provide a description of your work');
      return;
    }

    try {
      const submissionPayload = {
        projectId: selectedProjectForSubmission.id,
        projectTitle: selectedProjectForSubmission.title,
        course: selectedProjectForSubmission.course,
        studentName: user.fullName || user.name,
        studentId: user.studentId,
        submittedDate: new Date().toISOString().split('T')[0],
        projectLink: submissionData.projectLink.trim(),
        description: submissionData.description.trim(),
        notes: submissionData.notes.trim(),
        pdfFile: submissionData.pdfFile,
        pdfFileName: submissionData.pdfFileName,
        status: 'Pending Review',
        grade: null
      };

      const response = await api.createSubmission(submissionPayload);
      
      if (response.success) {
        onUpdateSubmissions([...submissions, response.submission]);

        setSubmissionData({
          projectLink: '',
          description: '',
          notes: '',
          pdfFile: null,
          pdfFileName: ''
        });
        setIsSubmitDialogOpen(false);
        setSelectedProjectForSubmission(null);

        toast.success('Project submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting work:', error);
      toast.error('Failed to submit project. Please try again.');
    }
  };

  const handleOpenDeleteSubmission = (submission: any) => {
    setSubmissionToDelete(submission);
    setIsDeleteSubmissionOpen(true);
  };

  const handleDeleteSubmission = async () => {
    if (!submissionToDelete) return;

    try {
      const response = await api.deleteSubmission(submissionToDelete.id);
      
      if (response.success) {
        const updatedSubmissions = submissions.filter(s => s.id !== submissionToDelete.id);
        onUpdateSubmissions(updatedSubmissions);
        setIsDeleteSubmissionOpen(false);
        setSubmissionToDelete(null);
        setIsViewSubmissionOpen(false);
        toast.success('Submission deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast.error('Failed to delete submission. Please try again.');
    }
  };

  const handleOpenCreateTask = (project: any) => {
    setSelectedProjectForTask(project);
    setNewTask({
      ...newTask,
      assignee: user.fullName || user.name // Default to current user
    });
    setIsCreateTaskOpen(true);
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    if (!newTask.assignee.trim()) {
      toast.error('Please assign the task to a team member');
      return;
    }
    if (!newTask.dueDate) {
      toast.error('Please select a due date');
      return;
    }

    try {
      const taskData = {
        projectId: selectedProjectForTask.id,
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        assignee: newTask.assignee.trim(),
        priority: newTask.priority,
        dueDate: newTask.dueDate,
        status: newTask.status,
        createdBy: user.fullName || user.name
      };

      const response = await api.createTask(taskData);
      
      if (response.success) {
        onUpdateTasks([...tasks, response.task]);

        setNewTask({
          title: '',
          description: '',
          assignee: '',
          priority: 'Medium',
          dueDate: '',
          status: 'Todo'
        });
        setIsCreateTaskOpen(false);
        setSelectedProjectForTask(null);

        toast.success('Task created successfully!');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task. Please try again.');
    }
  };

  const handleUpdateTaskStatus = (taskId: number, newStatus: string) => {
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    onUpdateTasks(updatedTasks);
    toast.success('Task status updated!');
  };

  const handleViewProjectDetails = (project: any) => {
    setSelectedProjectDetails(project);
    setIsProjectDetailsOpen(true);
  };

  const hasProjects = projects && projects.length > 0;
  
  const isProjectSubmitted = (projectId: number) => {
    return submissions.some(s => s.projectId === projectId && s.studentId === user.studentId);
  };

  const getMyTasks = () => {
    return tasks.filter(task => task.assignee === (user.fullName || user.name));
  };

  const getProjectTasks = (projectId: number) => {
    return tasks.filter(t => t.projectId === projectId);
  };

  const getMySubmission = (projectId: number) => {
    return submissions.find(s => s.projectId === projectId && s.studentId === user.studentId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'In Progress':
        return 'secondary';
      case 'Todo':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const myTasks = getMyTasks();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1>Student Dashboard</h1>
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
                    <dd>{hasProjects ? projects.length : 0}</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-muted-foreground truncate">Completed Tasks</dt>
                    <dd>{myTasks.filter(t => t.status === 'Completed').length}</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-muted-foreground truncate">Pending Tasks</dt>
                    <dd>{myTasks.filter(t => t.status !== 'Completed').length}</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-muted-foreground truncate">Team Members</dt>
                    <dd>{hasProjects ? new Set(projects.flatMap(p => p.groupMembers)).size : 0}</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList>
            <TabsTrigger value="projects">My Projects</TabsTrigger>
            <TabsTrigger value="tasks">My Tasks</TabsTrigger>
            <TabsTrigger value="chat">
              <MessageCircle className="h-4 w-4 mr-2" />
              Group Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Group Projects</CardTitle>
                <CardDescription>
                  Coordinate with your team and track project progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!hasProjects ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                    <h3 className="mb-2">No Projects Assigned</h3>
                    <p className="text-muted-foreground">
                      Your admin hasn't assigned any group projects yet. Check back later.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {projects.map((project) => {
                      const mySubmission = getMySubmission(project.id);
                      
                      return (
                        <div key={project.id} className="border rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="mb-2">{project.title}</h3>
                              <div className="flex gap-2 mb-3">
                                <Badge variant="secondary">{project.course}</Badge>
                                <Badge variant="outline">{project.myRole}</Badge>
                                <Badge variant={project.status === 'In Progress' ? 'default' : 'secondary'}>
                                  {project.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleViewProjectDetails(project)}>
                                View Details
                              </Button>
                              <Button size="sm" onClick={() => handleOpenCreateTask(project)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Task
                              </Button>
                              {isProjectSubmitted(project.id) ? (
                                <Button size="sm" variant="secondary" onClick={() => handleViewSubmission(project.id)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  View Submission
                                </Button>
                              ) : (
                                <Button size="sm" onClick={() => handleOpenSubmitDialog(project)}>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Submit Work
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Submission Status */}
                          {mySubmission && mySubmission.status === 'Accepted' && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-600 rounded-lg">
                              <div className="flex items-start gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                <div>
                                  <p className="text-sm">
                                    <span className="text-green-900">✓ Submission Accepted</span>
                                  </p>
                                  {mySubmission.grade && (
                                    <p className="text-sm text-green-700 mt-1">
                                      Grade: {mySubmission.grade}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          {mySubmission && mySubmission.status === 'Rejected' && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-600 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                <div>
                                  <p className="text-sm">
                                    <span className="text-red-900">✗ Submission Rejected</span>
                                  </p>
                                  {mySubmission.feedback && (
                                    <p className="text-sm text-red-700 mt-1">
                                      {mySubmission.feedback}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          {mySubmission && mySubmission.status === 'Graded' && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                <div>
                                  <p className="text-sm">
                                    <span className="text-green-900">Grade: {mySubmission.grade}</span>
                                  </p>
                                  {mySubmission.feedback && (
                                    <p className="text-sm text-green-700 mt-1">
                                      Feedback: {mySubmission.feedback}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Milestones */}
                          {project.milestones && project.milestones.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm mb-2">Project Milestones</h4>
                              <div className="flex flex-wrap gap-2">
                                {project.milestones.map((milestone: any) => (
                                  <Badge key={milestone.id} variant={milestone.completed ? 'default' : 'outline'}>
                                    <Target className="h-3 w-3 mr-1" />
                                    {milestone.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Team Members */}
                          <div className="mb-4">
                            <h4 className="mb-2">Team Members</h4>
                            <div className="flex gap-2">
                              {project.groupMembers.map((member: string, index: number) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                      {member.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{member}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Tasks for this project */}
                          {getProjectTasks(project.id).length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm mb-2">
                                Project Tasks ({getProjectTasks(project.id).filter(t => t.status === 'Completed').length}/{getProjectTasks(project.id).length} completed)
                              </h4>
                              <div className="space-y-2">
                                {getProjectTasks(project.id).slice(0, 3).map((task: any) => (
                                  <div key={task.id} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                                    <Checkbox 
                                      checked={task.status === 'Completed'}
                                      onCheckedChange={(checked) => {
                                        if (task.assignee === (user.fullName || user.name)) {
                                          handleUpdateTaskStatus(task.id, checked ? 'Completed' : 'Todo');
                                        }
                                      }}
                                      disabled={task.assignee !== (user.fullName || user.name)}
                                    />
                                    <span className={task.status === 'Completed' ? 'line-through text-muted-foreground' : ''}>
                                      {task.title}
                                    </span>
                                    <Badge variant="outline" className="text-xs ml-auto">
                                      {task.assignee}
                                    </Badge>
                                  </div>
                                ))}
                                {getProjectTasks(project.id).length > 3 && (
                                  <p className="text-xs text-muted-foreground text-center">
                                    +{getProjectTasks(project.id).length - 3} more tasks
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Progress */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Overall Progress</span>
                              <span>Due: {project.dueDate}</span>
                            </div>
                            <Progress value={project.progress} className="h-2" />
                            <p className="text-sm text-muted-foreground">{project.progress}% complete</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>My Tasks</CardTitle>
                <CardDescription>
                  Track your individual tasks and milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                {myTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                    <h3 className="mb-2">No Tasks Assigned</h3>
                    <p className="text-muted-foreground mb-4">
                      Create tasks for your projects to get started.
                    </p>
                    {hasProjects && (
                      <Button onClick={() => handleOpenCreateTask(projects[0])}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Task
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myTasks.map((task) => (
                      <div key={task.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <Checkbox 
                          checked={task.status === 'Completed'}
                          onCheckedChange={(checked) => {
                            handleUpdateTaskStatus(task.id, checked ? 'Completed' : 'In Progress');
                          }}
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={task.status === 'Completed' ? 'line-through text-muted-foreground' : ''}>
                              {task.title}
                            </h4>
                            <Badge variant={getStatusColor(task.status)}>
                              {task.status}
                            </Badge>
                            <Badge variant="outline" className={
                              task.priority === 'High' ? 'border-red-200 text-red-700' :
                              task.priority === 'Medium' ? 'border-yellow-200 text-yellow-700' :
                              'border-green-200 text-green-700'
                            }>
                              {task.priority}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Due: {task.dueDate}
                            </span>
                            <span>Project: {projects.find(p => p.id === task.projectId)?.title}</span>
                          </div>
                        </div>
                        <Select
                          value={task.status}
                          onValueChange={(value) => handleUpdateTaskStatus(task.id, value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Todo">Todo</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            {!hasProjects ? (
              <Card>
                <CardContent className="p-12">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                    <h3 className="mb-2">No Group Chats Available</h3>
                    <p className="text-muted-foreground">
                      Group chats will be available once you are assigned to a project. Contact your admin for more information.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <GroupChat 
                currentUser={user.fullName || user.name}
                projects={projects}
                onUpdateMembers={handleUpdateMembers}
                userType="student"
                messages={messages}
                onUpdateMessages={onUpdateMessages}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Submit Work Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Project Work</DialogTitle>
            <DialogDescription>
              Submit your completed project for review by your admin.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProjectForSubmission && (
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <h4 className="mb-1">{selectedProjectForSubmission.title}</h4>
              <p className="text-sm text-muted-foreground">{selectedProjectForSubmission.course}</p>
            </div>
          )}

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pdf-upload">
                Upload Project PDF <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                className="cursor-pointer"
              />
              {submissionData.pdfFileName && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">{submissionData.pdfFileName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSubmissionData({ ...submissionData, pdfFile: null, pdfFileName: '' })}
                    className="ml-auto h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Upload your project report or documentation in PDF format
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-link">
                Project Link/File URL (Optional)
              </Label>
              <Input
                id="project-link"
                placeholder="e.g., https://github.com/yourproject or https://drive.google.com/file/..."
                value={submissionData.projectLink}
                onChange={(e) => setSubmissionData({ ...submissionData, projectLink: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Provide a link to your GitHub repository, Google Drive, or any accessible URL
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Project Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe what you've built, key features, technologies used, etc."
                rows={4}
                value={submissionData.description}
                onChange={(e) => setSubmissionData({ ...submissionData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information, challenges faced, future improvements, etc."
                rows={3}
                value={submissionData.notes}
                onChange={(e) => setSubmissionData({ ...submissionData, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitWork}>
              <Upload className="h-4 w-4 mr-2" />
              Submit Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Create and assign a task to a team member for this project.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProjectForTask && (
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <h4 className="mb-1">{selectedProjectForTask.title}</h4>
              <p className="text-sm text-muted-foreground">{selectedProjectForTask.course}</p>
            </div>
          )}

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">
                Task Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="task-title"
                placeholder="e.g., Design login page, Write API documentation"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-description">Task Description</Label>
              <Textarea
                id="task-description"
                placeholder="Provide details about what needs to be done..."
                rows={3}
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-assignee">
                  Assign To <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={newTask.assignee}
                  onValueChange={(value) => setNewTask({ ...newTask, assignee: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProjectForTask?.groupMembers.map((member: string) => (
                      <SelectItem key={member} value={member}>
                        {member}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-priority">Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-due-date">
                  Due Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="task-due-date"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-status">Status</Label>
                <Select
                  value={newTask.status}
                  onValueChange={(value) => setNewTask({ ...newTask, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todo">Todo</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Details Dialog */}
      <Dialog open={isProjectDetailsOpen} onOpenChange={setIsProjectDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
            <DialogDescription>
              View complete project information including objectives, deliverables, and evaluation criteria.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProjectDetails && (
            <div className="space-y-6 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="mb-2">{selectedProjectDetails.title}</h3>
                <div className="flex gap-2">
                  <Badge variant="secondary">{selectedProjectDetails.course}</Badge>
                  <Badge variant={selectedProjectDetails.status === 'In Progress' ? 'default' : 'secondary'}>
                    {selectedProjectDetails.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Project Description</Label>
                <p className="text-sm p-3 bg-muted rounded-lg">
                  {selectedProjectDetails.description}
                </p>
              </div>

              {selectedProjectDetails.objectives && (
                <div className="space-y-2">
                  <Label>Project Objectives</Label>
                  <p className="text-sm p-3 bg-muted rounded-lg">
                    {selectedProjectDetails.objectives}
                  </p>
                </div>
              )}

              {selectedProjectDetails.deliverables && (
                <div className="space-y-2">
                  <Label>Expected Deliverables</Label>
                  <p className="text-sm p-3 bg-muted rounded-lg">
                    {selectedProjectDetails.deliverables}
                  </p>
                </div>
              )}

              {selectedProjectDetails.evaluationCriteria && (
                <div className="space-y-2">
                  <Label>Evaluation Criteria</Label>
                  <p className="text-sm p-3 bg-muted rounded-lg">
                    {selectedProjectDetails.evaluationCriteria}
                  </p>
                </div>
              )}

              {selectedProjectDetails.milestones && selectedProjectDetails.milestones.length > 0 && (
                <div className="space-y-3">
                  <Label>Project Milestones</Label>
                  <div className="space-y-2">
                    {selectedProjectDetails.milestones.map((milestone: any) => (
                      <div key={milestone.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <Checkbox checked={milestone.completed} disabled />
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span className={milestone.completed ? 'line-through text-muted-foreground' : ''}>
                          {milestone.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Due Date</Label>
                <p className="text-sm p-3 bg-muted rounded-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {selectedProjectDetails.dueDate}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsProjectDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View My Submission Dialog */}
      <Dialog open={isViewSubmissionOpen} onOpenChange={setIsViewSubmissionOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>My Project Submission</DialogTitle>
            <DialogDescription>
              View your submitted work and feedback from your admin.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6 py-4">
              {/* Status Alert */}
              {selectedSubmission.status === 'Accepted' && (
                <div className="p-4 bg-green-50 border-2 border-green-600 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <h4 className="text-green-900">Submission Accepted</h4>
                      <p className="text-sm text-green-700">Your project submission has been accepted by the admin.</p>
                    </div>
                  </div>
                </div>
              )}
              {selectedSubmission.status === 'Rejected' && (
                <div className="p-4 bg-red-50 border-2 border-red-600 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                    <div>
                      <h4 className="text-red-900">Submission Rejected</h4>
                      <p className="text-sm text-red-700">Your project submission has been rejected. Please review the feedback and resubmit if needed.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label>Project</Label>
                  <p className="mt-1">{selectedSubmission.projectTitle}</p>
                  <p className="text-sm text-muted-foreground">{selectedSubmission.course}</p>
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
                {selectedSubmission.grade && (
                  <div>
                    <Label>Grade</Label>
                    <p className="mt-1">{selectedSubmission.grade}</p>
                  </div>
                )}
              </div>

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
                  <Label>Project Link</Label>
                  <div className="flex items-center gap-2">
                    <Input value={selectedSubmission.projectLink} readOnly />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedSubmission.projectLink, '_blank')}
                    >
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

              {selectedSubmission.feedback && (
                <div className={`p-4 border rounded-lg space-y-2 ${
                  selectedSubmission.status === 'Rejected' 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <Label className={selectedSubmission.status === 'Rejected' ? 'text-red-900' : 'text-green-900'}>
                    Admin Feedback
                  </Label>
                  <p className={`text-sm ${selectedSubmission.status === 'Rejected' ? 'text-red-700' : 'text-green-700'}`}>
                    {selectedSubmission.feedback}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div>
              {selectedSubmission && selectedSubmission.status !== 'Accepted' && selectedSubmission.status !== 'Graded' && (
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    handleOpenDeleteSubmission(selectedSubmission);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Submission
                </Button>
              )}
            </div>
            <Button onClick={() => setIsViewSubmissionOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Submission Confirmation Dialog */}
      <Dialog open={isDeleteSubmissionOpen} onOpenChange={setIsDeleteSubmissionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this submission? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {submissionToDelete && (
            <div className="py-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">Project:</span> <span>{submissionToDelete.projectTitle}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Submitted:</span> <span>{submissionToDelete.submittedDate}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Status:</span>{' '}
                  <Badge 
                    variant={
                      submissionToDelete.status === 'Accepted' ? 'default' :
                      submissionToDelete.status === 'Rejected' ? 'destructive' : 'secondary'
                    }
                    className={submissionToDelete.status === 'Accepted' ? 'bg-green-600' : ''}
                  >
                    {submissionToDelete.status}
                  </Badge>
                </p>
              </div>
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-900">
                  ⚠️ Warning: Once deleted, you'll need to re-submit your work if you want to complete this project.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteSubmissionOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteSubmission}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
