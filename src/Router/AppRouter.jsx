import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import Login from "../pages/Login/Login";
import AdminLayout from "../MainLayout/AdminLayout";
import Dashboard from "../pages/Dashboard";
import Employees from "../pages/Employees";
import Teams from "../pages/Teams";
import Projects from "../pages/Projects";
import Modules from "../pages/Modules";
import Tasks from "../pages/Tasks";
import Bugs from "../pages/Bugs";
import Comments from "../pages/Comments";
import EODReports from "../pages/EODReports";
import AuditLogs from "../pages/AuditLogs";
import Timer from "../pages/Timer";
import Reports from "../pages/Reports";
import Calendar from "../pages/Calendar";
import Settings from "../pages/Settings";
import BusinessDevelopment from "../pages/BusinessDevelopment";
import ProjectWorkspace from "../pages/Projects/Workspace";
import ProjectDocuments from "../pages/ProjectDocuments";
const Protected = () =>
  localStorage.getItem("acesstoken") ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
const RoleGate = ({ roles, children }) => {
  const user = JSON.parse(localStorage.getItem("adminUser") || "{}");
  return roles.includes(
    String(user.role || user.accessRole || "").toLowerCase(),
  ) ? (
    children
  ) : (
    <Navigate to="/dashboard" replace />
  );
};
export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    element: <Protected />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "employees", element: <Employees /> },
          { path: "teams", element: <Teams /> },
          {
            path: "projects",
            element: (
              <RoleGate roles={["admin", "team-lead", "bd"]}>
                <Projects />
              </RoleGate>
            ),
          },
          {
            path: "projects/:id",
            element: (
              <RoleGate roles={["admin", "team-lead", "bd"]}>
                <ProjectWorkspace />
              </RoleGate>
            ),
          },
          { path: "frd", element: <ProjectDocuments /> },
          { path: "modules", element: <Modules /> },
          { path: "tasks", element: <Tasks /> },
          { path: "bugs", element: <Bugs /> },
          { path: "comments", element: <Comments /> },
          { path: "eod-reports", element: <EODReports /> },
          { path: "audit-logs", element: <AuditLogs /> },
          { path: "timer", element: <Timer /> },
          { path: "reports", element: <Reports /> },
          { path: "calendar", element: <Calendar /> },
          { path: "settings", element: <Settings /> },
          {
            path: "business-development",
            element: (
              <RoleGate roles={["admin", "bd"]}>
                <BusinessDevelopment />
              </RoleGate>
            ),
          },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
