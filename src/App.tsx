import { useState, useMemo } from 'react'; // useState ve useMemo import et
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import Dashboard from './pages/Dashboard';
import { ThemeProvider, createTheme } from '@mui/material/styles'; // ThemeProvider ve createTheme import et
import CssBaseline from '@mui/material/CssBaseline'; // CssBaseline import et
import { Box, Button } from '@mui/material'; // Box ve Button import et
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Dark mode icon
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Light mode icon


function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('dark'); // Tema state'i

  // Tema objesini oluştur
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'light' ? '#1976d2' : '#90caf9',
          },
          secondary: {
            main: mode === 'light' ? '#c2185b' : '#f48fb1',
          },
          background: {
            default: mode === 'light' ? '#ffffff' : '#121212',
            paper: mode === 'light' ? '#f5f5f5' : '#1e1e1e',
          },
          text: {
            primary: mode === 'light' ? '#000000' : '#ffffff',
            secondary: mode === 'light' ? '#555555' : '#aaaaaa',
          },
        },
        typography: {
          fontSize: 14,
          h1: { fontSize: '2.5rem', fontWeight: 500 },
          h2: { fontSize: '2rem', fontWeight: 500 },
          h3: { fontSize: '1.75rem', fontWeight: 500 },
          h4: { fontSize: '1.5rem', fontWeight: 500 },
          h5: { fontSize: '1.25rem', fontWeight: 500 },
          h6: { fontSize: '1rem', fontWeight: 500 },
        },
      }),
    [mode],
  );

  // Tema değiştirme fonksiyonu
  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}> {/* Tema sağlayıcısı */}
      <CssBaseline /> {/* CSS sıfırlama */}
      <Box
        sx={{
          bgcolor: 'background.default',
          color: 'text.primary',
          minHeight: '100vh', // Sayfanın tamamını kapla
        }}
      >
        {/* Tema değiştirme butonu */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Button onClick={toggleColorMode} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </Box>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Box>
    </ThemeProvider>
  );
}

export default App;
