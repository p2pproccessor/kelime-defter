import React from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate import edildi
import { Button, Box } from '@mui/material'; // Button ve Box import edildi
import ApiKeyManager from '../components/ApiKeyManager';

const Settings: React.FC = () => {
  const navigate = useNavigate(); // useNavigate hook'u kullanıldı

  return (
    <div style={{ padding: '20px' }}> {/* İçerik için padding eklendi */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> {/* Başlık ve buton için Box */}
        <h1>Ayarlar</h1>
        <Button variant="outlined" onClick={() => navigate('/dashboard')}> {/* Dashboard'a dön butonu */}
          Dashboard'a Dön
        </Button>
      </Box>
      <p>Burada kullanıcı ayarları yer alacak.</p>

      {/* API Anahtarı Yönetimi Bölümü Buraya Gelecek */}
      <div>
        <h2>API Anahtarı Yönetimi</h2>
        <p>API anahtarınızı buradan yönetin.</p>
        <ApiKeyManager />
      </div>
    </div>
  );
};

export default Settings;