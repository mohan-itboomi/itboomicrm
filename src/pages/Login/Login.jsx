import { useState } from 'react';
import { Alert, Box, Button, Card, Checkbox, Divider, FormControlLabel, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../../Api/ApiService';
import { storeAuthTokens } from '../../Api/authSession';

const highlights = [
  ['Track every project', 'Keep teams aligned from planning to delivery.', TrendingUpRoundedIcon],
  ['Work smarter', 'Understand tasks, time and progress in one place.', AccessTimeRoundedIcon],
  ['One connected team', 'Bring employees, projects and reports together.', GroupsRoundedIcon],
];

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const submit = async (event) => {
    event.preventDefault(); setError(''); setLoading(true);
    try { const response = await ApiService.login(form); storeAuthTokens(response.data); if (remember) localStorage.setItem('rememberLogin', 'true'); navigate('/dashboard'); }
    catch (e) { setError(e.response?.data?.message || 'Unable to sign in. Please check your details.'); }
    finally { setLoading(false); }
  };
  return <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#f7f9fc', p: { xs: 0, md: 3 } }}>
    <Card elevation={0} sx={{ width: '100%', maxWidth: 1240, mx: 'auto', display: 'flex', overflow: 'hidden', border: { xs: 0, md: '1px solid #e5eaf2' }, borderRadius: { xs: 0, md: 4 } }}>
      <Box sx={{ display: { xs: 'none', md: 'flex' }, width: '48%', p: 6, color: 'white', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(145deg,#172554 0%,#263d91 58%,#536dce 100%)' }}>
        <Box><Stack direction="row" spacing={1.5} alignItems="center"><Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: 'rgba(255,255,255,.16)', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 20 }}>O</Box><Typography variant="h6" fontWeight={800}>Office CRM</Typography></Stack><Typography sx={{ mt: 9, fontSize: 42, lineHeight: 1.12, fontWeight: 800 }}>Work with clarity.<br/>Grow with confidence.</Typography><Typography sx={{ mt: 2, color: '#c7d2fe', maxWidth: 410, fontSize: 16 }}>A simple command centre for your people, projects and everyday work.</Typography></Box>
        <Stack spacing={2.5}>{highlights.map(([title,text,Icon])=><Stack direction="row" spacing={2} key={title} alignItems="center"><Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: 'rgba(255,255,255,.14)', display: 'grid', placeItems: 'center' }}><Icon fontSize="small"/></Box><Box><Typography fontWeight={700}>{title}</Typography><Typography variant="body2" sx={{ color: '#c7d2fe' }}>{text}</Typography></Box></Stack>)}</Stack>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 3, sm: 7 } }}><Box sx={{ width: '100%', maxWidth: 410 }}><Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'flex', md: 'none' }, mb: 6 }}><Box sx={{ color: 'white', bgcolor: 'primary.main', width: 38, height: 38, borderRadius: 2, display: 'grid', placeItems: 'center', fontWeight: 900 }}>O</Box><Typography variant="h6" fontWeight={800}>Office CRM</Typography></Stack><Typography variant="h4" fontWeight={800} color="#172033">Welcome back</Typography><Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>Sign in to continue to your workspace.</Typography>{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}<Box component="form" onSubmit={submit}><Stack spacing={2.5}><TextField label="Email address" type="email" required fullWidth value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><TextField label="Password" type={showPassword ? 'text' : 'password'} required fullWidth value={form.password} onChange={e=>setForm({...form,password:e.target.value})} InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={()=>setShowPassword(!showPassword)} edge="end">{showPassword?<VisibilityOffIcon/>:<VisibilityIcon/>}</IconButton></InputAdornment> }}/><Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><FormControlLabel control={<Checkbox checked={remember} onChange={e=>setRemember(e.target.checked)} size="small"/>} label={<Typography variant="body2">Remember me</Typography>}/><Typography variant="body2" color="primary.main" sx={{ cursor: 'pointer', fontWeight: 600 }}>Forgot password?</Typography></Box><Button type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>{loading ? 'Signing in...' : 'Sign in to workspace'}</Button></Stack></Box><Divider sx={{ my: 4 }}/><Typography variant="body2" color="text.secondary" textAlign="center">Secure workspace access for your organization</Typography></Box></Box>
    </Card>
  </Box>;
}
