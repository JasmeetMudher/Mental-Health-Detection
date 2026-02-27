import { createClient } from '@supabase/supabase-js';

// Use environment variables for security
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { doctorIds } = req.body;
  if (!Array.isArray(doctorIds)) {
    return res.status(400).json({ error: 'doctorIds must be an array' });
  }
  const result = {};
  for (const id of doctorIds) {
    const { data, error } = await supabase.auth.admin.getUserById(id);
    if (data?.user) {
      result[id] = data.user.user_metadata?.full_name || data.user.email || id;
    } else {
      result[id] = id;
    }
  }
  return res.status(200).json(result);
}
