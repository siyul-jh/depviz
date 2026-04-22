import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const querySchema = z.object({ url: z.string().url() });

export async function GET(req: NextRequest) {
  const result = querySchema.safeParse({
    url: req.nextUrl.searchParams.get('url'),
  });

  if (!result.success) {
    return NextResponse.json({ error: 'url 파라미터가 필요합니다.' }, { status: 400 });
  }

  const res = await fetch(result.data.url);
  if (!res.ok) {
    return NextResponse.json(
      { error: `원격 요청 실패: ${res.status}` },
      { status: res.status },
    );
  }

  const text = await res.text();
  return new NextResponse(text, {
    headers: { 'Content-Type': 'application/json' },
  });
}
