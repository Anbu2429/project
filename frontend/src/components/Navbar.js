import { AppBar, Toolbar, Button, Typography, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Navbar({ setIsLoggedIn }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Cyber Defense
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button color="inherit" onClick={() => navigate("/dashboard")}>
            Dashboard
          </Button>

          <Button color="inherit" onClick={() => navigate("/users")}>
            Active Users
          </Button>

          <Button color="error" variant="contained" onClick={logout}>
            Logout
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}