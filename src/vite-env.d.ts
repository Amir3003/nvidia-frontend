/// <reference types="vite/client" />

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}


interface ImportMetaEnv {
  readonly VITE_KAKAO_APP_ID?: string;
  readonly VITE_KAKAO_REST_API_KEY?: string;
  readonly VITE_KAKAO_REDIRECT_URI?: string;
  readonly VITE_KAKAO_TOKEN_ENDPOINT?: string;
}
