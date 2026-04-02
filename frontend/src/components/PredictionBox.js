import { Typography, Chip, Paper, Box, Divider } from "@mui/material";

function severityColor(severity) {
  if (severity === "HIGH") return "error";
  if (severity === "MEDIUM") return "warning";
  return "success";
}

export default function PredictionBox({ prediction }) {
  if (!prediction) return null;

  return (
    <>
      {/* 🔥 MAIN PREDICTION BOX */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">
          Attack: {prediction.label}
        </Typography>

        <Typography>
          Trust Score: {prediction.trustScore.toFixed(2)}%
        </Typography>

        <Chip
          label={prediction.severity}
          color={severityColor(prediction.severity)}
          sx={{ mt: 1 }}
        />
      </Paper>

      {/* 🔥 AI EXPLANATION BOX */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          🔍 AI Explanation
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {prediction.explanation && prediction.explanation.length > 0 ? (
          prediction.explanation.map((item, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography variant="body2">
                <b>{item.feature}</b> = {item.value}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Impact: {item.shap_impact.toFixed(4)}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography>No explanation available</Typography>
        )}
      </Paper>
    </>
  );
}