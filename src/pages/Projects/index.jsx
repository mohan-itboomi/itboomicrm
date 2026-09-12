import { useEffect, useState } from "react";
import { Box, IconButton, Stack, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { openModal } from "../../Api/Redux/Reducers/modalSlice";
import { ApiService } from "../../Api/ApiService";
import CustomPageHeader from "../../Component/CustomPageHeader";
import CustomTable from "../../Component/CustomTable";
import StatusChip from "../../Component/StatusChip";
import ReusableButton from "../../Component/ReusableButton";

const fields = ["projectCode", "name", "client", "status", "priority"];
const valueOf = (value) =>
  value && typeof value === "object"
    ? value.name || value._id || "-"
    : value || "-";

export default function Projects() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const currentRole = String(
    currentUser.role || currentUser.accessRole || "",
  ).toLowerCase();
  const canManageProjects = ["admin", "bd", "project-coordinator"].includes(
    currentRole,
  );
  const canDeleteProjects = currentRole === "admin";
  const load = () =>
    ApiService.getProjects({ search }).then((response) =>
      setRows((response.data?.data || response.data).items || []),
    );
  useEffect(() => {
    load();
  }, [search]);
  const modal = (record, view = false) =>
    dispatch(
      openModal({
        title: `${view ? "View" : record ? "Edit" : "Create"} Project`,
        component: view ? "PROJECTS_VIEW" : "PROJECTS_FORM",
        props: { resource: "projects", fields, record, onSaved: load },
      }),
    );
  return (
    <Stack spacing={3}>
      <CustomPageHeader
        title="Projects"
        subtitle="Open an assigned project workspace to review modules, tasks, and delivery time."
        buttonText={canManageProjects ? "Create project" : undefined}
        buttonIcon={<AddIcon />}
        onButtonClick={canManageProjects ? () => modal() : undefined}
      />
      <TextField
        size="small"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search projects"
        sx={{ maxWidth: 360 }}
      />
      <CustomTable
        columns={[
          ...fields.map((field) => ({
            field,
            headerName: field,
            render: (row) =>
              field === "status" ? (
                <StatusChip value={row[field]} />
              ) : (
                valueOf(row[field])
              ),
          })),
          {
            field: "actions",
            headerName: "Actions",
            render: (row) => (
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <IconButton
                  title="Open project workspace"
                  color="primary"
                  onClick={() => navigate(`/projects/${row._id}`)}
                >
                  <AccountTreeRoundedIcon />
                </IconButton>
                <IconButton
                  title="View project"
                  onClick={() => modal(row, true)}
                >
                  <VisibilityIcon />
                </IconButton>
                {canManageProjects && (
                  <>
                    <IconButton title="Edit project" onClick={() => modal(row)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      title="Delete project"
                      color="error"
                      onClick={async () => {
                        if (confirm("Delete this project?")) {
                          await ApiService.deleteProject(row._id);
                          load();
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                )}
              </Box>
            ),
          },
        ]}
        rows={rows}
        emptyMessage="No projects found"
        showSerialNumber
      />
    </Stack>
  );
}
