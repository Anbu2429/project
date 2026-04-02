import { useEffect, useState } from "react";
import {
  Container, Paper, Table, TableHead,
  TableRow, TableCell, TableBody, Typography, Chip
} from "@mui/material";

// 🔥 FIXED API URL
const API = "http://localhost:8080/api/threat/active-users";

export default function ActiveUsers() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setUsers(data);

    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 AUTO REFRESH EVERY 3 SECONDS
  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Active Users (Live)</Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Login Time</TableCell>
              <TableCell>VPN</TableCell>
              <TableCell>Risk</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((u, i) => (
              <TableRow key={i}>
                
                {/* 🔥 FIELD FIX */}
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.ip}</TableCell>
                <TableCell>{u.time}</TableCell>

                {/* VPN */}
                <TableCell>
                  <Chip
                    label={u.vpn ? "YES" : "NO"}
                    color={u.vpn ? "error" : "success"}
                  />
                </TableCell>

                {/* RISK */}
                <TableCell>
                  <Chip
                    label={u.risk}
                    color={
                      u.risk === "CRITICAL"
                        ? "error"
                        : u.risk === "HIGH"
                        ? "warning"
                        : "success"
                    }
                  />
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>

      </Paper>
    </Container>
  );
}