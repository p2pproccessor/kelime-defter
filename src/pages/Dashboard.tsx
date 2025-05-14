import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import AddWordForm from '../components/AddWordForm';
import { Container, Typography, Button, Box, CircularProgress, List, ListItem, ListItemText, IconButton } from '@mui/material'; // Material UI bileşenlerini import et
import DeleteIcon from '@mui/icons-material/Delete';

interface Word {
  id: string;
  user_id: string;
  original_word: string;
  translated_word: string;
  explanation?: string; // Açıklama alanı eklendi
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0); // Sayfa numarası (0-tabanlı)
  const [rowsPerPage] = useState(10); // Sayfa başına kelime sayısı
  const [totalWords, setTotalWords] = useState(0); // Toplam kelime sayısı
  const navigate = useNavigate();

  const fetchUserAndWords = async () => {
    const { data: { user } = { user: null } } = await supabase.auth.getUser();
    setUser(user);

    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true); // Veri çekilirken yükleniyor durumunu ayarla

    // Toplam kelime sayısını al
    const { count, error: countError } = await supabase
      .from('words')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    if (countError) {
      console.error('Error fetching word count:', countError);
      setLoading(false);
      return;
    }

    setTotalWords(count || 0);

    // Sayfalama ile kelimeleri al
    const from = page * rowsPerPage;
    const to = from + rowsPerPage - 1;

    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }) // Yeniden eskiye sıralama
      .range(from, to); // Sayfalama için range kullan

    if (error) {
      console.error('Error fetching words:', error);
    } else {
      setWords(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUserAndWords();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session?.user) {
        navigate('/login');
      } else {
        fetchUserAndWords();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, page]); // page değiştiğinde kelimeleri yeniden çek

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleDeleteWord = async (wordId: string) => {
    const { error } = await supabase
      .from('words')
      .delete()
      .eq('id', wordId);

    if (error) {
      console.error('Error deleting word:', error);
    } else {
      // Kelime silindikten sonra listeyi yeniden getir
      fetchUserAndWords();
    }
  };

  if (loading) {
    return (
      <Container component="main" maxWidth="xs" sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Hoş Geldiniz, {user.email}!
        </Typography>
        <Button variant="outlined" onClick={handleLogout} sx={{ mt: 2 }}>
          Çıkış Yap
        </Button>

        <Typography component="h2" variant="h6" sx={{ mt: 4 }}>
          Kelimelerim
        </Typography>

        {/* Yeni kelime ekleme formu */}
        <Box sx={{ mt: 4, width: '100%' }}>
          <AddWordForm userId={user.id} onWordAdded={fetchUserAndWords} />
        </Box>

        {words.length === 0 ? (
          <Typography variant="body1" sx={{ mt: 2 }}>
            Henüz kelime eklemediniz.
          </Typography>
        ) : (
          <List sx={{ width: '100%', mt: 2 }}>
            {words.map((word) => (
              <ListItem key={word.id} divider secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteWord(word.id)}>
                  <DeleteIcon />
                </IconButton>
              }>
                <ListItemText
                  primary={<strong>{word.original_word}</strong>}
                  secondary={`${word.translated_word}${word.explanation ? ' - ' + word.explanation : ''}`}
                />
              </ListItem>
            ))}
          </List>
        )}

        {/* Sayfalama Kontrolleri */}
        {totalWords > rowsPerPage && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Önceki Sayfa
            </Button>
            <Typography sx={{ mx: 2 }}>
              Sayfa {page + 1} / {Math.ceil(totalWords / rowsPerPage)}
            </Typography>
            <Button
              disabled={page >= Math.ceil(totalWords / rowsPerPage) - 1}
              onClick={() => setPage(page + 1)}
            >
              Sonraki Sayfa
            </Button>
          </Box>
        )}

      </Box>
    </Container>
  );
};

export default Dashboard;