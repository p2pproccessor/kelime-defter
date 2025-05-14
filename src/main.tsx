import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles'; // Tema sağlayıcısını import et
import CssBaseline from '@mui/material/CssBaseline'; // CSS sıfırlama için

// Temel dark tema oluştur
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9', // Açık mavi
    },
    secondary: {
      main: '#f48fb1', // Açık pembe
    },
    background: {
      default: '#121212', // Koyu gri arka plan
      paper: '#1e1e1e', // Daha açık koyu gri
    },
    text: {
      primary: '#ffffff', // Beyaz metin
      secondary: '#aaaaaa', // Açık gri metin
    },
  },
  typography: {
    // Okunurluğu artırmak için font ayarları
    fontSize: 14,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
});

// Temel light tema oluştur (şimdilik dark temanın tersi gibi)
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Koyu mavi
    },
    secondary: {
      main: '#c2185b', // Koyu pembe
    },
    background: {
      default: '#ffffff', // Beyaz arka plan
      paper: '#f5f5f5', // Açık gri
    },
    text: {
      primary: '#000000', // Siyah metin
      secondary: '#555555', // Koyu gri metin
    },
  },
  typography: {
    // Okunurluğu artırmak için font ayarları
    fontSize: 14,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
});


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {/* Tema sağlayıcısı ile uygulamayı sarmala */}
      {/* Başlangıçta dark tema kullanıyoruz, tema değiştirme özelliği App.tsx'e eklenecek */}
      <ThemeProvider theme={darkTheme}>
        {/* CSS sıfırlama bileşeni */}
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
