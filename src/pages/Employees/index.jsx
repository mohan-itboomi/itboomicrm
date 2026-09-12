import CustomTable from "../../Component/CustomTable";
import CustomPageHeader from "../../Component/CustomPageHeader";
import ReusableInput from "../../Component/ReusableInput";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { openModal } from "../../Api/Redux/Reducers/modalSlice";
import { ApiService } from "../../Api/ApiService";
const fields = ["name", "email", "role", "department", "status"];
export default function Employees() {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const load = () =>
    ApiService.getEmployees({ search }).then((r) =>
      setRows((r.data?.data || r.data).items || []),
    );
  useEffect(() => {
    load();
  }, [search]);
  const modal = (record, view = false) =>
    dispatch(
      openModal({
        title: (view ? "View" : record ? "Edit" : "Create") + " Employees",
        component: view ? "EMPLOYEES_VIEW" : "EMPLOYEES_FORM",
        props: { resource: "employees", fields, record, onSaved: load },
      }),
    );
  return (<Box><CustomPageHeader title="Employees" subtitle="Manage employees." buttonText="Create Employees" buttonIcon={<AddIcon />} onButtonClick={() => modal()} />
      <ReusableInput name="search" placeholder="Search Employees" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ mb: 2, maxWidth: 567 }} />
      <CustomTable columns={[...fields.map((field) => ({ field, headerName: field, render: (row) => { const value = row[field]; return value && typeof value === "object" ? value.name || value._id || "—" : value || "—"; } })), { field: "actions", headerName: "Actions", render: (row) => <Box sx={{ display: "flex" }}><IconButton onClick={() => modal(row, true)}><VisibilityIcon /></IconButton><IconButton onClick={() => modal(row)}><EditIcon /></IconButton><IconButton color="error" onClick={async () => { if (confirm("Delete this record?")) { await ApiService.deleteRecord("employees", row._id); load(); } }}><DeleteIcon /></IconButton></Box> }]} rows={rows} emptyMessage="No records found" showSerialNumber />
    </Box>
  );
}

