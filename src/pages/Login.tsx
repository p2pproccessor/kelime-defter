import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Container, Typography, TextField, Button, Box, Alert } from '@mui/material'; // Material UI bileşenlerini import et

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    console.log('handleLogin tetiklendi');
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log('Supabase signInWithPassword çağrılıyor...');
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('Supabase signInWithPassword çağrısı tamamlandı.');

    if (loginError) {
      console.error('Giriş Hatası:', loginError);
      setError(loginError.message);
    } else {
      console.log('Giriş Başarılı!');
      navigate('/dashboard');
    }

    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Giriş Yap
        </Typography>
        <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="E-posta Adresi"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Şifre"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Yükleniyor...' : 'Giriş Yap'}
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Link to="/register"> {/* variant="body2" kaldırıldı */}
              <Typography variant="body2"> {/* Typography içine alındı */}
                Hesabınız yok mu? Kayıt Ol
              </Typography>
            </Link>
            <Link to="/forgot-password"> {/* variant="body2" kaldırıldı */}
              <Typography variant="body2"> {/* Typography içine alındı */}
                Şifrenizi mi unuttunuz? Şifremi Sıfırla
              </Typography>
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;