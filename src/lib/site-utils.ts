export function getSiteUrl(subdomain: string, path: string = "/") {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  // If running on Vercel free domain without custom domain, use path-based routing
  if (rootDomain.includes("vercel.app")) {
    return `/sites/${subdomain}${cleanPath === "/" ? "" : cleanPath}`;
  }
  
  // For custom domains / normal setup, use relative path which stays on current subdomain
  return cleanPath;
}
