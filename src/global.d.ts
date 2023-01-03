declare namespace NodeJS {
  interface Global {
    GH_API_KEY: string;
    NODE_ENV: 'development' | 'production';
  }
}
