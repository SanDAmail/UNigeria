
-- Create storage bucket for user assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('user_assets', 'user_assets', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Add RLS policy for user_assets bucket
CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'user_assets' AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow public read access to avatars" ON storage.objects FOR SELECT USING (
  bucket_id = 'user_assets'
);
