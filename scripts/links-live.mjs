import {
  navigationGroups, footerGroups, headerLinks, navigationProductCards,
  pricingPlans, bookingLink , shopifyPricingHref, shopifyStartHref,
} from "../src/features/site-shell/link-model.ts";

// Network-dependent audit. Intentionally not part of the deterministic npm test.
const entries=[
  ...navigationGroups.flatMap(group=>group.links),
  ...footerGroups.flatMap(group=>group.links),
  ...headerLinks,
  ...navigationProductCards,
  ...pricingPlans,
  bookingLink,
  {href:shopifyPricingHref},
  {href:shopifyStartHref},
];
const urls=[...new Set(entries.map(entry=>entry.href).filter(href=>href.startsWith("https://")))];
const results=Array(urls.length);
let cursor=0;
async function worker(){
  while(cursor<urls.length){
    const index=cursor++;
    const href=urls[index];
    try {
      const response=await fetch(href,{
        method:"GET",
        headers:{"User-Agent":"Mozilla/5.0 RyzeLinkAudit/1.0"},
        signal:AbortSignal.timeout(10000),
      });
      await response.body?.cancel();
      results[index]={href,status:response.status,finalUrl:response.url};
    } catch(error){
      results[index]={href,error:String(error)};
    }
  }
}
await Promise.all(Array.from({length:6},()=>worker()));
let failures=0;
for(const result of results){
  const verdict=result.error||result.status===403||result.status===429?"CHECK":
    result.status>=200&&result.status<400?"PASS":"FAIL";
  if(verdict==="FAIL") failures++;
  console.log(verdict,JSON.stringify(result));
}
console.log(`Checked ${results.length} unique HTTPS destinations; ${failures} definite failures.`);
if(failures) process.exitCode=1;
