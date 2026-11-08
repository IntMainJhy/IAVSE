/** The HTML remains opaque even when someone opens its public URL directly. */
export function websiteArtifactHeaders(origin){
 const local=new URL(origin).origin;
 const policy=["sandbox allow-scripts","default-src 'none'","script-src 'unsafe-inline'","script-src-attr 'none'","style-src 'unsafe-inline'",`img-src data: ${local}/design-artifacts/`,`font-src data: ${local}/fonts/ ${local}/design-artifacts/`,"connect-src 'none'","media-src 'none'","worker-src 'none'","frame-src 'none'","object-src 'none'","base-uri 'none'","form-action 'none'","frame-ancestors 'self'"].join('; ');
 return {'Content-Security-Policy':policy,'X-Content-Type-Options':'nosniff','X-Frame-Options':'SAMEORIGIN','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow','Cross-Origin-Resource-Policy':'cross-origin','Access-Control-Allow-Origin':'*','Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=()'};
}
