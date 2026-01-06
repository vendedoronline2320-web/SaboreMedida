import { supabase } from './supabase';
import { User, Recipe, VideoLesson, UserProfile, Activity, Notification, ChatMessage, ChatSession } from '../types';

class DatabaseService {
  // --- Auth & User ---

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      let { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('DatabaseService.getCurrentUser error:', fetchError);
        throw new Error(`[DB] Erro ao buscar perfil: ${fetchError.message}`);
      }

      if (!profile) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || 'Usuário',
            is_admin: session.user.email === 'admin@saboremedida.com' || session.user.email === 'vendedoronline2520@gmail.com'
          }])
          .select()
          .maybeSingle();

        if (createError) throw new Error(`[DB] Erro ao criar perfil: ${createError.message}`);
        profile = newProfile;
      }

      if (!profile) throw new Error('[DB] Perfil não encontrado.');

      const trialExpiresAt = profile.trial_expires_at ? new Date(profile.trial_expires_at).getTime() : null;
      const isAdmin = profile.is_admin || profile.email === 'admin@saboremedida.com' || profile.email === 'vendedoronline2520@gmail.com';
      let plan = profile.plan || 'free_trial';
      if (isAdmin) plan = 'premium';

      const { data: favs } = await supabase.from('favorites').select('item_id').eq('user_id', session.user.id);
      const { data: notifications } = await supabase.from('notifications').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
      const { data: activities } = await supabase.from('user_activities').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(20);

      return {
        id: session.user.id,
        profile: {
          name: profile.name || 'Usuário',
          email: profile.email,
          plan: plan,
          trialExpiresAt: trialExpiresAt,
          isAdmin: isAdmin,
          avatar: profile.avatar_url || '',
          goal: profile.goal || 'saude',
          weight: profile.weight?.toString() || '',
          lastLogin: profile.last_login ? new Date(profile.last_login).getTime() : Date.now(),
          darkMode: !!profile.dark_mode,
          streak: profile.streak || 0,
          lastStreakUpdate: profile.last_streak_update ? new Date(profile.last_streak_update).getTime() : 0
        },
        favorites: (favs || []).map(f => f.item_id),
        history: (activities || []).map(a => ({
          id: a.id,
          type: a.type as any,
          contentId: a.item_id || '',
          timestamp: new Date(a.created_at).getTime(),
          title: a.title
        })),
        notifications: (notifications || []).map(n => ({
          id: n.id,
          type: n.type as any,
          title: n.title,
          message: n.content,
          time: new Date(n.created_at).getTime(),
          read: n.is_read,
          senderId: n.sender_id,
          recipientId: n.user_id,
          link: n.payload?.link
        }))
      };
    } catch (err: any) {
      console.error('DatabaseService.getCurrentUser error:', err);
      return null;
    }
  }

  async login(email: string, password?: string): Promise<User> {
    const { error } = await supabase.auth.signInWithPassword({ email, password: password || '123456' });
    if (error) throw error;
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Perfil não encontrado.');
    await this.recordActivity(user.id, 'login', 'Realizou login no sistema');
    return user;
  }

  async signUp(email: string, name: string, password?: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: password || '123456',
      options: { data: { name } }
    });
    if (error) throw error;
    if (!data.session) throw new Error('Cadastro realizado! Verifique seu e-mail.');
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Perfil em processamento...');
    await this.recordActivity(user.id, 'welcome', 'Seja bem-vindo ao Sabor e Medida!');
    return user;
  }

  async logout() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) await this.recordActivity(session.user.id, 'logout', 'Saiu do sistema');
    await supabase.auth.signOut();
  }

  async resetPassword(email: string) {
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
  }

  async updateProfile(profile: Partial<UserProfile>) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const update: any = {};
    if (profile.name !== undefined) update.name = profile.name;
    if (profile.goal !== undefined) update.goal = profile.goal;
    if (profile.weight !== undefined) update.weight = parseFloat(profile.weight || '0');
    if (profile.darkMode !== undefined) update.dark_mode = profile.darkMode;
    if (profile.avatar !== undefined) update.avatar_url = profile.avatar;
    await supabase.from('profiles').update(update).eq('id', session.user.id);
    await this.recordActivity(session.user.id, 'profile_update', 'Atualizou informações do perfil');
  }

  async uploadFile(file: File, bucket: 'avatars' | 'media'): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Sessão expirada');
    const fileExt = file.name.split('.').pop();
    const fileName = `${session.user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
    await this.recordActivity(session.user.id, 'upload_image', `Upload de arquivo: ${file.name}`);
    return publicUrl;
  }

  getDirectLink(url: string): string {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) return `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
    }
    return url;
  }

  // --- Content ---

  async getRecipes(): Promise<Recipe[]> {
    const { data } = await supabase.from('recipes').select('*').order('created_at', { ascending: false });
    return (data || []).map(r => ({ ...r, image: this.getDirectLink(r.image) }));
  }

  async getVideos(): Promise<VideoLesson[]> {
    const { data } = await supabase.from('video_lessons').select('*').order('created_at', { ascending: false });
    return (data || []).map(v => ({
      id: v.id, title: v.title, thumbnail: this.getDirectLink(v.thumbnail),
      duration: v.duration, description: v.description, shortDescription: v.short_description,
      category: v.category, videoUrl: this.getDirectLink(v.video_url), createdAt: new Date(v.created_at).getTime()
    }));
  }

  async saveVideo(video: VideoLesson) {
    const payload = {
      title: video.title, thumbnail: this.getDirectLink(video.thumbnail),
      duration: video.duration, description: video.description,
      short_description: video.shortDescription, category: video.category,
      video_url: this.getDirectLink(video.videoUrl)
    };
    if (video.id.length > 20) await supabase.from('video_lessons').update(payload).eq('id', video.id);
    else {
      await supabase.from('video_lessons').insert([payload]);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) await this.recordActivity(session.user.id, 'upload_video', `Publicou: ${video.title}`);
    }
  }

  async deleteVideo(id: string) { await supabase.from('video_lessons').delete().eq('id', id); }

  async saveRecipe(recipe: Recipe) {
    const payload = {
      name: recipe.name, image: this.getDirectLink(recipe.image),
      category: recipe.category, description: recipe.description,
      ingredients: recipe.ingredients, instructions: recipe.instructions, time: recipe.time
    };
    if (recipe.id.length > 20) await supabase.from('recipes').update(payload).eq('id', recipe.id);
    else await supabase.from('recipes').insert([payload]);
  }

  async deleteRecipe(id: string) { await supabase.from('recipes').delete().eq('id', id); }

  // --- Interactions ---

  async toggleFavorite(itemId: string, type: 'recipe' | 'video'): Promise<string[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];
    const { data: existing } = await supabase.from('favorites').select('*').eq('user_id', session.user.id).eq('item_id', itemId).maybeSingle();
    if (existing) await supabase.from('favorites').delete().eq('id', existing.id);
    else {
      await supabase.from('favorites').insert([{ user_id: session.user.id, item_id: itemId, type }]);
      await this.recordActivity(session.user.id, 'favorite', `Favoritou um ${type === 'video' ? 'vídeo' : 'receita'}`);
    }
    const { data: favs } = await supabase.from('favorites').select('item_id').eq('user_id', session.user.id);
    return (favs || []).map(f => f.item_id);
  }

  async addToHistory(type: 'video' | 'recipe', contentId: string, title: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await this.recordActivity(session.user.id, type === 'video' ? 'view_video' : 'view_recipe', `Visualizou: ${title}`, contentId);
      const user = await this.getCurrentUser();
      if (user) await this.checkDailyStreak(user);
    }
  }

  async recordActivity(userId: string, type: string, title: string, itemId?: string) {
    await supabase.from('user_activities').insert([{ user_id: userId, type, title, item_id: itemId }]);
  }

  // --- Support ---

  async getChatMessages(userId: string): Promise<ChatMessage[]> {
    const { data } = await supabase.from('chat_messages').select('*').eq('user_id', userId).order('created_at', { ascending: true });
    return (data || []).map(m => ({
      id: m.id, senderId: m.sender_id, text: m.text,
      timestamp: new Date(m.created_at).getTime(), isAdmin: m.is_admin, isRead: m.is_read
    }));
  }

  async sendMessage(userId: string, text: string, isAdmin: boolean) {
    const { data: { session } } = await supabase.auth.getSession();
    const senderId = isAdmin ? 'admin' : (session?.user.id || 'anonymous');
    await supabase.from('chat_messages').insert([{ user_id: userId, sender_id: senderId, text, is_admin: isAdmin, is_read: false }]);
    const recipientId = isAdmin ? userId : (await this.getAdminId());
    if (recipientId) {
      await supabase.from('notifications').insert([{
        user_id: recipientId, type: 'message', title: isAdmin ? 'Nova Mensagem do Suporte' : 'Novo Contato de Usuário',
        content: text, sender_id: senderId, payload: { link: isAdmin ? '/chat' : '/admin/support' }
      }]);
    }
  }

  private async getAdminId() {
    const { data } = await supabase.from('profiles').select('id').eq('email', 'admin@saboremedida.com').maybeSingle();
    return data?.id;
  }

  async markChatAsRead(userId: string, currentIsAdmin: boolean) {
    await supabase.from('chat_messages').update({ is_read: true }).eq('user_id', userId).eq('is_admin', !currentIsAdmin).eq('is_read', false);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) await supabase.from('notifications').update({ is_read: true }).eq('user_id', session.user.id).eq('type', 'message').eq('is_read', false);
  }

  async getAllChatSessions(): Promise<ChatSession[]> {
    const { data: messages } = await supabase.from('chat_messages').select('*, profiles(name, avatar_url)').order('created_at', { ascending: false });
    const sessions: Record<string, ChatSession> = {};
    (messages || []).forEach(m => {
      if (!sessions[m.user_id]) {
        sessions[m.user_id] = {
          userId: m.user_id, userName: (m.profiles as any)?.name || 'Usuário', userAvatar: (m.profiles as any)?.avatar_url || '',
          lastMessage: { id: m.id, senderId: m.sender_id, text: m.text, timestamp: new Date(m.created_at).getTime(), isAdmin: m.is_admin, isRead: m.is_read },
          unreadCount: 0
        };
      }
      if (!m.is_admin && !m.is_read) sessions[m.user_id].unreadCount!++;
    });
    return Object.values(sessions);
  }

  async markNotificationAsRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    return (await this.getCurrentUser())?.notifications || [];
  }

  private async checkDailyStreak(user: User) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    let streak = user.profile.streak || 0;
    const lastUpdate = user.profile.lastStreakUpdate ? new Date(user.profile.lastStreakUpdate).getTime() : 0;
    const diffDays = Math.floor((today - new Date(lastUpdate).setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) streak += 1;
    else if (diffDays > 1) streak = 1;
    else if (diffDays === 0 && lastUpdate !== 0) return;
    else streak = 1;
    await supabase.from('profiles').update({ streak, last_streak_update: now.toISOString() }).eq('id', session.user.id);
  }

  async changePassword(newPass: string): Promise<boolean> {
    const { error } = await supabase.auth.updateUser({ password: newPass });
    return !error;
  }

  async getDailyMessageCount(): Promise<number> {
    const { count } = await supabase.from('chat_messages').select('*', { count: 'exact', head: true }).eq('is_admin', false).eq('is_read', false);
    return count || 0;
  }

  async checkPlanAccess(feature: string, user: User): Promise<{ hasAccess: boolean; reason?: 'expired' | 'limit_reached' | 'plan_required' }> {
    if (user.profile.isAdmin) return { hasAccess: true };
    if (user.profile.plan === 'free_trial') return { hasAccess: (user.profile.trialExpiresAt || 0) > Date.now(), reason: 'expired' };
    if (user.profile.plan === 'premium') return { hasAccess: true };
    if (user.profile.plan === 'essential') {
      if (feature === 'limited_videos') return (await this.getVideoViewsCount(user.id)) < 5 ? { hasAccess: true } : { hasAccess: false, reason: 'limit_reached' };
      return { hasAccess: ['recipes', 'basic_support', 'limited_videos'].includes(feature), reason: 'plan_required' };
    }
    return { hasAccess: false, reason: 'plan_required' };
  }

  async getVideoViewsCount(userId: string): Promise<number> {
    const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
    const { count } = await supabase.from('video_views').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('viewed_at', startOfMonth.toISOString());
    return count || 0;
  }

  async recordVideoView(userId: string, videoId: string) {
    await supabase.from('video_views').insert([{ user_id: userId, video_id: videoId }]);
  }
}

export const db = new DatabaseService();
