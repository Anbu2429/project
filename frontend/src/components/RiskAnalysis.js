import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Chip,
  Stack,
  LinearProgress,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const getRiskColor = (value) => {
  if (value >= 70) return "#ff1744"; // red
  if (value >= 40) return "#ffb300"; // yellow
  return "#00e676"; // green
};

const getRiskLevel = (value) => {
  if (value >= 70) return "CRITICAL";
  if (value >= 40) return "MEDIUM";
  return "SAFE";
};

const getTrustScore = (value) => Math.max(0, 100 - value);

const getTrustLabel = (trust) => {
  if (trust >= 70) return "HIGH TRUST";
  if (trust >= 40) return "MODERATE TRUST";
  return "LOW TRUST";
};

const initialRiskData = [
  {
    id: 1,
    title: "DDoS Attack",
    value: 90,
    description:
      "A very high volume of malicious traffic indicates a strong possibility of distributed denial-of-service behavior in the network.",
    shap: [
      { name: "Flow Duration", impact: 92 },
      { name: "Packet Rate", impact: 88 },
      { name: "Fwd Packets/s", impact: 84 },
    ],
  },
  {
    id: 2,
    title: "Brute Force Attack",
    value: 65,
    description:
      "Repeated suspicious authentication attempts suggest a possible brute-force attack against user accounts or services.",
    shap: [
      { name: "Login Attempts", impact: 86 },
      { name: "Failed Requests", impact: 72 },
      { name: "Destination Port", impact: 61 },
    ],
  },
  {
    id: 3,
    title: "Intrusion Attack",
    value: 30,
    description:
      "Some unusual traffic patterns were identified, but the current impact is limited and the overall threat remains lower.",
    shap: [
      { name: "Idle Mean", impact: 45 },
      { name: "Packet Length", impact: 39 },
      { name: "Flow IAT Mean", impact: 30 },
    ],
  },
];

const timelineSeed = [
  { time: "10:00", ddos: 55, brute: 42, intrusion: 24 },
  { time: "10:05", ddos: 61, brute: 48, intrusion: 27 },
  { time: "10:10", ddos: 68, brute: 53, intrusion: 22 },
  { time: "10:15", ddos: 72, brute: 57, intrusion: 29 },
  { time: "10:20", ddos: 80, brute: 60, intrusion: 31 },
  { time: "10:25", ddos: 90, brute: 65, intrusion: 30 },
];

function AnimatedCounter({ value, color }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const stepTime = 20;
    const increment = value / (duration / stepTime);

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <Typography
      variant="h2"
      sx={{
        fontWeight: "bold",
        color,
        lineHeight: 1,
        textShadow: `0 0 10px ${color}55`,
      }}
    >
      {count}
      <Typography component="span" sx={{ fontSize: 28, color: "#bbb" }}>
        %
      </Typography>
    </Typography>
  );
}

function AlertBanner({ highestAttack }) {
  const isCritical = highestAttack.value >= 70;
  const bannerColor = getRiskColor(highestAttack.value);

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 4,
        p: 2.2,
        borderRadius: 4,
        background: "rgba(255,255,255,0.06)",
        border: `1px solid ${bannerColor}`,
        backdropFilter: "blur(12px)",
        boxShadow: `0 0 25px ${bannerColor}55`,
        animation: isCritical ? "blinkAlert 1.2s infinite" : "none",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        spacing={2}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <WarningAmberRoundedIcon sx={{ color: bannerColor, fontSize: 30 }} />
          <Box>
            <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "1.1rem" }}>
              Live Alert: {highestAttack.title} is currently the top detected threat
            </Typography>
            <Typography sx={{ color: "#cfd8dc" }}>
              Risk {highestAttack.value}% • Level {getRiskLevel(highestAttack.value)} • Trust{" "}
              {getTrustScore(highestAttack.value)}%
            </Typography>
          </Box>
        </Stack>

        <Chip
          label={getRiskLevel(highestAttack.value)}
          sx={{
            fontWeight: "bold",
            color: "#fff",
            background: bannerColor,
            boxShadow: `0 0 10px ${bannerColor}88`,
          }}
        />
      </Stack>
    </Paper>
  );
}

function ShapPanel({ shap, color }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mt: 3,
        borderRadius: 4,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <InsightsRoundedIcon sx={{ color }} />
        <Typography sx={{ color: "#fff", fontWeight: 700 }}>
          SHAP Feature Influence
        </Typography>
      </Stack>

      {shap.map((item, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" mb={0.7}>
            <Typography sx={{ color: "#dfe6e9", fontSize: "0.95rem" }}>
              {item.name}
            </Typography>
            <Typography sx={{ color, fontWeight: 700 }}>
              {item.impact}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={item.impact}
            sx={{
              height: 8,
              borderRadius: 10,
              backgroundColor: "rgba(255,255,255,0.08)",
              "& .MuiLinearProgress-bar": {
                backgroundColor: color,
                borderRadius: 10,
              },
            }}
          />
        </Box>
      ))}
    </Paper>
  );
}

