import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9a581a2b`;
const USE_LOCAL_STORAGE = true; // Set to false when server is deployed

// Initialize default data in localStorage
function initializeLocalStorage() {
  // Define default accounts that should always be available
  const defaultAccounts = [
    {
      email: "2400030525@kluniversity.in",
      password: "12345",
      userType: "student",
      profileComplete: true,
      name: "Ram Char",
      studentId: "2498765",
      phone: "9856774325",
      academicYear: "2",
      branch: "CSE",
      groupNumber: "1",
      id: 1,
    },
    {
      email: "ramcharan123@gmail.com",
      password: "1234",
      userType: "admin",
      profileComplete: true,
      name: "Rc",
      phone: "9876543210",
      department: "Faculty",
      id: 2,
    },
    {
      email: "anilpagadala583@gmail.com",
      password: "1234",
      userType: "admin",
      profileComplete: true,
      name: "Anil Pagadala",
      phone: "9123456789",
      department: "Faculty",
      id: 3,
    },
    {
      email: "rahul123@gmail.com",
      password: "1234567",
      userType: "admin",
      profileComplete: true,
      name: "Rahul",
      phone: "9234567890",
      department: "Faculty",
      id: 4,
    }
  ];

  // Get existing accounts or start fresh
  const existingAccountsStr = localStorage.getItem('accounts');
  if (!existingAccountsStr) {
    // No accounts exist, set defaults
    localStorage.setItem('accounts', JSON.stringify(defaultAccounts));
  } else {
    // Merge default accounts with existing ones
    const existingAccounts = JSON.parse(existingAccountsStr);
    const defaultEmails = defaultAccounts.map(acc => acc.email);
    const existingEmails = existingAccounts.map((acc: any) => acc.email);
    
    // Add any default accounts that don't exist
    const accountsToAdd = defaultAccounts.filter(acc => !existingEmails.includes(acc.email));
    
    // Update any existing default accounts with latest data
    const updatedAccounts = existingAccounts.map((acc: any) => {
      const defaultAcc = defaultAccounts.find(d => d.email === acc.email);
      return defaultAcc ? { ...acc, ...defaultAcc } : acc;
    });
    
    // Combine updated existing accounts with new default accounts
    const mergedAccounts = [...updatedAccounts, ...accountsToAdd];
    localStorage.setItem('accounts', JSON.stringify(mergedAccounts));
  }
  if (!localStorage.getItem('projects')) {
    localStorage.setItem('projects', JSON.stringify([]));
  }
  if (!localStorage.getItem('submissions')) {
    localStorage.setItem('submissions', JSON.stringify([]));
  }
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify([]));
  }
  if (!localStorage.getItem('messages')) {
    localStorage.setItem('messages', JSON.stringify([]));
  }
}

// Initialize on first load
initializeLocalStorage();

// Local storage helpers
function getFromLocalStorage(key: string) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveToLocalStorage(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify(data));
}

// API client with authorization header
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`,
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API call failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    throw error;
  }
}

// ============ ACCOUNTS ============

export async function getAccounts() {
  if (USE_LOCAL_STORAGE) {
    const accounts = getFromLocalStorage('accounts');
    return { success: true, accounts };
  }
  return apiCall('/accounts');
}

export async function createAccount(accountData: any) {
  if (USE_LOCAL_STORAGE) {
    const accounts = getFromLocalStorage('accounts');
    
    // Check if email already exists
    const existingAccount = accounts.find((acc: any) => acc.email === accountData.email);
    if (existingAccount) {
      return { success: false, error: "Email already exists" };
    }
    
    // Generate new ID
    const newId = Math.max(...accounts.map((a: any) => a.id), 0) + 1;
    const newAccount = { ...accountData, id: newId };
    
    const updatedAccounts = [...accounts, newAccount];
    saveToLocalStorage('accounts', updatedAccounts);
    
    return { success: true, account: newAccount };
  }
  return apiCall('/accounts', {
    method: 'POST',
    body: JSON.stringify(accountData),
  });
}

