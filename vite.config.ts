import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Üçüncü parametreyi '' yaparak tüm değişkenleri yüklemesini sağlıyoruz
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
      base: '/tarihasistan-m---auzef/', // Burayı kendi repo adınızla teyit edin
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // BURASI KRİTİK: Vercel'deki isimle buradaki isim aynı olmalı
        'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY) 
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './'),
        }
      }
    };
});
