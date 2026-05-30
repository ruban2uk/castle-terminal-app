import { NextResponse } from 'next/server';
import { WebhookService } from '@/lib/webhook';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-webhook-signature');
    const provider = request.headers.get('x-provider') || 'unknown';
    const eventType = request.headers.get('x-event-type') || 'unknown';
    
    const body = await request.text();
    const payload = JSON.parse(body);

    const result = await WebhookService.processWebhook(
      eventType,
      provider,
      payload,
      signature || undefined,
      body
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const provider = searchParams.get('provider') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await WebhookService.getWebhookEvents({
      status: status || undefined,
      provider: provider || undefined,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Webhook fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhooks' },
      { status: 500 }
    );
  }
}
