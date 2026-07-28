/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Autorise l'affichage des avatars servis depuis Supabase Storage.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
