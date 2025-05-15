import React from 'react';
import ApiKeyManager from '../components/ApiKeyManager';

const Settings: React.FC = () => {
  return (
    <div>
      <h1>Ayarlar</h1>
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