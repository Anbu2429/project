import { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';

const API_BASE = 'http://localhost:8080/api/threat';
const AUTH_API = 'http://localhost:8080/api/auth/login';

const initialForm = {
  sourceIp: '192.168.1.10',
  destinationIp: '10.0.0.15',
  destinationPort: 443,
  packetRate: 120,
  failedLogins: 1,
  unusualPayloadScore: 2
};

const numericFields = ['destinationPort', 'packetRate', 'failedLogins', 'unusualPayloadScore'];

function severityColor(severity) {
  if (severity === 'HIGH') return 'error';
  if (severity === 'MEDIUM') return 'warning';
  return 'success';
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  const [formData, setFormData] = useState(initialForm);
  const [prediction, setPrediction] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ✅ Auto login on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  // ✅ Handle login input
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ Login API call
  const handleLogin = async () => {
    try {
      const response = await fetch(AUTH_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
      });

      if (!response.ok) {
        throw new Error("Invalid username or password");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      setIsLoggedIn(true);

    } catch (error) {
      alert(error.message);
    }
  };

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  // ✅ Form input
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value
    }));
  };

  // ✅ Fetch logs (with token)
  const fetchLogs = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}/logs`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Unable to fetch logs');
    }

    const data = await response.json();
    setLogs(data.reverse());
  };

  // ✅ Analyze (with token)
  const analyzeThreat = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Backend error or unauthorized');
      }

      const data = await response.json();
      setPrediction(data);
      await fetchLogs();

    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGIN UI
  if (!isLoggedIn) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Login
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Username"
              name="username"
              value={loginData.username}
              onChange={handleLoginChange}
              fullWidth
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={loginData.password}
              onChange={handleLoginChange}
              fullWidth
            />
            <Button variant="contained" onClick={handleLogin}>
              Login
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  // ✅ MAIN DASHBOARD
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h4" fontWeight={700}>
          Cyber Defense Dashboard
        </Typography>
        <Button variant="outlined" onClick={handleLogout}>
          Logout
        </Button>
      </Stack>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Traffic Input</Typography>
            <Stack spacing={2}>
              {Object.entries(formData).map(([key, value]) => (
                <TextField
                  key={key}
                  label={key}
                  name={key}
                  value={value}
                  type={numericFields.includes(key) ? 'number' : 'text'}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              ))}
              <Button variant="contained" onClick={analyzeThreat}>
                Analyze
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Prediction</Typography>
            {prediction && (
              <>
                <Typography>{prediction.label}</Typography>
                <Typography>{(prediction.trustScore * 1).toFixed(2)}%</Typography>
                <Chip label={prediction.severity} color={severityColor(prediction.severity)} />
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}