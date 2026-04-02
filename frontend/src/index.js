import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter } from 'react-router-dom'; // ✅ ADD THIS
import App from './App';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1565c0' },
    secondary: { main: '#00838f' },
    background: { default: '#f4f7fb' }
  },
  shape: {
    borderRadius: 10
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>   {/* ✅ WRAP APP */}
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);