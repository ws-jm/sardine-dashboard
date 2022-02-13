interface ImportMeta {
  env: {
    VITE_APP_SARDINE_ENV: string;
    VITE_APP_FRONTEND_HOST: string;
  };
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.svg" {
  const content: string;
  export default content;
}
