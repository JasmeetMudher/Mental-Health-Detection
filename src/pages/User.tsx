import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUpload } from '@/components/ui/file-upload';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const User: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        setUser(data.user);
  setFullName(data.user.user_metadata?.full_name || '');
  setAvatarUrl(data.user.user_metadata?.avatar_url || '');
  setPhone(data.user.user_metadata?.phone || '');
  setDob(data.user.user_metadata?.dob || '');
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <div className="p-8 text-center">No user found.</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="max-w-lg w-full mt-10 bg-gradient-to-br from-primary/10 via-white to-primary/5 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 rounded-2xl shadow-2xl p-10 flex flex-col gap-8 border border-primary/20">
          <h2 className="text-4xl font-extrabold mb-2 text-center text-primary drop-shadow">My Profile</h2>
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <img
                src={avatarUrl || '/pulse.svg'}
                alt="Avatar"
                className="w-28 h-28 rounded-full border-4 border-primary shadow-lg object-cover mb-2 group-hover:opacity-80 transition"
                onError={e => {
                  e.currentTarget.src = '/pulse.svg';
                  console.warn('Avatar image failed to load:', avatarUrl);
                }}
              />
              {editMode && (
                <div className="mt-2">
                  <FileUpload
                    onFileSelect={async (file) => {
                      setUploading(true);
                      // Compress image before upload
                      const compressImage = (file, maxWidth = 256, maxHeight = 256, quality = 0.7) => {
                        return new Promise<File>((resolve, reject) => {
                          const img = new window.Image();
                          img.onload = () => {
                            const canvas = document.createElement('canvas');
                            let width = img.width;
                            let height = img.height;
                            if (width > maxWidth) {
                              height = Math.round((maxWidth / width) * height);
                              width = maxWidth;
                            }
                            if (height > maxHeight) {
                              width = Math.round((maxHeight / height) * width);
                              height = maxHeight;
                            }
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height);
                            canvas.toBlob((blob) => {
                              if (blob) {
                                resolve(new File([blob], file.name, { type: blob.type }));
                              } else {
                                reject(new Error('Compression failed'));
                              }
                            }, 'image/jpeg', quality);
                          };
                          img.onerror = reject;
                          img.src = URL.createObjectURL(file);
                        });
                      };
                      let uploadFile = file;
                      try {
                        uploadFile = await compressImage(file);
                      } catch (err) {
                        toast({ title: 'Image compression failed', description: String(err), variant: 'destructive' });
                      }
                      const fileExt = uploadFile.name.split('.').pop();
                      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
                      const { data, error } = await supabase.storage.from('avatars').upload(fileName, uploadFile, {
                        cacheControl: '3600',
                        upsert: true,
                      });
                      if (!error && data) {
                        const url = `${supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl}`;
                        setAvatarUrl(url);
                        // Immediately update avatar_url in Supabase metadata
                        const { error: metaError } = await supabase.auth.updateUser({
                          data: {
                            ...user.user_metadata,
                            avatar_url: url
                          }
                        });
                        if (!metaError) {
                          setUser({
                            ...user,
                            user_metadata: {
                              ...user.user_metadata,
                              avatar_url: url
                            }
                          });
                          toast({ title: 'Photo uploaded!' });
                        } else {
                          toast({ title: 'Photo uploaded, but failed to update profile', description: metaError.message, variant: 'destructive' });
                        }
                      } else {
                        toast({ title: 'Upload failed', description: error?.message, variant: 'destructive' });
                      }
                      setUploading(false);
                    }}
                  />
                  <Input
                    type="url"
                    value={avatarUrl}
                    onChange={e => setAvatarUrl(e.target.value)}
                    placeholder="Avatar URL"
                    className="mt-2 w-48"
                  />
                </div>
              )}
              {uploading && <div className="text-xs text-primary mt-1">Uploading...</div>}
            </div>
            {editMode ? (
              <>
                <Input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="mt-2 w-48"
                />
                <Input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="mt-2 w-48"
                />
                <Input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  placeholder="Date of Birth"
                  className="mt-2 w-48"
                />
              </>
            ) : (
              <>
                <div className="mb-2 text-2xl font-semibold text-center text-primary drop-shadow">{fullName || user.email}</div>
                {phone && <div className="mb-2 text-gray-700 dark:text-gray-300">Phone: {phone}</div>}
                {dob && <div className="mb-2 text-gray-700 dark:text-gray-300">Date of Birth: {dob}</div>}
              </>
            )}
            <div className="mb-2 text-gray-600 dark:text-gray-400">Email: {user.email}</div>
            <div className="mb-2 text-gray-600 dark:text-gray-400 text-xs">Provider: {user.app_metadata?.provider || 'Email'}</div>
            <div className="mb-2 text-gray-600 dark:text-gray-400 text-xs">Last Sign In: {new Date(user.last_sign_in_at).toLocaleString()}</div>
          </div>
          <div className="flex gap-4 justify-center mt-4">
            <Button variant="outline" onClick={() => setEditMode(!editMode)}>
              {editMode ? 'Cancel' : 'Edit Profile'}
            </Button>
            {editMode && (
              <Button
                variant="default"
                onClick={async () => {
                  const { error } = await supabase.auth.updateUser({
                    data: {
                      full_name: fullName,
                      avatar_url: avatarUrl,
                      phone,
                      dob
                    }
                  });
                  if (!error) {
                    toast({ title: 'Profile updated!' });
                    setUser({
                      ...user,
                      user_metadata: {
                        ...user.user_metadata,
                        full_name: fullName,
                        avatar_url: avatarUrl,
                        phone,
                        dob
                      }
                    });
                    setEditMode(false);
                  } else {
                    toast({ title: 'Error updating profile', description: error.message, variant: 'destructive' });
                  }
                }}
              >
                Save
              </Button>
            )}
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-2 text-primary">Account Info</h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</li>
              <li><strong>Role:</strong> {user.role || 'User'}</li>
              <li><strong>Provider:</strong> {user.app_metadata?.provider || 'Email'}</li>
            </ul>
          </div>
          {/* You can add analysis history, bookmarks, or settings here */}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default User;
