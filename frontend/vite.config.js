import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,         // cho phép truy cập từ mạng LAN / ngrok
    port: 5173,         // port dev server
    strictPort: true,   // nếu port 5173 đang dùng, báo lỗi luôn
    allowedHosts: [
      'codicillary-unviolently-ryland.ngrok-free.dev', // thêm host ngrok
    ],
  },
});
