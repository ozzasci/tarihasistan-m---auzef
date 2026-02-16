import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Çevre değişkenlerini yükle
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
      // ÇOK ÖNEMLİ: GitHub repo adınızı buraya yazın (Örn: '/tarih-asistanim/')
      // Eğer repo adınız 'TarihAsistanim' ise '/TarihAsistanim/' yapın.
      base: '/repo-adinizi-buraya-yazın/', 

      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      
      // Bu kısım API anahtarını hem process.env hem de import.meta.env üzerinden erişilebilir kılar
      define: {
        'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      },

      resolve: {
        alias: {
          // '@' işaretini ana dizine yönlendirir
          '@': path.resolve(__dirname, './'),
        }
      }
    };
});
