import { useState, useEffect } from "react";
import { Login } from "./components/Login";
import { Registration } from "./components/Registration";
import { AdminDashboard } from "./components/AdminDashboard";
import { StudentDashboard } from "./components/StudentDashboard";
import { Profile } from "./components/Profile";
import { ProfileSetup } from "./components/ProfileSetup";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import * as api from "./utils/api";

type UserType = "admin" | "student";
type View =
  | "login"
  | "registration"
  | "profileSetup"
  | "dashboard"
  | "profile";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("login");
  const [userType, setUserType] = useState<UserType | null>(null);
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all data from server on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      
      // Load all data in parallel
      const [accountsRes, projectsRes, submissionsRes, tasksRes, messagesRes] = await Promise.all([
        api.getAccounts(),
        api.getProjects(),
        api.getSubmissions(),
        api.getTasks(),
        api.getMessages(),
      ]);

      if (accountsRes.success) setAccounts(accountsRes.accounts);
      if (projectsRes.success) setProjects(projectsRes.projects);
      if (submissionsRes.success) setSubmissions(submissionsRes.submissions);
      if (tasksRes.success) setTasks(tasksRes.tasks);
      if (messagesRes.success) setMessages(messagesRes.messages);
    } catch (error) {
      console.error("Error loading data:", error);
      // Data will be loaded from localStorage automatically
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (type: UserType, userData: any) => {
    try {
      const newAccount = {
        ...userData,
        userType: type,
        profileComplete: false,
      };

      // Store the new account in the server
      const response = await api.createAccount(newAccount);
      
      if (response.success) {
        const createdAccount = response.account;
        setAccounts([...accounts, createdAccount]);
        setUserType(type);
        setUser(createdAccount);
        setCurrentView("profileSetup");
        toast.success("Account created successfully!");
      }
    } catch (error) {
      console.error("Error creating account:", error);
      toast.error("Failed to create account. Please try again.");
    }
  };

  const handleLogin = (type: UserType, userData: any) => {
    setUserType(type);
    setUser(userData);
    // Check if user has completed profile setup
    if (!userData.profileComplete) {
      setCurrentView("profileSetup");
    } else {
      setCurrentView("dashboard");
    }
  };

  const handleShowRegistration = () => {
    setCurrentView("registration");
  };

  const handleBackToLogin = () => {
    setCurrentView("login");
  };

  const handleProfileSetupComplete = async (profileData: any) => {
    try {
      const updatedUser = {
        ...user,
        ...profileData,
        profileComplete: true,
        // Initialize average grade as null - only admins can set this
        averageGrade: null,
      };

      // Update the account on the server
      const response = await api.updateAccount(user.email, updatedUser);
      
      if (response.success) {
        setUser(response.account);
        setAccounts(
          accounts.map((acc) =>
            acc.email === user.email ? response.account : acc,
          ),
        );
        setCurrentView("dashboard");
        toast.success("Profile setup completed!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to save profile. Please try again.");
    }
  };

  const handleShowProfile = () => {
    setCurrentView("profile");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
  };

  const handleProfileUpdate = async (updatedUser: any) => {
    try {
      const response = await api.updateAccount(updatedUser.email, updatedUser);
      
      if (response.success) {
        setUser(response.account);
        setAccounts(
          accounts.map((acc) =>
            acc.email === updatedUser.email ? response.account : acc,
          ),
        );
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleLogout = () => {
    setUserType(null);
    setUser(null);
    setCurrentView("login");
  };

  const handleUpdateProjects = (updatedProjects: any[]) => {
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
  };

  const handleUpdateSubmissions = (updatedSubmissions: any[]) => {
    setSubmissions(updatedSubmissions);
    localStorage.setItem('submissions', JSON.stringify(updatedSubmissions));
  };

  const handleUpdateTasks = (updatedTasks: any[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const handleUpdateMessages = (updatedMessages: any[]) => {
    setMessages(updatedMessages);
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
  };

  const handleCreateStudentAccount = async (studentData: any) => {
    try {
      const newAccount = {
        ...studentData,
        userType: "student",
        profileComplete: true,
      };

      const response = await api.createAccount(newAccount);
      
      if (response.success) {
        setAccounts([...accounts, response.account]);
        toast.success("Student account created successfully!");
        return response.account;
      }
    } catch (error) {
      console.error("Error creating student account:", error);
      toast.error("Failed to create student account. Please try again.");
      return null;
    }
  };

  // Show loading screen while data loads
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FEDF-PS35 Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentView === "login" && (
        <Login
          onLogin={handleLogin}
          onShowRegistration={handleShowRegistration}
          accounts={accounts}
        />
      )}

      {currentView === "registration" && (
        <Registration
          onRegister={handleRegister}
          onBackToLogin={handleBackToLogin}
          existingAccounts={accounts}
        />
      )}

      {currentView === "profileSetup" && userType && (
        <ProfileSetup
          userType={userType}
          initialData={user}
          onComplete={handleProfileSetupComplete}
        />
      )}

      {currentView === "profile" && user && userType && (
        <Profile
          user={user}
          userType={userType}
          onBack={handleBackToDashboard}
          onUpdate={handleProfileUpdate}
        />
      )}

      {currentView === "dashboard" && user && userType && (
        <>
          {userType === "admin" ? (
            <AdminDashboard
              user={user}
              onShowProfile={handleShowProfile}
              onLogout={handleLogout}
              projects={projects}
              onUpdateProjects={handleUpdateProjects}
              submissions={submissions}
              onUpdateSubmissions={handleUpdateSubmissions}
              tasks={tasks}
              onCreateStudentAccount={
                handleCreateStudentAccount
              }
              allAccounts={accounts}
              messages={messages}
              onUpdateMessages={handleUpdateMessages}
            />
          ) : (
            <StudentDashboard
              user={user}
              onShowProfile={handleShowProfile}
              onLogout={handleLogout}
              projects={projects}
              onUpdateProjects={handleUpdateProjects}
              onUpdateSubmissions={handleUpdateSubmissions}
              submissions={submissions}
              tasks={tasks}
              onUpdateTasks={handleUpdateTasks}
              messages={messages}
              onUpdateMessages={handleUpdateMessages}
            />
          )}
        </>
      )}

      {!currentView && (
        <Login
          onLogin={handleLogin}
          onShowRegistration={handleShowRegistration}
          accounts={accounts}
        />
      )}

      <Toaster />
    </>
  );
}