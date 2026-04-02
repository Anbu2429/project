import { useState, useEffect } from "react";
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
  Typography,
  CircularProgress
} from "@mui/material";

const API_BASE = "http://localhost:8080/api/threat";

const initialForm = {
  sourceIp: "192.168.1.10",
  destinationIp: "10.0.0.15",
  destinationPort: 443,
  packetRate: 120,
  failedLogins: 1,
  unusualPayloadScore: 2
};

const numericFields = [
  "destinationPort",
  "packetRate",
  "failedLogins",
  "unusualPayloadScore"
];

function severityColor(severity) {
  if (severity === "HIGH") return "error";
  if (severity === "MEDIUM") return "warning";
  return "success";
}

export default function Dashboard() {
  const [formData, setFormData] = useState(initialForm);
  const [prediction, setPrediction] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ EXISTING FRONTEND AI
  const [explanation, setExplanation] = useState("");
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  // 🔥 NEW STATES
  const [backendAI, setBackendAI] = useState("");
  const [shapData, setShapData] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value
    }));
  };

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/logs`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      setLogs(data.reverse());
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  // 🔥 FRONTEND AI (UNCHANGED)
  const generateExplanation = (data, input) => {
    let reasons = [];

    if (input.packetRate > 100)
      reasons.push("High packet rate indicates possible DDoS activity");

    if (input.failedLogins > 3)
      reasons.push("Multiple failed login attempts suggest brute force attack");

    if (input.unusualPayloadScore > 5)
      reasons.push("Suspicious payload pattern detected");

    if (input.destinationPort === 22)
      reasons.push("Traffic targeting SSH port (22) may indicate intrusion attempt");

    if (input.destinationPort === 443)
      reasons.push("Encrypted HTTPS traffic — may hide malicious payload");

    if (reasons.length === 0)
      reasons.push("Traffic appears normal with no strong malicious indicators");

    return `
This network traffic is classified as "${data.label}" with a severity level of "${data.severity}".

Reasoning:
- ${reasons.join("\n- ")}

Trust Score: ${data.trustScore.toFixed(2)}%

Conclusion:
The system analyzed traffic patterns such as packet rate, login behavior, and payload anomalies to determine the threat level.
`;
  };

  const analyzeThreat = async () => {
    setLoading(true);
    setErrorMessage("");
    setExplanation("");
    setBackendAI("");
    setShapData([]);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log("API RESPONSE:", data);

      setPrediction(data);

      // 🔥 BACKEND AI
      if (data.explanations) {
        const ai = data.explanations.find(e => e.startsWith("AI Insight"));
        setBackendAI(ai || "");
      }

      // 🔥 SHAP DATA
      if (data.explanations) {
        const shap = data.explanations.filter(e => e.startsWith("Feature:"));
        setShapData(shap);
      }

      // 🔥 FRONTEND AI (UNCHANGED)
      setLoadingExplanation(true);
      setTimeout(() => {
        const aiText = generateExplanation(data, formData);
        setExplanation(aiText);
        setLoadingExplanation(false);
      }, 800);

      await fetchLogs();

    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700}>
        Cyber Defense Dashboard
      </Typography>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <Grid container spacing={2} sx={{ mt: 2 }}>

        {/* INPUT */}
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
                  type={numericFields.includes(key) ? "number" : "text"}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              ))}

              <Button
                variant="contained"
                onClick={analyzeThreat}
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Analyze"}
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* OUTPUT */}
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>

            {/* Prediction */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Prediction</Typography>

              {prediction ? (
                <>
                  <Typography fontWeight={600}>
                    {prediction.label}
                  </Typography>

                  <Typography>
                    Trust Score: {prediction.trustScore.toFixed(2)}%
                  </Typography>

                  <Chip
                    label={prediction.severity}
                    color={severityColor(prediction.severity)}
                    sx={{ mt: 1 }}
                  />
                </>
              ) : (
                <Typography>No data yet</Typography>
              )}
            </Paper>

            {/* FRONTEND AI */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Explanation</Typography>

              {loadingExplanation ? (
                <Box display="flex" gap={1}>
                  <CircularProgress size={20} />
                  <Typography>Generating explanation...</Typography>
                </Box>
              ) : explanation ? (
                <Typography style={{ whiteSpace: "pre-line" }}>
                  {explanation}
                </Typography>
              ) : (
                <Typography>No explanation yet</Typography>
              )}
            </Paper>

            {/* 🔥 SHAP */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">SHAP Feature Impact</Typography>

              {shapData.length > 0 ? (
                shapData.map((item, index) => (
                  <Box key={index} sx={{
                    p: 1,
                    mb: 1,
                    bgcolor: "#f0f0f0",
                    borderRadius: 2
                  }}>
                    <Typography>{item}</Typography>
                  </Box>
                ))
              ) : (
                <Typography>No SHAP data</Typography>
              )}
            </Paper>

          </Stack>
        </Grid>

        {/* LOGS */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Activity Logs</Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Source IP</TableCell>
                    <TableCell>Destination IP</TableCell>
                    <TableCell>Port</TableCell>
                    <TableCell>Prediction</TableCell>
                    <TableCell>Severity</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {logs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>{log.sourceIp}</TableCell>
                      <TableCell>{log.destinationIp}</TableCell>
                      <TableCell>{log.destinationPort}</TableCell>
                      <TableCell>{log.label}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.severity}
                          color={severityColor(log.severity)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>

              </Table>
            </TableContainer>
          </Paper>
        </Grid>

      </Grid>
    </Container>
  );
}