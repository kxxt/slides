import{O as _,z as p,r as x,b as k,e as s,a7 as n,x as m,c as f,k as h,g as v,o as d,p as S,a as w}from"../modules/vue-2fpiEc3Z.js";import{_ as N,a as g}from"../index-CTXhHEjE.js";import"../modules/shiki-CJnnXe8e.js";const R={__name:"404",setup(t,{expose:l}){l();const{currentRoute:o}=_(),{total:e}=g(),u=p(()=>{const i=o.value.path.match(/\d+/);if(i){const r=+i[0];if(r>0&&r<=e.value)return r}return null}),a={currentRoute:o,total:e,guessedSlide:u,computed:p,get useRouter(){return _},get useNav(){return g}};return Object.defineProperty(a,"__isScriptSetup",{enumerable:!1,value:!0}),a}},y=t=>(S("data-v-ea59d911"),t=t(),w(),t),b={class:"grid justify-center pt-15%"},B=y(()=>s("h1",{class:"text-9xl font-bold"}," 404 ",-1)),I={class:"text-2xl"},j={class:"op-70"},C={class:"mt-3 flex flex-col gap-2"};function V(t,l,o,e,u,a){const c=x("RouterLink");return d(),k("div",b,[s("div",null,[B,s("p",I,[n(" Page not found"),s("code",j,":"+m(e.currentRoute.path),1)]),s("div",C,[e.guessedSlide!==1?(d(),f(c,{key:0,to:"/",class:"page-link"},{default:h(()=>[n(" Go Home ")]),_:1})):v("v-if",!0),e.guessedSlide?(d(),f(c,{key:1,to:`/${e.guessedSlide}`,class:"page-link"},{default:h(()=>[n(" Go to Slide "+m(e.guessedSlide),1)]),_:1},8,["to"])):v("v-if",!0)])])])}const O=N(R,[["render",V],["__scopeId","data-v-ea59d911"],["__file","/home/runner/work/slides/slides/node_modules/.pnpm/@slidev+client@0.49.10_@nuxt+kit@3.12.1_rollup@4.18.0__@vue+compiler-sfc@3.4.27_postcss@8.4.3_w2juxrewqpm4fezfs7rmoawgsu/node_modules/@slidev/client/pages/404.vue"]]);export{O as default};
