import { createClient } from '@supabase/supabase-js';

// Dán trực tiếp URL của bạn vào trong dấu nháy ''
const supabaseUrl = 'https://naxqiycyohltyvhxbrig.supabase.co'; 

// Dán trực tiếp cái Key dài ngoằng (bắt đầu bằng eyJ...) vào đây
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5heHFpeWN5b2hsdHl2aHhicmlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3ODkyNDMsImV4cCI6MjA4MzM2NTI0M30.-lbEgPfy4aeRLxGE2lzypGiguqKQ89cltHTc44xgi0w';

export const supabase = createClient(supabaseUrl, supabaseKey);