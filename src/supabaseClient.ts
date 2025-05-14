import { createClient } from '@supabase/supabase-js';

// Supabase URL ve Anon Key'inizi buraya ekleyin
// Bu bilgileri Supabase projenizin ayarlarından alabilirsiniz.
// Güvenlik nedeniyle bu bilgileri doğrudan kodda tutmak yerine
// ortam değişkenleri aracılığıyla sağlamak daha iyidir.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);