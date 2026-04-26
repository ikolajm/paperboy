import { NextResponse } from 'next/server';
import { getDeepDive } from '@/lib/digest';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ date: string; id: string }> }
) {
  const { date, id } = await params;
  const deepDive = await getDeepDive(date, id);

  if (!deepDive) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(deepDive);
}
