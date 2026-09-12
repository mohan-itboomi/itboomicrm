import { useState } from "react";
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { ApiService } from "../../Api/ApiService";

export default function Settings() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState(null);
  const submit = async event => { event.preventDefault(); setMessage(null); if (form.newPassword !== form.confirmPassword) return setMessage({ type: "error", text: "New passwords do not match." }); try { await ApiService.changePassword(form); setForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); setMessage({ type: "success", text: "Password changed successfully." }); } catch (error) { setMessage({ type: "error", text: error.response?.data?.message || "Password change failed." }); } };
  return <Stack spacing={3}><Stack spacing={.5}><Typography variant="h4" fontWeight={850}>Settings</Typography><Typography color="text.secondary">Keep your account secure.</Typography></Stack><Card sx={{ maxWidth: 560 }}><CardContent><Stack component="form" onSubmit={submit} spacing={2}><Typography variant="h6" fontWeight={800}>Change password</Typography>{message && <Alert severity={message.type}>{message.text}</Alert>}<TextField required label="Current password" type="password" value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })} /><TextField required label="New password" type="password" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} /><TextField required label="Confirm new password" type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} /><Button type="submit" variant="contained">Update password</Button></Stack></CardContent></Card></Stack>;
}
