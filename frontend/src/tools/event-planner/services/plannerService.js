// Demo version using localStorage instead of backend API

const PROJECTS_KEY = 'planner_projects';
const TASKS_KEY = 'planner_tasks';

const getProjectsData = () => {
  const data = localStorage.getItem(PROJECTS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveProjectsData = (projects) => {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

const getTasksData = () => {
  const data = localStorage.getItem(TASKS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveTasksData = (tasks) => {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

const plannerService = {
  getProjects: async () => {
    const projects = getProjectsData();
    return { results: projects, count: projects.length };
  },
  
  getProject: async (id) => {
    const projects = getProjectsData();
    const project = projects.find(p => p.id === id);
    return project || null;
  },
  
  createProject: async (data) => {
    const projects = getProjectsData();
    const newProject = { ...data, id: Date.now().toString(), created_at: new Date().toISOString() };
    projects.unshift(newProject);
    saveProjectsData(projects);
    return newProject;
  },
  
  updateProject: async (id, data) => {
    const projects = getProjectsData();
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...data };
      saveProjectsData(projects);
      return projects[index];
    }
    throw new Error('Project not found');
  },
  
  deleteProject: async (id) => {
    const projects = getProjectsData();
    const filtered = projects.filter(p => p.id !== id);
    saveProjectsData(filtered);
  },
  
  createTask: async (data) => {
    const tasks = getTasksData();
    const newTask = { ...data, id: Date.now().toString(), created_at: new Date().toISOString() };
    tasks.unshift(newTask);
    saveTasksData(tasks);
    return newTask;
  },
  
  updateTask: async (id, data) => {
    const tasks = getTasksData();
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...data };
      saveTasksData(tasks);
      return tasks[index];
    }
    throw new Error('Task not found');
  },
  
  deleteTask: async (id) => {
    const tasks = getTasksData();
    const filtered = tasks.filter(t => t.id !== id);
    saveTasksData(filtered);
  }
};

export default plannerService;
