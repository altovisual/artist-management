
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// Asumimos que Auco envía un evento con esta estructura.
// Esto debería ser ajustado según la documentación real de Auco.
interface AucoWebhookPayload {
  event: string;
  data: {
    verification_id: string;
    status: 'verified' | 'pending' | 'rejected';
    // ... otros campos que Auco pueda enviar
  };
}

export async function POST(req: NextRequest) {
  console.log('Webhook de Auco recibido.');

  try {
    const signature = req.headers.get('X-Auco-Signature');
    const secret = process.env.AUCO_WEBHOOK_SECRET;

    if (!secret) {
      console.error('El secreto del webhook de Auco no está configurado.');
      return NextResponse.json({ error: 'Configuración de servidor incorrecta.' }, { status: 500 });
    }

    const rawBody = await req.text();

    // Verificar la firma del webhook
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(rawBody);
    const expectedSignature = hmac.digest('hex');

    if (signature !== expectedSignature) {
      console.warn('Firma de webhook inválida.');
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    console.log('Firma de webhook verificada.');

    const payload = JSON.parse(rawBody) as AucoWebhookPayload;

    // Lógica para procesar el evento
    const { verification_id, status } = payload.data;

    if (!verification_id || !status) {
        console.error('Payload del webhook incompleto.');
        return NextResponse.json({ error: 'Payload incompleto.' }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('participants')
      .update({ verification_status: status })
      .eq('auco_verification_id', verification_id);

    if (error) {
      console.error('Error al actualizar el participante:', error);
      return NextResponse.json({ error: 'Error en la base de datos.' }, { status: 500 });
    }

    console.log(`Participante ${verification_id} actualizado al estado: ${status}`);
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error al procesar el webhook de Auco:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
