import { Stack, TextField, Button } from "@mui/material";

const numericFields = ['destinationPort', 'packetRate', 'failedLogins', 'unusualPayloadScore'];

export default function TrafficForm({ formData, setFormData, analyzeThreat }) {

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value
    }));
  };

  return (
    <Stack spacing={2}>
      {Object.entries(formData).map(([key, value]) => (
        <TextField
          key={key}
          label={key}
          name={key}
          value={value}
          onChange={handleChange}
          type={numericFields.includes(key) ? "number" : "text"}
          size="small"
          fullWidth
        />
      ))}

      <Button variant="contained" onClick={analyzeThreat}>
        Analyze
      </Button>
    </Stack>
  );
}