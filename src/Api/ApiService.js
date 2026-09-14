import api from "./api";

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );

// Authentication
export const login = (payload) => api.post("/auth/login", payload);
export const getCurrentUser = () => api.get("/auth/me");
export const refreshToken = (refreshTokenValue) =>
  api.post("/auth/refresh-tokens", { refreshToken: refreshTokenValue });
export const logout = () => api.post("/auth/logout");
export const changePassword = (payload) =>
  api.post("/auth/change-password", payload);
export const forgotPassword = (payload) =>
  api.post("/auth/forgot-password", payload);
export const resetPassword = (payload) =>
  api.post("/auth/reset-password", payload);

// Shared CRUD request methods
const list = (path, params) => api.get(path, { params: cleanParams(params) });
const get = (path, id) => api.get(`${path}/${id}`);
const create = (path, payload) => api.post(path, payload);
const update = (path, id, payload) => api.put(`${path}/${id}`, payload);
const remove = (path, id) => api.delete(`${path}/${id}`);
export const getList = (resource, params = {}) => list(`/${resource}`, params);
export const getById = (resource, id) => get(`/${resource}`, id);
export const createRecord = (resource, payload) =>
  create(`/${resource}`, payload);
export const updateRecord = (resource, id, payload) =>
  update(`/${resource}`, id, payload);
export const deleteRecord = (resource, id) => remove(`/${resource}`, id);
export const uploadMedia = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/media/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
};
export const downloadFile = (url) =>
  api.get(url, { responseType: "blob" });

// Employees
export const getEmployees = (params = {}) => list("/employees", params);
export const getEmployeeById = (id) => get("/employees", id);
export const getEmployeeId = () => api.get("/employees/generate-id");
export const getEmployeeDropdown = () => api.get("/employees/dropdown");
export const createEmployee = (payload) => create("/employees", payload);
export const updateEmployee = (id, payload) =>
  update("/employees", id, payload);
export const deleteEmployee = (id) => remove("/employees", id);
export const updateEmployeeStatus = (id, status) =>
  api.patch(`/employees/${id}/status`, { status });

// Teams
export const getTeams = (params = {}) => list("/teams", params);
export const getTeamById = (id) => get("/teams", id);
export const createTeam = (payload) => create("/teams", payload);
export const updateTeam = (id, payload) => update("/teams", id, payload);
export const deleteTeam = (id) => remove("/teams", id);
export const addTeamMember = (id, userId) =>
  api.post(`/teams/${id}/members`, { userId });
export const removeTeamMember = (id, userId) =>
  api.delete(`/teams/${id}/members/${userId}`);
export const assignTeamLead = (id, userId) =>
  api.patch(`/teams/${id}/lead`, { userId });

// Projects
export const getProjectId = () => api.get("/projects/generate-code");
export const getProjects = (params = {}) => list("/projects", params);
export const getProjectById = (id) => get("/projects", id);
export const createProject = (payload) => create("/projects", payload);
export const updateProject = (id, payload) => update("/projects", id, payload);
export const deleteProject = (id) => remove("/projects", id);
export const addProjectMember = (id, userId) =>
  api.post(`/projects/${id}/members`, { userId });
export const removeProjectMember = (id, userId) =>
  api.delete(`/projects/${id}/members/${userId}`);
export const updateProjectScope = (id, scope) =>
  api.patch(`/projects/${id}/scope`, scope);
export const updateProjectFrd = (id, frd) =>
  api.patch(`/projects/${id}/frd`, frd);
export const deleteProjectFrd = (id, frdId) =>
  api.delete(`/projects/${id}/frd/${frdId}`);
export const addProjectPhase = (id, phase) =>
  api.post(`/projects/${id}/phases`, phase);
export const updateProjectPhase = (id, phaseId, phase) =>
  api.patch(`/projects/${id}/phases/${phaseId}`, phase);
export const deleteProjectPhase = (id, phaseId) =>
  api.delete(`/projects/${id}/phases/${phaseId}`);
export const getRoles = () => api.get("/access/roles");
export const getPermissions = () => api.get("/access/permissions");
export const updateRolePermissions = (id, permissions) =>
  api.patch(`/access/roles/${id}/permissions`, { permissions });

// Modules
export const getModules = (params = {}) => list("/modules", params);
export const getModuleById = (id) => get("/modules", id);
export const createModule = (payload) => create("/modules", payload);
export const updateModule = (id, payload) => update("/modules", id, payload);
export const deleteModule = (id) => remove("/modules", id);
export const getProjectModules = (projectId, params = {}) =>
  list(`/projects/${projectId}/modules`, params);
export const createProjectModule = (projectId, payload) =>
  api.post(`/projects/${projectId}/modules`, payload);
export const updateProjectModule = (projectId, moduleId, payload) =>
  api.put(`/projects/${projectId}/modules/${moduleId}`, payload);
export const deleteProjectModule = (projectId, moduleId) =>
  api.delete(`/projects/${projectId}/modules/${moduleId}`);

