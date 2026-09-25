import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        eventDetail: resolve(__dirname, 'pages/event-detail.html'),
        adminLogin: resolve(__dirname, 'pages/admin/login.html'),
        adminDashboard: resolve(__dirname, 'pages/admin/dashboard.html'),
      },
    },
  },
});
