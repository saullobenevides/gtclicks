import { NextResponse } from 'next/server';
import { createCollection } from '@/lib/rekognition';

export async function POST() {
  try {
    const result = await createCollection();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
