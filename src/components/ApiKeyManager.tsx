import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

interface ApiKey {
  id: string;
  user_id: string;
  api_key: string;
  is_active: boolean;
  created_at: string;
}

const ApiKeyManager: React.FC = () => {
  const [newApiKey, setNewApiKey] = useState('');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  useEffect(() => {
    if (session) {
      fetchApiKeys();
    } else {
      setApiKeys([]);
      setLoading(false);
    }
  }, [session]);

  const fetchApiKeys = async () => {
    if (!session) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('user_api_keys')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('API anahtarları çekilirken hata oluştu:', error);
      setError('API anahtarları yüklenirken bir hata oluştu.');
      setApiKeys([]);
    } else {
      setApiKeys(data || []);
      setError(null);
    }
    setLoading(false);
  };

  const maskApiKey = (key: string): string => {
    if (!key) return '';
    return key.substring(0, 6) + '...' + key.substring(key.length - 4);
  };

  const handleAddApiKey = async () => {
    if (!session || !newApiKey.trim()) {
      setError('Lütfen geçerli bir API anahtarı girin.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Yeni eklenen anahtarı otomatik olarak aktif yap
    // Mevcut aktif anahtarı pasif yap
    const { error: updateError } = await supabase
      .from('user_api_keys')
      .update({ is_active: false })
      .eq('user_id', session.user.id)
      .eq('is_active', true);

    if (updateError) {
      console.error('Mevcut aktif anahtar güncellenirken hata oluştu:', updateError);
      setError('Mevcut aktif anahtar güncellenirken bir hata oluştu.');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('user_api_keys')
      .insert([{ user_id: session.user.id, api_key: newApiKey.trim(), is_active: true }])
      .select('*') // Eklenen kaydı geri döndür
      .single();

    if (insertError) {
      console.error('API anahtarı eklenirken hata oluştu:', insertError);
      setError(`API anahtarı eklenirken bir hata oluştu: ${insertError.message}`);
    } else {
      setNewApiKey('');
      setSuccess('API anahtarı başarıyla eklendi ve aktif yapıldı.');
      fetchApiKeys(); // Listeyi güncelle
    }
    setLoading(false);
  };

  const handleDeleteApiKey = async (apiKeyId: string) => {
    if (!session) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase
      .from('user_api_keys')
      .delete()
      .eq('id', apiKeyId)
      .eq('user_id', session.user.id); // Güvenlik için user_id kontrolü

    if (error) {
      console.error('API anahtarı silinirken hata oluştu:', error);
      setError('API anahtarı silinirken bir hata oluştu.');
    } else {
      setSuccess('API anahtarı başarıyla silindi.');
      fetchApiKeys(); // Listeyi güncelle
    }
    setLoading(false);
  };

  const handleSetActiveKey = async (apiKeyId: string) => {
    if (!session) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Mevcut aktif anahtarı pasif yap
    const { error: deactivateError } = await supabase
      .from('user_api_keys')
      .update({ is_active: false })
      .eq('user_id', session.user.id)
      .eq('is_active', true);

    if (deactivateError) {
      console.error('Mevcut aktif anahtar pasifleştirilirken hata oluştu:', deactivateError);
      setError('Aktif anahtar güncellenirken bir hata oluştu.');
      setLoading(false);
      return;
    }

    // Seçilen anahtarı aktif yap
    const { error: activateError } = await supabase
      .from('user_api_keys')
      .update({ is_active: true })
      .eq('id', apiKeyId)
      .eq('user_id', session.user.id); // Güvenlik için user_id kontrolü

    if (activateError) {
      console.error('Yeni anahtar aktif yapılırken hata oluştu:', activateError);
      setError('Yeni anahtar aktif yapılırken bir hata oluştu.');
    } else {
      setSuccess('Aktif API anahtarı başarıyla değiştirildi.');
      fetchApiKeys(); // Listeyi güncelle
    }
    setLoading(false);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!session) {
    return <Typography>API anahtarlarınızı yönetmek için giriş yapmalısınız.</Typography>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6">API Anahtarlarınız</Typography>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <TextField
          label="Yeni API Anahtarı"
          variant="outlined"
          value={newApiKey}
          onChange={(e) => setNewApiKey(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={handleAddApiKey} disabled={loading}>
          Ekle
        </Button>
      </Box>

      <List sx={{ mt: 4 }}>
        {apiKeys.length === 0 ? (
          <Typography>Henüz API anahtarı eklemediniz.</Typography>
        ) : (
          apiKeys.map((key) => (
            <React.Fragment key={key.id}>
              <ListItem
                secondaryAction={
                  <Box>
                    {!key.is_active && (
                      <IconButton edge="end" aria-label="set active" onClick={() => handleSetActiveKey(key.id)} disabled={loading}>
                        <RadioButtonUncheckedIcon /> {/* Aktif değilse boş daire */}
                      </IconButton>
                    )}
                    {key.is_active && (
                       <IconButton edge="end" aria-label="active" color="success" disabled>
                         <CheckCircleIcon /> {/* Aktifse dolu daire */}
                       </IconButton>
                    )}
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteApiKey(key.id)} disabled={loading}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={<Typography>{maskApiKey(key.api_key)}</Typography>}
                  secondary={key.is_active ? 'Aktif' : 'Pasif'}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))
        )}
      </List>
    </Box>
  );
};

export default ApiKeyManager;