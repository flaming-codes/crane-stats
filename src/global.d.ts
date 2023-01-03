declare namespace NodeJS {
  interface ProcessEnv {
    GH_API_KEY: string;
    NODE_ENV: 'development' | 'production';
    SERVER_PORT: string;
  }
}
