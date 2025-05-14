import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, TextField, Button, Box, Alert } from '@mui/material'; // Material UI bileşenlerini import et

const UpdatePassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage('Şifreniz başarıyla güncellendi. Şimdi giriş yapabilirsiniz.');
      // Opsiyonel: Başarılı şifre güncelleme sonrası login sayfasına yönlendirme
      // setTimeout(() => {
      //   navigate('/login');
      // }, 3000);
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
          Şifreyi Güncelle
        </Typography>
        <Box component="form" onSubmit={handleUpdatePassword} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Yeni Şifre"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
          </Button>
          {message && (
            <Box sx={{ mt: 2 }}>
              <Button onClick={() => navigate('/login')} variant="text"> {/* variant="body2" yerine variant="text" kullanıldı */}
                Giriş sayfasına gitmek için buraya tıklayın.
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default UpdatePassword;