export async function updateAccount(email: string, updateData: any) {
  if (USE_LOCAL_STORAGE) {
    const accounts = getFromLocalStorage('accounts');
    
    const updatedAccounts = accounts.map((acc: any) => 
      acc.email === email ? { ...acc, ...updateData } : acc
    );
    
    saveToLocalStorage('accounts', updatedAccounts);
    
    const updatedAccount = updatedAccounts.find((acc: any) => acc.email === email);
    return { success: true, account: updatedAccount };
  }
  return apiCall(`/accounts/${encodeURIComponent(email)}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
}

// ============ PROJECTS ============

export async function getProjects() {
  if (USE_LOCAL_STORAGE) {
    const projects = getFromLocalStorage('projects');
    return { success: true, projects };
  }
  return apiCall('/projects');
}

export async function createProject(projectData: any) {
  if (USE_LOCAL_STORAGE) {
    const projects = getFromLocalStorage('projects');
    
    const newId = Math.max(...projects.map((p: any) => p.id), 0) + 1;
    const newProject = { ...projectData, id: newId };
    
    const updatedProjects = [...projects, newProject];
    saveToLocalStorage('projects', updatedProjects);
    
    return { success: true, project: newProject };
  }
  return apiCall('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  });
}

export async function updateProject(id: number, updateData: any) {
  if (USE_LOCAL_STORAGE) {
    const projects = getFromLocalStorage('projects');
    
    const updatedProjects = projects.map((p: any) => 
      p.id === id ? { ...p, ...updateData } : p
    );
    
    saveToLocalStorage('projects', updatedProjects);
    
    const updatedProject = updatedProjects.find((p: any) => p.id === id);
    return { success: true, project: updatedProject };
  }
  return apiCall(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
}

export async function deleteProject(id: number) {
  if (USE_LOCAL_STORAGE) {
    const projects = getFromLocalStorage('projects');
    
    const updatedProjects = projects.filter((p: any) => p.id !== id);
    saveToLocalStorage('projects', updatedProjects);
    
    return { success: true };
  }
  return apiCall(`/projects/${id}`, {
    method: 'DELETE',
  });
}

// ============ SUBMISSIONS ============

export async function getSubmissions() {
  if (USE_LOCAL_STORAGE) {
    const submissions = getFromLocalStorage('submissions');
    return { success: true, submissions };
  }
  return apiCall('/submissions');
}

export async function createSubmission(submissionData: any) {
  if (USE_LOCAL_STORAGE) {
    const submissions = getFromLocalStorage('submissions');
    
    const newId = Math.max(...submissions.map((s: any) => s.id), 0) + 1;
    const newSubmission = { ...submissionData, id: newId };
    
    const updatedSubmissions = [...submissions, newSubmission];
    saveToLocalStorage('submissions', updatedSubmissions);
    
    return { success: true, submission: newSubmission };
  }
  return apiCall('/submissions', {
    method: 'POST',
    body: JSON.stringify(submissionData),
  });
}

export async function updateSubmission(id: number, updateData: any) {
  if (USE_LOCAL_STORAGE) {
    const submissions = getFromLocalStorage('submissions');
    
    const updatedSubmissions = submissions.map((s: any) => 
      s.id === id ? { ...s, ...updateData } : s
    );
    
    saveToLocalStorage('submissions', updatedSubmissions);
    
    const updatedSubmission = updatedSubmissions.find((s: any) => s.id === id);
    return { success: true, submission: updatedSubmission };
  }
  return apiCall(`/submissions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
}

export async function deleteSubmission(id: number) {
  if (USE_LOCAL_STORAGE) {
    const submissions = getFromLocalStorage('submissions');
    
    const updatedSubmissions = submissions.filter((s: any) => s.id !== id);
    saveToLocalStorage('submissions', updatedSubmissions);
    
    return { success: true };
  }
  return apiCall(`/submissions/${id}`, {
    method: 'DELETE',
  });
}

// ============ TASKS ============

export async function getTasks() {
  if (USE_LOCAL_STORAGE) {
    const tasks = getFromLocalStorage('tasks');
    return { success: true, tasks };
  }
  return apiCall('/tasks');
}

export async function createTask(taskData: any) {
  if (USE_LOCAL_STORAGE) {
    const tasks = getFromLocalStorage('tasks');
    
    const newId = Math.max(...tasks.map((t: any) => t.id), 0) + 1;
    const newTask = { ...taskData, id: newId };
    
    const updatedTasks = [...tasks, newTask];
    saveToLocalStorage('tasks', updatedTasks);
    
    return { success: true, task: newTask };
  }
  return apiCall('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
}

export async function updateTask(id: number, updateData: any) {
  if (USE_LOCAL_STORAGE) {
    const tasks = getFromLocalStorage('tasks');
    
    const updatedTasks = tasks.map((t: any) => 
      t.id === id ? { ...t, ...updateData } : t
    );
    
    saveToLocalStorage('tasks', updatedTasks);
    
    const updatedTask = updatedTasks.find((t: any) => t.id === id);
    return { success: true, task: updatedTask };
  }
  return apiCall(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
}

// ============ MESSAGES ============

export async function getMessages() {
  if (USE_LOCAL_STORAGE) {
    const messages = getFromLocalStorage('messages');
    return { success: true, messages };
  }
  return apiCall('/messages');
}

export async function createMessage(messageData: any) {
  if (USE_LOCAL_STORAGE) {
    const messages = getFromLocalStorage('messages');
    
    const newId = Math.max(...messages.map((m: any) => m.id), 0) + 1;
    const newMessage = { ...messageData, id: newId };
    
    const updatedMessages = [...messages, newMessage];
    saveToLocalStorage('messages', updatedMessages);
    
    return { success: true, message: newMessage };
  }
  return apiCall('/messages', {
    method: 'POST',
    body: JSON.stringify(messageData),
  });
}
