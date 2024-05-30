import { UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default (): UserConfig => {

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: "https://01l3gsvnfl.execute-api.eu-north-1.amazonaws.com",
          secure: false,
        },
      },
    },
  };
};
