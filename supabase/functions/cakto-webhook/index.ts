import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const payload = await req.json()
        console.log('Webhook Cakto recebido:', JSON.stringify(payload, null, 2))

        // Tenta capturar o e-mail do cliente e o status do pagamento
        // O mapeamento pode variar dependendo da configuração da Cakto, 
        // mas estes são os campos mais comuns:
        const email = payload.email || payload.customer?.email || payload.data?.customer?.email || payload.cliente_email;
        const status = payload.status || payload.event || payload.data?.status || payload.transacao_status;

        // Log do que foi extraído para debug
        console.log(`Email extraído: ${email}, Status extraído: ${status}`);

        // Lista de status que consideramos como "Aprovado"
        const approvedStatuses = ['approved', 'payment.approved', 'pago', 'paid', 'concluido', 'sucesso', '1'];
        const isApproved = status && approvedStatuses.includes(status.toString().toLowerCase());

        if (email && isApproved) {
            const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
            const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
            const supabase = createClient(supabaseUrl, supabaseServiceKey)

            console.log(`Atualizando plano para o email: ${email}`);

            // Atualiza o plano do usuário na tabela 'profiles'
            const { data, error } = await supabase
                .from('profiles')
                .update({ plan: 'premium' })
                .eq('email', email)
                .select();

            if (error) {
                console.error('Erro ao atualizar perfil no Supabase:', error);
                throw error;
            }

            if (data && data.length > 0) {
                console.log('Perfil atualizado com sucesso:', data[0]);
            } else {
                console.log('Nenhum perfil encontrado com esse e-mail para atualizar.');
            }
        } else {
            console.log('Webhook ignorado: E-mail não encontrado ou pagamento não aprovado.');
        }

        return new Response(JSON.stringify({ success: true, message: 'Webhook v1.0 processado' }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error: any) {
        console.error('Erro no processamento do Webhook:', error.message)
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
