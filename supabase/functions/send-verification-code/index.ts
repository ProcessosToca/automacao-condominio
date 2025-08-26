import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendCodeRequest {
  email: string;
  type: 'email_confirmation' | 'password_reset';
  userId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type, userId }: SendCodeRequest = await req.json();

    console.log('Sending verification code:', { email, type, userId });

    // If no userId provided, try to find user by email
    let finalUserId = userId;
    if (!finalUserId) {
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      if (userError) {
        console.error('Error finding user:', userError);
        throw new Error('Usuário não encontrado');
      }
      
      const user = userData.users.find(u => u.email === email);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      finalUserId = user.id;
    }

    // Generate verification code using database function
    const { data: code, error: codeError } = await supabase
      .rpc('create_verification_code', {
        p_user_id: finalUserId,
        p_email: email,
        p_type: type
      });

    if (codeError || !code) {
      console.error('Error creating verification code:', codeError);
      throw new Error('Erro ao gerar código de verificação');
    }

    console.log('Generated code:', code);

    // Prepare email content
    const subject = type === 'email_confirmation' ? 
      'Confirme sua conta' : 
      'Redefinir senha';
    
    const html = type === 'email_confirmation' ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Confirme sua conta</h1>
        <p>Olá!</p>
        <p>Use o código abaixo para confirmar sua conta:</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h2 style="color: #2563eb; font-size: 32px; letter-spacing: 8px; margin: 0;">${code}</h2>
        </div>
        <p>Este código expira em 10 minutos.</p>
        <p>Se você não solicitou esta confirmação, pode ignorar este email.</p>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Redefinir senha</h1>
        <p>Olá!</p>
        <p>Use o código abaixo para redefinir sua senha:</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h2 style="color: #dc2626; font-size: 32px; letter-spacing: 8px; margin: 0;">${code}</h2>
        </div>
        <p>Este código expira em 10 minutos.</p>
        <p>Se você não solicitou esta redefinição de senha, pode ignorar este email.</p>
      </div>
    `;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Sistema <onboarding@resend.dev>",
      to: [email],
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Código enviado com sucesso',
      codeId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-verification-code function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);