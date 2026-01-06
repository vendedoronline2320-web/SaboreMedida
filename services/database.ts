import { supabase } from './supabase';
import { User, Recipe, VideoLesson, UserProfile, Activity, Notification, ChatMessage, ChatSession } from '../types';

class DatabaseService {
  // --- Auth & User ---

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      // Try to get profile
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
        // Create profile if missing
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

        if (createError) {
          console.error('DatabaseService.getCurrentUser fallback error:', createError);
          throw new Error(`[DB] Erro ao criar perfil: ${createError.message}`);
        }
        profile = newProfile;
      }

      if (!profile) throw new Error('[DB] Perfil não encontrado após tentativa de criação.');

      // Check if trial is expired
      const trialExpiresAt = profile.trial_expires_at ? new Date(profile.trial_expires_at).getTime() : null;
      const isAdmin = profile.is_admin || profile.email === 'admin@saboremedida.com' || profile.email === 'vendedoronline2520@gmail.com';
      let plan = profile.plan || 'free_trial';

      // Force premium for admins
      if (isAdmin) plan = 'premium';

      const isExpired = plan === 'free_trial' && trialExpiresAt && Date.now() > trialExpiresAt;

      // Fetch favorites
      const { data: favs } = await supabase
        .from('favorites')
        .select('item_id')
        .eq('user_id', session.user.id);

      // Fetch notifications
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

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
        history: [],
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
      console.error('DatabaseService.getCurrentUser catch-all:', err);
      throw err;
    }
  }

  async login(email: string, password?: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password || '123456'
    });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Por favor, confirme seu e-mail antes de entrar.');
      }
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('E-mail ou senha incorretos.');
      }
      throw error;
    }

    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('Conectado, mas o perfil não respondeu.');
      return user;
    } catch (profileErr: any) {
      throw new Error(`Conectado, mas erro no banco de dados: ${profileErr.message}`);
    }
  }

  async signUp(email: string, name: string, password?: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: password || '123456',
      options: {
        data: { name }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error('Erro ao criar usuário no Auth');

    if (!data.session) {
      throw new Error('Cadastro realizado com sucesso! Verifique seu e-mail para ativar sua conta.');
    }

    const user = await this.getCurrentUser();
    if (!user) throw new Error('Perfil sendo processado... Tente entrar em instantes.');
    return user;
  }

  async logout() {
    await supabase.auth.signOut();
  }

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
  }

  async updateProfile(profile: Partial<UserProfile>) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const update: any = {};
    if (profile.name !== undefined) update.name = profile.name;
    if (profile.goal !== undefined) update.goal = profile.goal;
    if (profile.weight !== undefined) update.weight = parseFloat(profile.weight);
    if (profile.darkMode !== undefined) update.dark_mode = profile.darkMode;

    await supabase
      .from('profiles')
      .update(update)
      .eq('id', session.user.id);
  }

  // --- Content ---

  async getRecipes(): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return [];
    return data.map(r => ({
      id: r.id,
      name: r.name,
      image: r.image,
      category: r.category,
      description: r.description,
      ingredients: r.ingredients,
      instructions: r.instructions,
      time: r.time
    }));
  }

  async getVideos(): Promise<VideoLesson[]> {
    const { data, error } = await supabase
      .from('video_lessons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return [];
    return data.map(v => ({
      id: v.id,
      title: v.title,
      thumbnail: v.thumbnail,
      duration: v.duration,
      description: v.description,
      shortDescription: v.short_description,
      category: v.category,
      videoUrl: v.video_url,
      createdAt: new Date(v.created_at).getTime()
    }));
  }

  async saveVideo(video: VideoLesson) {
    const payload = {
      title: video.title,
      thumbnail: video.thumbnail,
      duration: video.duration,
      description: video.description,
      short_description: video.shortDescription,
      category: video.category,
      video_url: video.videoUrl
    };

    if (video.id.length > 20) { // UUID
      await supabase.from('video_lessons').update(payload).eq('id', video.id);
    } else {
      await supabase.from('video_lessons').insert([payload]);
    }
  }

  async deleteVideo(id: string) {
    await supabase.from('video_lessons').delete().eq('id', id);
  }

  async saveRecipe(recipe: Recipe) {
    const payload = {
      name: recipe.name,
      image: recipe.image,
      category: recipe.category,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      time: recipe.time
    };

    if (recipe.id.length > 20) { // UUID
      await supabase.from('recipes').update(payload).eq('id', recipe.id);
    } else {
      await supabase.from('recipes').insert([payload]);
    }
  }

  async deleteRecipe(id: string) {
    await supabase.from('recipes').delete().eq('id', id);
  }

  // --- Interactions ---

  async toggleFavorite(itemId: string, type: 'recipe' | 'video'): Promise<string[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const { data: existing } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('item_id', itemId)
      .single();

    if (existing) {
      await supabase.from('favorites').delete().eq('user_id', session.user.id).eq('item_id', itemId);
    } else {
      await supabase.from('favorites').insert([{ user_id: session.user.id, item_id: itemId, type }]);
    }

    const { data: favs } = await supabase
      .from('favorites')
      .select('item_id')
      .eq('user_id', session.user.id);

    return (favs || []).map(f => f.item_id);
  }

  // --- Support ---

  async getChatMessages(userId: string): Promise<ChatMessage[]> {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    return (data || []).map(m => ({
      id: m.id,
      senderId: m.sender_id,
      text: m.text,
      timestamp: new Date(m.created_at).getTime(),
      isAdmin: m.is_admin,
      isRead: m.is_read
    }));
  }

  async sendMessage(userId: string, text: string, isAdmin: boolean) {
    const { data: { session } } = await supabase.auth.getSession();
    const senderId = isAdmin ? 'admin' : (session?.user.id || 'anonymous');

    await supabase.from('chat_messages').insert([{
      user_id: userId,
      sender_id: senderId,
      text,
      is_admin: isAdmin,
      is_read: false
    }]);

    // Create Notification
    const recipientId = isAdmin ? userId : (await this.getAdminId());
    if (recipientId) {
      await supabase.from('notifications').insert([{
        user_id: recipientId,
        type: 'message',
        title: isAdmin ? 'Nova Mensagem do Suporte' : 'Novo Contato de Usuário',
        content: text,
        sender_id: senderId,
        payload: { link: isAdmin ? '/chat' : '/admin/support' }
      }]);
    }
  }

  private async getAdminId() {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'admin@saboremedida.com')
      .maybeSingle();
    return data?.id;
  }

  async markChatAsRead(userId: string, currentIsAdmin: boolean) {
    // If admin is reading, mark messages from user as read
    // If user is reading, mark messages from admin as read
    await supabase.from('chat_messages')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_admin', !currentIsAdmin)
      .eq('is_read', false);

    // Also mark notifications of type 'message' as read for the current user
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('notifications')
        .update({ is_read: true })
        .eq('user_id', session.user.id)
        .eq('type', 'message')
        .eq('is_read', false);
    }
  }

  async getAllChatSessions(): Promise<ChatSession[]> {
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('*, profiles(name, avatar_url)')
      .order('created_at', { ascending: false });

    const sessions: Record<string, ChatSession> = {};

    (messages || []).forEach(m => {
      if (!sessions[m.user_id]) {
        sessions[m.user_id] = {
          userId: m.user_id,
          userName: (m.profiles as any)?.name || 'Usuário',
          userAvatar: (m.profiles as any)?.avatar_url || '',
          lastMessage: {
            id: m.id,
            senderId: m.sender_id,
            text: m.text,
            timestamp: new Date(m.created_at).getTime(),
            isAdmin: m.is_admin,
            isRead: m.is_read
          },
          unreadCount: 0
        };
      }
      if (!m.is_admin && !m.is_read) {
        sessions[m.user_id].unreadCount!++;
      }
    });

    return Object.values(sessions);
  }

  async addToHistory(type: 'video' | 'recipe', contentId: string, title: string) {
    const user = await this.getCurrentUser();
    if (user) {
      await this.checkDailyStreak(user);
    }
  }

  async markNotificationAsRead(id: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    await supabase.from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    return (await this.getCurrentUser())?.notifications || [];
  }

  private async checkDailyStreak(user: User) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    let streak = user.profile.streak || 0;
    const lastUpdate = user.profile.lastStreakUpdate ? new Date(user.profile.lastStreakUpdate).getTime() : 0;
    const lastUpdateDay = new Date(lastUpdate);
    const lastDay = new Date(lastUpdateDay.getFullYear(), lastUpdateDay.getMonth(), lastUpdateDay.getDate()).getTime();

    const diffDays = Math.floor((today - lastDay) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak += 1;
    } else if (diffDays > 1) {
      streak = 1;
    } else if (diffDays === 0) {
      return;
    } else if (lastUpdate === 0) {
      streak = 1;
    }

    await supabase
      .from('profiles')
      .update({
        streak: streak,
        last_streak_update: now.toISOString()
      })
      .eq('id', session.user.id);
  }

  async changePassword(newPass: string): Promise<boolean> {
    const { error } = await supabase.auth.updateUser({ password: newPass });
    return !error;
  }

  async getDailyMessageCount(): Promise<number> {
    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_admin', false)
      .eq('is_read', false);

    return count || 0;
  }

  // --- Plan Logic ---

  async checkPlanAccess(feature: string, user: User): Promise<{ hasAccess: boolean; reason?: 'expired' | 'limit_reached' | 'plan_required' }> {
    const { profile } = user;

    // Admins have access to everything
    if (profile.isAdmin) return { hasAccess: true };

    // 1. Check Free Trial Expiration
    if (profile.plan === 'free_trial') {
      const isExpired = profile.trialExpiresAt && Date.now() > profile.trialExpiresAt;
      if (isExpired) return { hasAccess: false, reason: 'expired' };
      return { hasAccess: true }; // Free trial has total access until expiration
    }

    // 2. Premium has access to everything
    if (profile.plan === 'premium') return { hasAccess: true };

    // 3. Essential logic
    if (profile.plan === 'essential') {
      const allowedFeatures = ['recipes', 'basic_support', 'limited_videos'];

      if (feature === 'limited_videos') {
        const count = await this.getVideoViewsCount(user.id);
        if (count >= 5) return { hasAccess: false, reason: 'limit_reached' };
        return { hasAccess: true };
      }

      if (allowedFeatures.includes(feature)) return { hasAccess: true };

      return { hasAccess: false, reason: 'plan_required' };
    }

    return { hasAccess: false, reason: 'plan_required' };
  }

  async getVideoViewsCount(userId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('video_views')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('viewed_at', startOfMonth.toISOString());

    return count || 0;
  }

  async recordVideoView(userId: string, videoId: string) {
    await supabase
      .from('video_views')
      .insert([{ user_id: userId, video_id: videoId }]);
  }
}

export const db = new DatabaseService();
