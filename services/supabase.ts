import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ipuyifckvjgpnzzvante.supabase.co';
const supabaseAnonKey = 'sb_publishable_F2ozp2NCH5srYvDwkdLGRw_ZX5ufWpc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