// Tasks
export const getTasks = (params = {}) => list("/tasks", params);
export const getTaskById = (id) => get("/tasks", id);
export const createTask = (payload) => create("/tasks", payload);
export const updateTask = (id, payload) => update("/tasks", id, payload);
export const deleteTask = (id) => remove("/tasks", id);
export const updateProjectTask = (projectId, taskId, payload) =>
  api.put(`/projects/${projectId}/tasks/${taskId}`, payload);
export const deleteProjectTask = (projectId, taskId) =>
  api.delete(`/projects/${projectId}/tasks/${taskId}`);
export const assignTask = (id, assignedTo) =>
  api.patch(`/tasks/${id}/assign`, { assignedTo });
export const updateTaskStatus = (id, status) =>
  api.patch(`/tasks/${id}/status`, { status });
export const updateTaskProgress = (id, completionPercentage) =>
  api.patch(`/tasks/${id}/progress`, { completionPercentage });

// Timer, dashboard, and reporting APIs
export const getDashboardSummary = (params = {}) =>
  list("/dashboard/summary", params);
export const getCurrentTimer = () => api.get("/timers/current");
export const getPausedTimers = () => api.get("/timers/paused");
export const getTimerOverview = () => api.get("/timers/overview");
export const startTimer = (taskId) => api.post("/timers/start", { taskId });
export const pauseTimer = (reason) => api.post("/timers/pause", { reason });
export const resumeTimer = (workSessionId) =>
  api.post("/timers/resume", { workSessionId });
export const completeTimer = (taskId, payload) =>
  api.post("/timers/complete", { taskId, ...payload });
export const getTaskTimeHistory = (taskId) =>
  api.get(`/timers/tasks/${taskId}`);
export const getProjectTimeSummary = (projectId) =>
  api.get(`/timers/projects/${projectId}/summary`);
export const getDailyReports = (params = {}) => list("/reports/daily", params);
export const getEmployeeReport = (id, params = {}) =>
  list(`/reports/employees/${id}`, params);
export const getProjectReport = (id, params = {}) =>
  list(`/reports/projects/${id}`, params);
export const getTimesheets = (params = {}) =>
  list("/reports/timesheets", params);
export const getBugAnalytics = (params = {}) =>
  list("/reports/bugs/analytics", params);
export const exportTimesheets = (params = {}) =>
  api.get("/reports/timesheets/export", { params, responseType: "blob" });

// Bugs
export const getBugs = (params = {}) => list("/bugs", params);
export const getBugById = (id) => get("/bugs", id);
export const createBug = (payload) => create("/bugs", payload);
export const updateBug = (id, payload) => update("/bugs", id, payload);
export const deleteBug = (id) => remove("/bugs", id);

// Comments
export const getComments = (params = {}) => list("/comments", params);
export const getCommentById = (id) => get("/comments", id);
export const createComment = (payload) => create("/comments", payload);
export const updateComment = (id, payload) => update("/comments", id, payload);
export const deleteComment = (id) => remove("/comments", id);

// EOD reports
export const getEODReports = (params = {}) => list("/eod-reports", params);
export const getEODReportById = (id) => get("/eod-reports", id);
export const createEODReport = (payload) => create("/eod-reports", payload);
export const updateEODReport = (id, payload) =>
  update("/eod-reports", id, payload);
export const deleteEODReport = (id) => remove("/eod-reports", id);

// Audit logs
export const getAuditLogs = (params = {}) => list("/audit-logs", params);
export const getAuditLogById = (id) => get("/audit-logs", id);
export const createAuditLog = (payload) => create("/audit-logs", payload);
export const updateAuditLog = (id, payload) =>
  update("/audit-logs", id, payload);
export const deleteAuditLog = (id) => remove("/audit-logs", id);

export const ApiService = {
  login,
  getCurrentUser,
  refreshToken,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  getList,
  getById,
  createRecord,
  updateRecord,
  deleteRecord,
  getEmployees,
  getEmployeeById,
  getEmployeeId,
  getEmployeeDropdown,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateEmployeeStatus,
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  assignTeamLead,
  getProjectId,
  getProjects,
  getProjectById,
  uploadMedia,
  downloadFile,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  updateProjectScope,
  updateProjectFrd,
  deleteProjectFrd,
  addProjectPhase,
  updateProjectPhase,
  deleteProjectPhase,
  getRoles,
  getPermissions,
  updateRolePermissions,
  getModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
  getProjectModules,
  createProjectModule,
  updateProjectModule,
  deleteProjectModule,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateProjectTask,
  deleteProjectTask,
  assignTask,
  updateTaskStatus,
  updateTaskProgress,
  getDashboardSummary,
  getCurrentTimer,
  getPausedTimers,
  getTimerOverview,
  startTimer,
  pauseTimer,
  resumeTimer,
  completeTimer,
  getTaskTimeHistory,
  getProjectTimeSummary,
  getDailyReports,
  getEmployeeReport,
  getProjectReport,
  getTimesheets,
  getBugAnalytics,
  exportTimesheets,
  getBugs,
  getBugById,
  createBug,
  updateBug,
  deleteBug,
  getComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  getEODReports,
  getEODReportById,
  createEODReport,
  updateEODReport,
  deleteEODReport,
  getAuditLogs,
  getAuditLogById,
  createAuditLog,
  updateAuditLog,
  deleteAuditLog,
};

export default ApiService;
