import{a3 as n,ac as r,t as u,z as $,av as j,aF as v}from"../modules/vue-2fpiEc3Z.js";import{aB as p,a2 as C,a0 as x,a1 as S,aC as l,$ as E,V as F,a3 as R,aD as T,aE as k}from"../index-CTXhHEjE.js";function g(){const t=n(p),a=r(t,"nav"),s=n(C).value,e=r(s,"current"),i=n(x),c=n(S),o=n(l,{}),d=n(E,void 0),m=n(F,u(1)),f=n(R,$(()=>1));return{$slidev:t,$nav:a,$clicksContext:s,$clicks:e,$page:i,$route:d,$renderContext:c,$frontmatter:o,$scale:m,$zoom:f}}function O(t){var i,c;j(l,t);const{$slidev:a,$page:s}=g(),e=a.nav.slides.find(o=>o.no===s.value);if((c=(i=e==null?void 0:e.meta)==null?void 0:i.slide)!=null&&c.frontmatter){for(const o of Object.keys(e.meta.slide.frontmatter))o in t||delete e.meta.slide.frontmatter[o];Object.assign(e.meta.slide.frontmatter,t)}}function b(t,a){return{...v(t,a===0?T:k),frontmatter:t}}export{b as f,O as p,g as u};
