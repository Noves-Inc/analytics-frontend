export const IS_DEVELOPMENT =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "development";
export const IS_PREVIEW = process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";
export const IS_PRODUCTION =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

export const BASE_URLS = {
  development: `http://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
  preview: `http://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
  production: `http://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
};

export const BASE_URL =
  BASE_URLS[process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development"];
