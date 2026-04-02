import { Box, Button, Container, Typography, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top left, #0f1b3d 0%, #081120 35%, #050816 70%, #02040a 100%)",
      }}
    >
      {/* Animated glowing blobs */}
      <Box
        sx={{
          position: "absolute",
          top: "5%",
          left: "8%",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "rgba(0, 255, 255, 0.15)",
          filter: "blur(90px)",
          animation: "floatBlob1 10s ease-in-out infinite",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "10%",
          right: "8%",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "rgba(0, 184, 212, 0.18)",
          filter: "blur(100px)",
          animation: "floatBlob2 12s ease-in-out infinite",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "55%",
          left: "18%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(118, 255, 3, 0.12)",
          filter: "blur(80px)",
          animation: "floatBlob3 8s ease-in-out infinite",
        }}
      />

      {/* Grid background */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "45px 45px",
          animation: "gridMove 15s linear infinite",
          opacity: 0.22,
        }}
      />

      {/* Cyber pulse rings */}
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          right: "20%",
          width: 180,
          height: 180,
          border: "2px solid rgba(0,255,255,0.18)",
          borderRadius: "50%",
          animation: "pulseRing 4s linear infinite",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "18%",
          left: "15%",
          width: 140,
          height: 140,
          border: "2px solid rgba(118,255,3,0.15)",
          borderRadius: "50%",
          animation: "pulseRing 5s linear infinite",
        }}
      />

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: i % 2 === 0 ? "#00e5ff" : "#76ff03",
            top: `${10 + i * 6}%`,
            left: `${5 + i * 7}%`,
            boxShadow: "0 0 12px currentColor",
            animation: `particleFloat ${4 + i % 4}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
            opacity: 0.8,
          }}
        />
      ))}

      {/* Dark overlay for readability */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to right, rgba(0,0,0,0.45), rgba(0,0,0,0.25), rgba(0,0,0,0.45))",
        }}
      />

      {/* Main content */}
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 3 }}>
        <Box
          sx={{
            textAlign: "center",
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            backdropFilter: "blur(14px)",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(0,255,255,0.15)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.45)",
          }}
        >
          <Typography
            variant="h3"
            fontWeight="bold"
            gutterBottom
            sx={{
              color: "#ffffff",
              textShadow: "0 0 18px rgba(0,229,255,0.45)",
              fontSize: { xs: "2rem", sm: "2.8rem" },
            }}
          >
            Adaptive Trust-Aware Explainable Cyber Defense Framework
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "#d6e4f0",
              mt: 2,
              lineHeight: 1.9,
              fontSize: { xs: "1rem", sm: "1.15rem" },
            }}
          >
            AI-powered cyber defense system using Random Forest, Trust Scoring,
            and SHAP Explainable AI to detect DDoS, brute-force, and network
            intrusion attacks in real time with transparency and reliability.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            mt={4}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/dashboard")}
              sx={{
                px: 4,
                py: 1.4,
                fontWeight: "bold",
                borderRadius: "12px",
                background: "linear-gradient(90deg, #00b8d4, #00e5ff)",
                boxShadow: "0 0 18px rgba(0,229,255,0.35)",
              }}
            >
              Go to Dashboard
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/users")}
              sx={{
                px: 4,
                py: 1.4,
                fontWeight: "bold",
                borderRadius: "12px",
                color: "#fff",
                borderColor: "#00e5ff",
                "&:hover": {
                  borderColor: "#76ff03",
                  background: "rgba(255,255,255,0.05)",
                },
              }}
            >
              View Active Users
            </Button>
            <Button
  variant="outlined"
  size="large"
  onClick={() => navigate("/risk-analysis")}
  sx={{
    px: 4,
    py: 1.4,
    fontWeight: "bold",
    borderRadius: "12px",
    color: "#fff",
    borderColor: "#ffb300",
    "&:hover": {
      borderColor: "#ff1744",
      background: "rgba(255,255,255,0.05)",
    },
  }}
>
  View Risk Analysis
</Button>
          </Stack>
        </Box>
      </Container>

      <style>
        {`
          @keyframes floatBlob1 {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(30px, -20px) scale(1.08); }
            100% { transform: translate(0, 0) scale(1); }
          }

          @keyframes floatBlob2 {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-25px, 20px) scale(1.1); }
            100% { transform: translate(0, 0) scale(1); }
          }

          @keyframes floatBlob3 {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(20px, -15px) scale(1.06); }
            100% { transform: translate(0, 0) scale(1); }
          }

          @keyframes gridMove {
            0% { transform: translateY(0px); }
            100% { transform: translateY(45px); }
          }

          @keyframes pulseRing {
            0% {
              transform: scale(0.8);
              opacity: 0.8;
            }
            70% {
              transform: scale(1.3);
              opacity: 0.1;
            }
            100% {
              transform: scale(1.5);
              opacity: 0;
            }
          }

          @keyframes particleFloat {
            0% { transform: translateY(0px); opacity: 0.4; }
            50% { transform: translateY(-20px); opacity: 1; }
            100% { transform: translateY(0px); opacity: 0.4; }
          }
        `}
      </style>
    </Box>
  );
}