import { Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { closeModal } from "../../Api/Redux/Reducers/modalSlice";
import { ApiService } from "../../Api/ApiService";
const fields = ['taskId','message'];
export default function CommentsFormModal({ resource, record, onSaved }) {
  const dispatch = useDispatch();
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((field) => [field, record?.[field] ?? ""])));
  const [saving, setSaving] = useState(false);
  const submit = async (event) => { event.preventDefault(); setSaving(true); try { if (record?._id) await ApiService.updateRecord(resource, record._id, values); else await ApiService.createRecord(resource, values); await onSaved?.(); dispatch(closeModal()); } finally { setSaving(false); } };
  return <form onSubmit={submit}><Stack spacing={2} sx={{ p: 1, borderTop: "4px solid #4527a0" }}><Typography variant="h6">Comments details</Typography>{fields.map((field) => <TextField key={field} label={field} value={values[field]} onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))} required fullWidth />)}<Button type="submit" variant="contained" sx={{ bgcolor: "#4527a0" }} disabled={saving}>{saving ? "Saving..." : record ? "Update Comments" : "Create Comments"}</Button></Stack></form>;
}
