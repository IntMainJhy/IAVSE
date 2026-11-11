/** Route-owned shells and member-authored/preview surfaces must not be wrapped. */
export function platformChrome(path:string){
  const authored=/^\/blog(?:\/|$)|^\/blogs\/showcase(?:\/|$)/.test(path);
  const preview=/^\/resources\/designs\/[^/]+\/preview\/?$/.test(path);
  const studio=/^\/workspace\/blog(?:\/|$)/.test(path);
  const atmosphere=path!=='/'&&!authored&&!preview&&!studio;
  return {atmosphere,header:atmosphere&&!/^\/admin(?:\/|$)/.test(path)};
}
