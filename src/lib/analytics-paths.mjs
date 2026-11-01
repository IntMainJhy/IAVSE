// Public routes only: never store workspace paths, query strings or account tokens.
export function isPublicAnalyticsPath(path) {
 if (typeof path !== 'string' || path.length > 500 || /[?#\\\s]/.test(path)) return false;
 let decoded;
 try { decoded = decodeURIComponent(path); } catch { return false; }
 if (/[?#\\\s]/.test(decoded) || decoded.includes('..') || decoded.includes('//')) return false;
 if (/^\/(?:$|about$|career$|blogs$|downloads$)/.test(decoded)) return true;
 if (/^\/(?:projects|articles|resources|community|skills|docs)(?:\/[^/]{1,200})?$/.test(decoded)) return true;
 if (/^\/(?:docs|skills|resources)\/shared\/[^/]{1,200}$/.test(decoded)) return true;
 if (/^\/community\/members\/[^/]{1,100}$/.test(decoded)) return true;
 if (/^\/blog\/[^/]{1,100}\/(?:experience|resume)$/.test(decoded)) return true;
 if (/^\/docs\/articles\/[^/]{1,200}$/.test(decoded)) return true;
 return /^\/blog\/[^/]{1,100}(?:\/(?:projects|articles|resources)(?:\/[^/]{1,200})?)?$/.test(decoded);
}
