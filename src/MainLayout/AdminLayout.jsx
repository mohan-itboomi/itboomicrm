import {
  AppBar,
  Box,
  Button,
  CssBaseline,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import GroupsIcon from "@mui/icons-material/Groups";
import FolderIcon from "@mui/icons-material/Folder";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BugReportIcon from "@mui/icons-material/BugReport";
import CommentIcon from "@mui/icons-material/Comment";
import EventNoteIcon from "@mui/icons-material/EventNote";
import HistoryIcon from "@mui/icons-material/History";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ApiService } from "../Api/ApiService";
import { clearAuthSession } from "../Api/authSession";

const allLinks = [
  ["Dashboard", "/dashboard", DashboardIcon, ["admin", "employee", "web-developer", "mobile-developer", "team-lead", "tester", "bd"]],
  ["Employees", "/employees", PeopleIcon, ["admin"]],
  ["Teams", "/teams", GroupsIcon, ["admin", "team-lead"]],
  ["Projects", "/projects", FolderIcon, ["admin", "team-lead", "bd", "project-coordinator"]],
  ["FRD & Scope", "/frd", DescriptionRoundedIcon, ["admin", "employee", "web-developer", "mobile-developer", "team-lead", "tester", "bd", "project-coordinator"]],
  ["Tasks", "/tasks", AssignmentIcon, ["admin", "team-lead", "project-coordinator", "employee", "web-developer", "mobile-developer", "tester"]],
  ["Bugs", "/bugs", BugReportIcon, ["admin", "tester", "web-developer", "mobile-developer"]],
  ["Comments", "/comments", CommentIcon, ["admin", "team-lead", "project-coordinator", "employee", "tester"]],
  ["EOD Reports", "/eod-reports", EventNoteIcon, ["admin", "team-lead", "project-coordinator", "employee", "web-developer", "mobile-developer", "tester"]],
  ["Audit Logs", "/audit-logs", HistoryIcon, ["admin"]],
  ["Time tracker", "/timer", TimerRoundedIcon, ["admin", "employee", "web-developer", "mobile-developer", "team-lead", "tester", "project-coordinator"]],
  ["Reports", "/reports", AssessmentRoundedIcon, ["admin", "team-lead", "project-coordinator", "employee", "web-developer", "mobile-developer", "tester"]],
  ["Calendar", "/calendar", CalendarMonthRoundedIcon, ["admin", "employee", "web-developer", "mobile-developer", "team-lead", "tester"]],
  ["Settings", "/settings", SettingsRoundedIcon, ["admin", "employee", "web-developer", "mobile-developer", "team-lead", "tester", "project-coordinator"]],
  ["Business development", "/business-development", HandshakeRoundedIcon, ["admin", "bd"]],
];

const drawer = 250;

export default function AdminLayout() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const role = String(user.role || user.accessRole || "employee").toLowerCase();
  const displayName = user.name || user.email || String(user.role || "Employee").replaceAll("-", " ");
  const links = allLinks.filter(([, , , roles]) => roles.includes(role));

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#eef2f7" }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        sx={{
          width: drawer,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawer,
            bgcolor: "#132b57",
            color: "#edf3ff",
            boxSizing: "border-box",
            border: "none",
            boxShadow: "inset -1px 0 0 rgba(255,255,255,0.08)",
          },
        }}
      >
        <Toolbar sx={{ minHeight: 82, px: 2.5, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.05em", color: "#fff" }}>
            Office CRM
          </Typography>
        </Toolbar>

        <List sx={{ px: 1.25, py: 1.5 }}>
          {links.map(([label, to, Icon]) => (
            <ListItemButton
              key={to}
              component={NavLink}
              to={to}
              sx={{
                my: 0.45,
                borderRadius: 2,
                color: "#dfe9ff",
                px: 1.5,
                py: 0.9,
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.05)",
                },
                "&.active": {
                  bgcolor: "#2b4b8a",
                  color: "#fff",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 38 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={label}
                slotProps={{
                  primary: {
                    sx: { fontWeight: 600, fontSize: "0.97rem" },
                  },
                }}
              />
            </ListItemButton>
          ))}
        </List>

        <Button
          onClick={() => {
            ApiService.logout().catch(() => undefined);
            clearAuthSession();
            nav("/login");
          }}
          sx={{
            mt: "auto",
            mx: 2,
            mb: 2,
            borderRadius: 2,
            bgcolor: "rgba(255,255,255,0.08)",
            color: "#fff",
            textTransform: "none",
            fontWeight: 700,
            boxShadow: "none",
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.14)",
            },
          }}
          variant="contained"
          color="inherit"
        >
          Logout
        </Button>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, width: 0, overflowX: "hidden" }}>
        <AppBar
          position="static"
          color="inherit"
          elevation={0}
          sx={{
            bgcolor: "#f4f7fb",
            color: "#1d2636",
            boxShadow: "none",
            borderBottom: "1px solid #dde4ee",
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between", minHeight: 78, px: 3.5 }}>
            <Typography sx={{ fontWeight: 700, color: "#1f2d3d", fontSize: "1.05rem" }}>
              {role === "admin" ? "Admin workspace" : `${String(user.role || "Team").replaceAll("-", " ")} workspace`}
            </Typography>
            <Typography variant="body2" sx={{ color: "#667085", fontWeight: 600 }}>
              {displayName}
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: { xs: 2, md: 3.8 }, minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
