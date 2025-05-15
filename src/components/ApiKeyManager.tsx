import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Supabase istemcisini import et
import type { Session } from '@supabase/supabase-js'; // Session tipini import et

const ApiKeyManager: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [maskedApiKey, setMaskedApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Kullanıcının API anahtarını çekme
  useEffect(() => {
    if (session) {
      const fetchApiKey = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_api_keys')
          .select('api_key')
          .eq('user_id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116: Satır bulunamadı hatası
          console.error('API anahtarı çekilirken hata oluştu:', error);
        } else if (data) {
          setApiKey(data.api_key);
          setMaskedApiKey(maskApiKey(data.api_key));
        }
        setLoading(false);
      };
      fetchApiKey();
    } else {
      setApiKey('');
      setMaskedApiKey('');
      setLoading(false);
    }
  }, [session]);

  // API anahtarını maskeleme fonksiyonu
  const maskApiKey = (key: string): string => {
    if (!key) return '';
    // İlk 6 ve son 4 karakteri göster, arasını maskele
    return key.substring(0, 6) + '...' + key.substring(key.length - 4);
  };

  // API anahtarını kaydetme/güncelleme
  const handleSaveApiKey = async () => {
    if (!session) return;
    setLoading(true);
    // Önce mevcut anahtar var mı kontrol et
    const { data: existingKey, error: fetchError } = await supabase
      .from('user_api_keys')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Mevcut API anahtarı kontrol edilirken hata oluştu:', fetchError);
      setLoading(false);
      return;
    }

    if (existingKey) {
      // Mevcut anahtar varsa güncelle
      const { error } = await supabase
        .from('user_api_keys')
        .update({ api_key: apiKey })
        .eq('user_id', session.user.id);

      if (error) {
        console.error('API anahtarı güncellenirken hata oluştu:', error);
      } else {
        console.log('API anahtarı başarıyla güncellendi.');
        setMaskedApiKey(maskApiKey(apiKey));
      }
    } else {
      // Mevcut anahtar yoksa ekle
      const { error } = await supabase
        .from('user_api_keys')
        .insert({ user_id: session.user.id, api_key: apiKey });

      if (error) {
        console.error('API anahtarı eklenirken hata oluştu:', error);
      } else {
        console.log('API anahtarı başarıyla eklendi.');
        setMaskedApiKey(maskApiKey(apiKey));
      }
    }
    setLoading(false);
  };

  // API anahtarını silme
  const handleDeleteApiKey = async () => {
    if (!session) return;
    setLoading(true);
    const { error } = await supabase
      .from('user_api_keys')
      .delete()
      .eq('user_id', session.user.id);

    if (error) {
      console.error('API anahtarı silinirken hata oluştu:', error);
    } else {
      console.log('API anahtarı başarıyla silindi.');
      setApiKey('');
      setMaskedApiKey('');
    }
    setLoading(false);
  };

  if (loading) {
    return <p>Yükleniyor...</p>;
  }

  if (!session) {
    return <p>API anahtarınızı yönetmek için giriş yapmalısınız.</p>;
  }

  return (
    <div>
      <h3>API Anahtarınız</h3>
      <input
        type="text"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="API Anahtarınızı Girin"
        style={{ marginRight: '10px', padding: '8px' }}
      />
      <button onClick={handleSaveApiKey}>Kaydet/Güncelle</button>
      {maskedApiKey && (
        <div style={{ marginTop: '10px' }}>
          <p>Mevcut Anahtar: {maskedApiKey}</p>
          <button onClick={handleDeleteApiKey}>Sil</button>
        </div>
      )}
    </div>
  );
};

export default ApiKeyManager;