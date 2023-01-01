declare namespace NodeJS {
  interface Global {
    GITHUB_KEY: string;
    NODE_ENV: 'development' | 'production';
  }
}
