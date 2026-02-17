import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // mode: 'development' veya 'production'
  // process.cwd(): Projenin ana dizini
  // '': Tüm değişkenleri yükle (VITE_ ön eki olmayanlar dahil)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Vercel ve genel yayınlama için kök dizin ayarı
    base: '/',
    
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    
    plugins: [react()],
    
    // Uygulama içinde hem process.env hem de import.meta.env üzerinden 
    // anahtara erişimi garanti altına alıyoruz.
    define: {
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
    },
    
    resolve: {
      alias: {
        // '@' işaretini ana dizine yönlendiriyoruz
        '@': path.resolve(__dirname, './'),
      },
    },
    
    build: {
      // Build sırasında hata ayıklamayı kolaylaştırır
      sourcemap: true,
      // Çıktı klasörü
      outDir: 'dist',
    }
  };
});
