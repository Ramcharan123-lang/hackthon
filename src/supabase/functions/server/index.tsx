import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-9a581a2b/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize default accounts if they don't exist
async function initializeDefaultAccounts() {
  try {
    const existingAccounts = await kv.get("accounts");
    if (!existingAccounts) {
      const defaultAccounts = [
        {
          email: "2400030525@kluniversity.in",
          password: "Ram",
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
          email: "ramcharang1777@gmail.com",
          password: "Ram123",
          userType: "admin",
          profileComplete: true,
          name: "Rc",
          phone: "9876543210",
          department: "Faculty",
          id: 2,
        }
      ];
      await kv.set("accounts", defaultAccounts);
      console.log("Default accounts initialized");
    }
  } catch (error) {
    console.error("Error initializing default accounts:", error);
  }
}

// Initialize on startup
await initializeDefaultAccounts();

// ============ ACCOUNTS ============

// Get all accounts
app.get("/make-server-9a581a2b/accounts", async (c) => {
  try {
    const accounts = await kv.get("accounts") || [];
    return c.json({ success: true, accounts });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create a new account
app.post("/make-server-9a581a2b/accounts", async (c) => {
  try {
    const accountData = await c.req.json();
    const accounts = await kv.get("accounts") || [];
    
    // Check if email already exists
    const existingAccount = accounts.find((acc: any) => acc.email === accountData.email);
    if (existingAccount) {
      return c.json({ success: false, error: "Email already exists" }, 400);
    }
    
    // Generate new ID
    const newId = Math.max(...accounts.map((a: any) => a.id), 0) + 1;
    const newAccount = { ...accountData, id: newId };
    
    const updatedAccounts = [...accounts, newAccount];
    await kv.set("accounts", updatedAccounts);
    
    return c.json({ success: true, account: newAccount });
  } catch (error) {
    console.error("Error creating account:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update an account
app.put("/make-server-9a581a2b/accounts/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const updateData = await c.req.json();
    const accounts = await kv.get("accounts") || [];
    
    const updatedAccounts = accounts.map((acc: any) => 
      acc.email === email ? { ...acc, ...updateData } : acc
    );
    
    await kv.set("accounts", updatedAccounts);
    
    const updatedAccount = updatedAccounts.find((acc: any) => acc.email === email);
    return c.json({ success: true, account: updatedAccount });
  } catch (error) {
    console.error("Error updating account:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============ PROJECTS ============

// Get all projects
app.get("/make-server-9a581a2b/projects", async (c) => {
  try {
    const projects = await kv.get("projects") || [];
    // Filter out expired projects (past due date)
    const now = new Date();
    const validProjects = projects.filter((project: any) => {
      if (!project.dueDate) return true;
      const dueDate = new Date(project.dueDate);
      return dueDate >= now;
    });
    
    // Update storage if we filtered any projects
    if (validProjects.length !== projects.length) {
      await kv.set("projects", validProjects);
    }
    
    return c.json({ success: true, projects: validProjects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create a new project
app.post("/make-server-9a581a2b/projects", async (c) => {
  try {
    const projectData = await c.req.json();
    const projects = await kv.get("projects") || [];
    
    const newId = Math.max(...projects.map((p: any) => p.id), 0) + 1;
    const newProject = { ...projectData, id: newId };
    
    const updatedProjects = [...projects, newProject];
    await kv.set("projects", updatedProjects);
    
    return c.json({ success: true, project: newProject });
  } catch (error) {
    console.error("Error creating project:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update a project
app.put("/make-server-9a581a2b/projects/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const updateData = await c.req.json();
    const projects = await kv.get("projects") || [];
    
    const updatedProjects = projects.map((p: any) => 
      p.id === id ? { ...p, ...updateData } : p
    );
    
    await kv.set("projects", updatedProjects);
    
    const updatedProject = updatedProjects.find((p: any) => p.id === id);
    return c.json({ success: true, project: updatedProject });
  } catch (error) {
    console.error("Error updating project:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete a project
app.delete("/make-server-9a581a2b/projects/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const projects = await kv.get("projects") || [];
    
    const updatedProjects = projects.filter((p: any) => p.id !== id);
    await kv.set("projects", updatedProjects);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============ SUBMISSIONS ============

// Get all submissions
app.get("/make-server-9a581a2b/submissions", async (c) => {
  try {
    const submissions = await kv.get("submissions") || [];
    return c.json({ success: true, submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create a new submission
app.post("/make-server-9a581a2b/submissions", async (c) => {
  try {
    const submissionData = await c.req.json();
    const submissions = await kv.get("submissions") || [];
    
    const newId = Math.max(...submissions.map((s: any) => s.id), 0) + 1;
    const newSubmission = { ...submissionData, id: newId };
    
    const updatedSubmissions = [...submissions, newSubmission];
    await kv.set("submissions", updatedSubmissions);
    
    return c.json({ success: true, submission: newSubmission });
  } catch (error) {
    console.error("Error creating submission:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update a submission
app.put("/make-server-9a581a2b/submissions/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const updateData = await c.req.json();
    const submissions = await kv.get("submissions") || [];
    
    const updatedSubmissions = submissions.map((s: any) => 
      s.id === id ? { ...s, ...updateData } : s
    );
    
    await kv.set("submissions", updatedSubmissions);
    
    const updatedSubmission = updatedSubmissions.find((s: any) => s.id === id);
    return c.json({ success: true, submission: updatedSubmission });
  } catch (error) {
    console.error("Error updating submission:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============ TASKS ============

// Get all tasks
app.get("/make-server-9a581a2b/tasks", async (c) => {
  try {
    const tasks = await kv.get("tasks") || [];
    return c.json({ success: true, tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create a new task
app.post("/make-server-9a581a2b/tasks", async (c) => {
  try {
    const taskData = await c.req.json();
    const tasks = await kv.get("tasks") || [];
    
    const newId = Math.max(...tasks.map((t: any) => t.id), 0) + 1;
    const newTask = { ...taskData, id: newId };
    
    const updatedTasks = [...tasks, newTask];
    await kv.set("tasks", updatedTasks);
    
    return c.json({ success: true, task: newTask });
  } catch (error) {
    console.error("Error creating task:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update a task
app.put("/make-server-9a581a2b/tasks/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const updateData = await c.req.json();
    const tasks = await kv.get("tasks") || [];
    
    const updatedTasks = tasks.map((t: any) => 
      t.id === id ? { ...t, ...updateData } : t
    );
    
    await kv.set("tasks", updatedTasks);
    
    const updatedTask = updatedTasks.find((t: any) => t.id === id);
    return c.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============ MESSAGES ============

// Get all messages
app.get("/make-server-9a581a2b/messages", async (c) => {
  try {
    const messages = await kv.get("messages") || [];
    return c.json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create a new message
app.post("/make-server-9a581a2b/messages", async (c) => {
  try {
    const messageData = await c.req.json();
    const messages = await kv.get("messages") || [];
    
    const newId = Math.max(...messages.map((m: any) => m.id), 0) + 1;
    const newMessage = { ...messageData, id: newId };
    
    const updatedMessages = [...messages, newMessage];
    await kv.set("messages", updatedMessages);
    
    return c.json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Error creating message:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);