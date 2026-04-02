import { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Login({ setIsLoggedIn }) {
  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ✅ Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ SIMPLE STATIC LOGIN
  const handleLogin = () => {
    setError("");
    setLoading(true);

    setTimeout(() => {
      const { username, password } = loginData;

      // 🔥 STATIC CHECK
      if (username === "admin@gmail.com" && password === "admin") {
        // Save fake token
        localStorage.setItem("token", "admin-token");

        setIsLoggedIn(true);
        navigate("/Home");
      } else {
        setError("❌ Invalid email or password");
      }

      setLoading(false);
    }, 500); // small delay for UI
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Stack spacing={2} mt={2}>
          <TextField
            label="Email"
            name="username"
            value={loginData.username}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            value={loginData.password}
            onChange={handleChange}
            fullWidth
          />

          <Button
            variant="contained"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Login"}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}