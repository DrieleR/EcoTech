import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Aceita conexões de outros aparelhos da rede (ex.: o celular que lê o
    // QR Code de pagamento). O endereço aparece como "Network" ao rodar.
    host: true,
    // Em desenvolvimento, /api vai para o backend (npm run dev:api).
    // Assim front e API ficam na mesma origem e não precisa de CORS.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