function RiskCard({ title, value, description, shap, isTop }) {
  const color = getRiskColor(value);
  const level = getRiskLevel(value);
  const trustScore = getTrustScore(value);
  const trustLabel = getTrustLabel(trustScore);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 5,
        textAlign: "center",
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(14px)",
        border: isTop
          ? "2px solid rgba(255,23,68,0.9)"
          : "1px solid rgba(255,255,255,0.08)",
        boxShadow: isTop
          ? "0 0 35px rgba(255,23,68,0.65)"
          : `0 8px 30px ${color}33`,
        transition: "0.4s ease",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-10px) scale(1.02)",
          boxShadow: isTop
            ? "0 0 45px rgba(255,23,68,0.8)"
            : `0 12px 35px ${color}66`,
        },
      }}
    >
      {isTop && (
        <Chip
          label="TOP ATTACK"
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            fontWeight: "bold",
            color: "#fff",
            background: "linear-gradient(90deg, #ff1744, #ff5252)",
            boxShadow: "0 0 12px rgba(255,23,68,0.6)",
          }}
        />
      )}

      <Box
        sx={{
          width: 220,
          height: 220,
          mx: "auto",
          mt: 2,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `conic-gradient(${color} ${value * 3.6}deg, rgba(255,255,255,0.12) 0deg)`,
          position: "relative",
          animation: "spinIn 1.2s ease",
          boxShadow: `0 0 28px ${color}55`,
        }}
      >
        <Box
          sx={{
            width: 165,
            height: 165,
            borderRadius: "50%",
            background: "rgba(10,15,30,0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            boxShadow: "inset 0 0 12px rgba(255,255,255,0.08)",
          }}
        >
          <AnimatedCounter value={value} color={color} />

          <Typography
            sx={{
              mt: 1.5,
              fontWeight: "bold",
              color,
              letterSpacing: 1,
              fontSize: "0.95rem",
            }}
          >
            {level}
          </Typography>
        </Box>
      </Box>

      <Typography
        variant="h5"
        sx={{
          mt: 4,
          fontWeight: "bold",
          color: "#ffffff",
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 2,
          color: "#cfd8dc",
          lineHeight: 1.8,
          minHeight: 95,
        }}
      >
        {description}
      </Typography>

      <Box
        sx={{
          mt: 3,
          p: 2,
          borderRadius: 3,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={1}
          mb={1}
        >
          <ShieldRoundedIcon sx={{ color: trustScore >= 70 ? "#00e676" : trustScore >= 40 ? "#ffb300" : "#ff1744" }} />
          <Typography sx={{ color: "#ffffff", fontWeight: 700 }}>
            Trust Score:
            <span
              style={{
                color:
                  trustScore >= 70
                    ? "#00e676"
                    : trustScore >= 40
                    ? "#ffb300"
                    : "#ff1744",
                marginLeft: 6,
              }}
            >
              {trustScore}%
            </span>
          </Typography>
        </Stack>

        <Typography
          sx={{
            fontWeight: "bold",
            color:
              trustScore >= 70
                ? "#00e676"
                : trustScore >= 40
                ? "#ffb300"
                : "#ff1744",
            letterSpacing: 1,
          }}
        >
          {trustLabel}
        </Typography>
      </Box>

      <Box
        sx={{
          mt: 3,
          display: "flex",
          justifyContent: "center",
          gap: 4,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 10px ${color}`,
            }}
          />
          <Typography sx={{ color: "#dfe6e9", fontWeight: 600 }}>
            Attack Risk
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background:
                trustScore >= 70
                  ? "#00e676"
                  : trustScore >= 40
                  ? "#ffb300"
                  : "#ff1744",
            }}
          />
          <Typography sx={{ color: "#dfe6e9", fontWeight: 600 }}>
            Trust Level
          </Typography>
        </Box>
      </Box>

      <ShapPanel shap={shap} color={color} />
    </Paper>
  );
}

function AttackTimeline({ data }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 5,
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <TimelineRoundedIcon sx={{ color: "#00e5ff" }} />
        <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "1.1rem" }}>
          Attack Timeline Graph
        </Typography>
      </Stack>

      <Typography sx={{ color: "#cfd8dc", mb: 3 }}>
        Live attack trend based on recent detection windows from the cyber defense framework.
      </Typography>

      <Box sx={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="time" stroke="#cfd8dc" />
            <YAxis stroke="#cfd8dc" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                background: "#0b1020",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                color: "#fff",
              }}
            />
            <Line type="monotone" dataKey="ddos" stroke="#ff1744" strokeWidth={3} />
            <Line type="monotone" dataKey="brute" stroke="#ffb300" strokeWidth={3} />
            <Line type="monotone" dataKey="intrusion" stroke="#00e676" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Stack direction="row" spacing={3} mt={2} flexWrap="wrap">
        <Typography sx={{ color: "#ff1744", fontWeight: 700 }}>DDoS</Typography>
        <Typography sx={{ color: "#ffb300", fontWeight: 700 }}>Brute Force</Typography>
        <Typography sx={{ color: "#00e676", fontWeight: 700 }}>Intrusion</Typography>
      </Stack>
    </Paper>
  );
}

export default function RiskAnalysis() {
  const [riskData, setRiskData] = useState(initialRiskData);
  const [timelineData, setTimelineData] = useState(timelineSeed);

  useEffect(() => {
    const interval = setInterval(() => {
      setRiskData((prev) =>
        prev.map((item) => {
          const variation = Math.floor(Math.random() * 7) - 3;
          let newValue = item.value + variation;

          if (item.title === "DDoS Attack") newValue = Math.min(100, Math.max(70, newValue));
          if (item.title === "Brute Force Attack") newValue = Math.min(85, Math.max(40, newValue));
          if (item.title === "Intrusion Attack") newValue = Math.min(45, Math.max(15, newValue));

          return { ...item, value: newValue };
        })
      );

      setTimelineData((prev) => {
        const lastTime = prev[prev.length - 1]?.time || "10:25";
        const [h, m] = lastTime.split(":").map(Number);
        const nextMinute = m + 5;
        const nextTime = `${String(h + Math.floor(nextMinute / 60)).padStart(2, "0")}:${String(
          nextMinute % 60
        ).padStart(2, "0")}`;

        const nextPoint = {
          time: nextTime,
          ddos: Math.min(100, Math.max(50, prev[prev.length - 1].ddos + (Math.floor(Math.random() * 11) - 5))),
          brute: Math.min(90, Math.max(35, prev[prev.length - 1].brute + (Math.floor(Math.random() * 9) - 4))),
          intrusion: Math.min(50, Math.max(10, prev[prev.length - 1].intrusion + (Math.floor(Math.random() * 7) - 3))),
        };

        const updated = [...prev, nextPoint];
        return updated.slice(-8);
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const highestAttack = useMemo(() => {
    return riskData.reduce((max, item) => (item.value > max.value ? item : max), riskData[0]);
  }, [riskData]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 6,
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(circle at top left, #0f172a 0%, #081120 35%, #050816 70%, #02040a 100%)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "8%",
          left: "6%",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "rgba(255, 23, 68, 0.14)",
          filter: "blur(90px)",
          animation: "float1 8s ease-in-out infinite",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "8%",
          right: "8%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "rgba(0, 184, 212, 0.14)",
          filter: "blur(100px)",
          animation: "float2 10s ease-in-out infinite",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "25%",
          right: "25%",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "rgba(255, 179, 0, 0.12)",
          filter: "blur(80px)",
          animation: "float3 7s ease-in-out infinite",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          opacity: 0.18,
        }}
      />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2 }}>
        <Typography
          variant="h3"
          align="center"
          sx={{
            color: "#fff",
            fontWeight: "bold",
            mb: 2,
            textShadow: "0 0 18px rgba(0,229,255,0.35)",
          }}
        >
          Cyber Threat Risk Analysis
        </Typography>

        <Typography
          align="center"
          sx={{
            color: "#cfd8dc",
            maxWidth: 950,
            mx: "auto",
            mb: 5,
            lineHeight: 1.8,
            fontSize: "1.05rem",
          }}
        >
          This page shows live attack risk, trust score, SHAP-based feature influence,
          attack timeline trends, and real-time alert behavior for the AI-driven cyber defense framework.
        </Typography>

        <AlertBanner highestAttack={highestAttack} />

        <Grid container spacing={4}>
          {riskData.map((item) => (
            <Grid item xs={12} md={4} key={item.id}>
              <RiskCard {...item} isTop={item.value === highestAttack.value} />
            </Grid>
          ))}
        </Grid>

        <Box mt={5}>
          <AttackTimeline data={timelineData} />
        </Box>
      </Container>

      <style>
        {`
          @keyframes float1 {
            0% { transform: translate(0,0) scale(1); }
            50% { transform: translate(20px,-20px) scale(1.08); }
            100% { transform: translate(0,0) scale(1); }
          }

          @keyframes float2 {
            0% { transform: translate(0,0) scale(1); }
            50% { transform: translate(-20px,20px) scale(1.1); }
            100% { transform: translate(0,0) scale(1); }
          }

          @keyframes float3 {
            0% { transform: translate(0,0) scale(1); }
            50% { transform: translate(15px,-10px) scale(1.06); }
            100% { transform: translate(0,0) scale(1); }
          }

          @keyframes spinIn {
            0% {
              transform: scale(0.7) rotate(-90deg);
              opacity: 0;
            }
            100% {
              transform: scale(1) rotate(0deg);
              opacity: 1;
            }
          }

          @keyframes blinkAlert {
            0% { box-shadow: 0 0 18px rgba(255,23,68,0.35); }
            50% { box-shadow: 0 0 35px rgba(255,23,68,0.85); }
            100% { box-shadow: 0 0 18px rgba(255,23,68,0.35); }
          }
        `}
      </style>
    </Box>
  );
}