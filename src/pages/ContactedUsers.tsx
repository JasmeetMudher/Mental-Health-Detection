import React, { useEffect, useState } from 'react';
// ...existing code...
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ContactedUser {
  id: string;
  reddit_username: string;
  contacted_at: string;
  doctor_id: string;
  doctor_name?: string;
  notes: string;
}

const ContactedUsers: React.FC = () => {
  const [users, setUsers] = useState<ContactedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [doctorDisplayNames, setDoctorDisplayNames] = useState<Record<string, string>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [editDoctorName, setEditDoctorName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      // Fetch contacted users
      const { data, error } = await supabase
        .from('contacted_users')
        .select('*')
        .order('contacted_at', { ascending: false });
      if (!error && data) {
        setUsers(data as any);
        // Get all unique doctor_ids
        const doctorIds = Array.from(new Set(data.map((u: any) => u.doctor_id)));
        // Fetch display names from API route
        try {
          const response = await fetch('/api/getDoctorDisplayNames', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ doctorIds }),
          });
          const displayNameMap = await response.json();
          setDoctorDisplayNames(displayNameMap);
        } catch (err) {
          // fallback: just show UID
          const fallbackMap: Record<string, string> = {};
          doctorIds.forEach(id => { fallbackMap[id] = id; });
          setDoctorDisplayNames(fallbackMap);
        }
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const addUser = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const doctor_id = userData?.user?.id || '';
    const doctor_name = userData?.user?.user_metadata?.full_name || userData?.user?.email || '';
    // @ts-ignore: contacted_users is not in generated types
    const { error } = await supabase
      .from('contacted_users')
      .insert([
        {
          reddit_username: newUsername,
          doctor_id,
          doctor_name,
          notes: newNotes,
        },
      ]);
    if (!error) {
      setNewUsername('');
      setNewNotes('');
      setLoading(true);
      // @ts-ignore: contacted_users is not in generated types
      const { data } = await supabase
        .from('contacted_users')
        .select('*')
        .order('contacted_at', { ascending: false });
      setUsers((data as any) || []);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <div className="flex-1 container mx-auto py-12">
        <h2 className="text-3xl font-bold mb-6 text-primary">Contacted Users</h2>
        <div className="mb-8 flex gap-4 items-end">
          <Input
            value={newUsername}
            onChange={e => setNewUsername(e.target.value)}
            placeholder="Reddit Username"
            className="w-64"
          />
          <Input
            value={newNotes}
            onChange={e => setNewNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="w-64"
          />
          <Button onClick={addUser} disabled={!newUsername}>Add Contacted User</Button>
        </div>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <table className="w-full border rounded shadow bg-white">
            <thead>
              <tr className="bg-primary/10">
                <th className="p-2 text-left">Reddit Username</th>
                <th className="p-2 text-left">Contacted At</th>
                <th className="p-2 text-left">Doctor</th>
                <th className="p-2 text-left">Notes</th>
                <th className="p-2 text-left">Delete</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t">
                  <td className="p-2 font-mono">{user.reddit_username}</td>
                  <td className="p-2">{new Date(user.contacted_at).toLocaleString()}</td>
                  <td className="p-2 text-xs">
                    {editId === user.id ? (
                      <input
                        className="border rounded px-2 py-1 w-32"
                        value={editDoctorName}
                        onChange={e => setEditDoctorName(e.target.value)}
                      />
                    ) : (
                      user.doctor_name || user.doctor_id
                    )}
                  </td>
                  <td className="p-2">
                    {editId === user.id ? (
                      <input
                        className="border rounded px-2 py-1 w-32"
                        value={editNotes}
                        onChange={e => setEditNotes(e.target.value)}
                      />
                    ) : (
                      user.notes
                    )}
                  </td>
                  <td className="p-2 flex gap-2">
                    {editId === user.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={async () => {
                            setEditError(null);
                            const { error } = await supabase
                              .from('contacted_users')
                              .update({ doctor_name: editDoctorName, notes: editNotes })
                              .eq('id', user.id);
                            if (!error) {
                              setUsers(users.map(u =>
                                u.id === user.id
                                  ? { ...u, doctor_name: editDoctorName, notes: editNotes }
                                  : u
                              ));
                              setEditId(null);
                            } else {
                              setEditError(error.message || 'Update failed');
                            }
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => { setEditId(null); setEditError(null); }}
                        >
                          Cancel
                        </Button>
                        {editError && (
                          <span className="text-red-500 text-xs ml-2">{editError}</span>
                        )}
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditId(user.id);
                            setEditDoctorName(user.doctor_name || '');
                            setEditNotes(user.notes || '');
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            const { error } = await supabase
                              .from('contacted_users')
                              .delete()
                              .eq('id', user.id);
                            if (!error) {
                              setUsers(users.filter(u => u.id !== user.id));
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ContactedUsers;
