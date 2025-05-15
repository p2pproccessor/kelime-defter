import React, { useState, useEffect } from 'react'; // useEffect import edildi
import { supabase } from '../supabaseClient';
import { TextField, Button, Box, Typography, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material'; // Material UI bileşenlerini import et
import type { Session } from '@supabase/supabase-js'; // Session tipi import edildi

interface AddWordFormProps {
  userId: string;
  onWordAdded: () => void; // Kelime eklendikten sonra dashboard'daki listeyi güncellemek için callback
}

const AddWordForm: React.FC<AddWordFormProps> = ({ userId, onWordAdded }) => {
  const [originalWord, setOriginalWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('google/gemma-3-27b-it:free'); // Varsayılan model
  const [translatedWordResult, setTranslatedWordResult] = useState<string | null>(null); // Çeviri sonucunu saklamak için state
  const [explanationResult, setExplanationResult] = useState<string | null>(null); // Açıklama sonucunu saklamak için state
  const [userApiKey, setUserApiKey] = useState<string | null>(null); // Kullanıcının API anahtarını saklamak için state
  const [session, setSession] = useState<Session | null>(null); // Oturum bilgisini saklamak için state

  // Oturum bilgisini çekme
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
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
      const fetchUserApiKey = async () => {
        const { data, error } = await supabase
          .from('user_api_keys')
          .select('api_key')
          .eq('user_id', session.user.id)
          .eq('is_active', true) // Aktif anahtarı çek
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116: Satır bulunamadı hatası
          console.error('Kullanıcı API anahtarı çekilirken hata oluştu:', error);
          setUserApiKey(null); // Hata durumunda anahtarı null yap
        } else if (data) {
          setUserApiKey(data.api_key);
        } else {
          setUserApiKey(null); // Anahtar bulunamazsa null yap
        }
      };
      fetchUserApiKey();
    } else {
      setUserApiKey(null); // Oturum yoksa anahtarı null yap
    }
  }, [session]);

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTranslatedWordResult(null); // Önceki sonuçları temizle
    setExplanationResult(null); // Önceki sonuçları temizle

    if (!originalWord.trim()) {
      setError('Lütfen bir kelime girin.');
      setLoading(false);
      return;
    }

    // Kelimenin zaten var olup olmadığını kontrol et
    const { data: existingWords, error: fetchError } = await supabase
      .from('words')
      .select('id')
      .eq('user_id', userId)
      .eq('original_word', originalWord);

    if (fetchError) {
      setError(fetchError.message);
      console.error('Error checking for existing word:', fetchError);
      setLoading(false);
      return;
    }

    if (existingWords && existingWords.length > 0) {
      setError(`"${originalWord}" kelimesi zaten eklenmiş.`);
      // Kelime zaten varsa veritabanından çekip göster
      const { data: wordData, error: fetchWordError } = await supabase
        .from('words')
        .select('translated_word, explanation')
        .eq('user_id', userId)
        .eq('original_word', originalWord)
        .single();

      if (fetchWordError) {
        console.error('Error fetching existing word details:', fetchWordError);
        setError(`Mevcut kelime detayları alınamadı: ${fetchWordError.message}`);
      } else if (wordData) {
        setTranslatedWordResult(wordData.translated_word);
        setExplanationResult(wordData.explanation || null);
      }
      setLoading(false);
      setOriginalWord(''); // Inputu temizle
      return; // API isteği yapmadan çık
    }

    let translatedWord = '';
    let explanation = '';
    try {
      // OpenRouter API üzerinden çeviri ve açıklama alma
      // Kullanılacak API anahtarını belirle: Kullanıcının anahtarı varsa onu, yoksa varsayılanı kullan
      const apiKeyToUse = userApiKey || import.meta.env.VITE_OPENROUTER_API_KEY;

      if (!apiKeyToUse) {
        throw new Error('API anahtarı bulunamadı. Lütfen ayarlar sayfasından API anahtarınızı ekleyin veya varsayılan anahtarın tanımlı olduğundan emin olun.');
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKeyToUse}`, // Belirlenen API anahtarını kullan
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel, // Seçilen modeli kullan
          messages: [
            { role: 'system', content: 'You are a helpful assistant that translates English words to Turkish and provides a short explanation, both in Turkish. Your response MUST strictly follow the format: "Translation: [translated word]\nExplanation: [explanation]". Do not include any introductory or concluding remarks, or any other text outside this specific format.' },
            { role: 'user', content: `Translate and explain "${originalWord}" in Turkish.` },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API hatası: ${response.status} ${response.statusText} - ${errorData.message || ''}`);
      }

      const data = await response.json();

      // API yanıtını kontrol et ve işle
      if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
        throw new Error('API yanıtı beklenmedik formatta veya eksik bilgi: choices, message veya content bulunamadı.');
      }

      const content = data.choices[0].message.content.trim();

      // API yanıtını ayrıştırma
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.startsWith('Translation:')) {
          translatedWord = line.substring('Translation:'.length).trim();
        } else if (line.startsWith('Explanation:')) {
          explanation = line.substring('Explanation:'.length).trim();
        }
      }

      if (!translatedWord || !explanation) {
        throw new Error('API yanıtı beklenmedik formatta veya eksik bilgi: Çeviri veya Açıklama bulunamadı.');
      }

      setTranslatedWordResult(translatedWord); // Çeviri sonucunu state'e kaydet
      setExplanationResult(explanation); // Açıklama sonucunu state'e kaydet

      // Supabase'e kelimeyi kaydetme
      const { data: insertData, error: insertError } = await supabase
        .from('words')
        .insert([
          { user_id: userId, original_word: originalWord, translated_word: translatedWord, explanation: explanation },
        ]);

      if (insertError) {
        setError(insertError.message);
        console.error('Error adding word to Supabase:', insertError);
      } else {
        console.log('Kelime başarıyla eklendi:', insertData);
        setOriginalWord(''); // Yeni kelime eklendiğinde inputu temizle
        onWordAdded(); // Kelime eklendiğinde dashboard'daki listeyi güncelle
      }

    } catch (apiError: any) {
      setError(`Çeviri veya açıklama alınamadı: ${apiError.message}`);
      console.error('OpenRouter API Error:', apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography component="h3" variant="h6">
        Yeni Kelime Ekle
      </Typography>
      <Box component="form" onSubmit={handleAddWord} noValidate sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="originalWord"
          label="Kelime"
          name="originalWord"
          autoFocus
          value={originalWord}
          onChange={(e) => setOriginalWord(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="model-select-label">Çeviri Modeli</InputLabel>
          <Select
            labelId="model-select-label"
            id="model-select"
            value={selectedModel}
            label="Çeviri Modeli"
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            <MenuItem value="deepseek/deepseek-r1-distill-llama-70b:free">deepseek/deepseek-r1-distill-llama-70b:free</MenuItem>
            <MenuItem value="google/gemma-3-27b-it:free">google/gemma-3-27b-it:free</MenuItem>
            {/* Buraya başka modeller de eklenebilir */}
          </Select>
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? 'Ekleniyor...' : 'Ekle'}
        </Button>
      </Box>
      {translatedWordResult && explanationResult && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">
            <strong>Kelime:</strong> {originalWord}
          </Typography>
          <Typography variant="body1">
            <strong>Çeviri:</strong> {translatedWordResult}
          </Typography>
          <Typography variant="body1">
            <strong>Açıklama:</strong> {explanationResult}
          </Typography>
        </Box>
      )}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  );
};

export default AddWordForm;