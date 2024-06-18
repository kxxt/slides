const __vite__fileDeps=["assets/slidev/DrawingControls-C_HkW8e1.js","assets/modules/unplugin-icons-CvLVkzgj.js","assets/modules/vue-2fpiEc3Z.js","assets/modules/shiki-CJnnXe8e.js","assets/modules/shiki-BPvBenZD.css","assets/slidev/DrawingPreview-CVsX9iRJ.js","assets/index-CTXhHEjE.js","assets/index-B7qSCX20.css","assets/DrawingPreview-CD-eij8Y.css","assets/slidev/ContextMenu-BtVh5RSJ.js","assets/slidev/IconButton-DbuFsPXr.js","assets/slidev/context-DTbR1Zcq.js","assets/electron-CMLpuv7b.js","assets/ContextMenu-CUxpU4UU.css","assets/DrawingControls-C5T1oZL5.css"],__vite__mapDeps=i=>i.map(i=>__vite__fileDeps[i]);
import{d as m,ab as V,o as i,c as u,b as f,e as a,f as j,i as k,g as d,ag as N,z as D,k as g,a7 as P,N as v,l as _,F as M,v as I,x as C,h as O,t as R}from"../modules/vue-2fpiEc3Z.js";import{_ as p,v as w,a as z,w as W,x as q,y as B,z as H,A,d as T,B as G,o as y,D as L,E as Q}from"../index-CTXhHEjE.js";import{Q as U,G as F,C as K,u as X,r as Y,N as J,S as Z,o as $}from"./ContextMenu-BtVh5RSJ.js";import{b as ee,S as oe}from"./DrawingPreview-CVsX9iRJ.js";import{o as te}from"../modules/unplugin-icons-CvLVkzgj.js";import"../modules/shiki-CJnnXe8e.js";import"./IconButton-DbuFsPXr.js";import"./context-DTbR1Zcq.js";import"../electron-CMLpuv7b.js";const se=m({__name:"Modal",props:{modelValue:{default:!1},class:{default:""}},emits:["update:modelValue"],setup(l,{expose:o,emit:t}){o();const e=l,s=t,n=V(e,"modelValue",s);function r(){n.value=!1}const c={props:e,emit:s,value:n,onClick:r};return Object.defineProperty(c,"__isScriptSetup",{enumerable:!1,value:!0}),c}}),ne={key:0,class:"fixed top-0 bottom-0 left-0 right-0 grid z-20"};function re(l,o,t,e,s,n){return i(),u(N,null,[e.value?(i(),f("div",ne,[a("div",{bg:"black opacity-80",class:"absolute top-0 bottom-0 left-0 right-0 -z-1",onClick:o[0]||(o[0]=r=>e.onClick())}),a("div",{class:k(["m-auto rounded-md bg-main shadow",e.props.class]),"dark:border":"~ main"},[j(l.$slots,"default")],2)])):d("v-if",!0)],1024)}const ie=p(se,[["render",re],["__file","/home/runner/work/slides/slides/node_modules/.pnpm/@slidev+client@0.49.10_@nuxt+kit@3.12.1_rollup@4.18.0__@vue+compiler-sfc@3.4.27_postcss@8.4.3_w2juxrewqpm4fezfs7rmoawgsu/node_modules/@slidev/client/internals/Modal.vue"]]),le=m({__name:"InfoDialog",props:{modelValue:{default:!1}},emits:["update:modelValue"],setup(l,{expose:o,emit:t}){o();const e=l,s=t,n=V(e,"modelValue",s),r=D(()=>typeof w.info=="string"),c={props:e,emit:s,value:n,hasInfo:r,get configs(){return w},Modal:ie};return Object.defineProperty(c,"__isScriptSetup",{enumerable:!1,value:!0}),c}}),ae="/slides/electron-riscv-porting/assets/logo-BYkHSa_O.png",de={class:"slidev-info-dialog slidev-layout flex flex-col gap-4 text-base"},ce=["innerHTML"],ue=a("a",{href:"https://github.com/slidevjs/slidev",target:"_blank",class:"!opacity-100 !border-none !text-current"},[a("div",{class:"flex gap-1 children:my-auto"},[a("div",{class:"opacity-50 text-sm mr-2"},"Powered by"),a("img",{class:"w-5 h-5",src:ae,alt:"Slidev logo"}),a("div",{style:{color:"#2082A6"}},[a("b",null,"Sli"),P("dev ")])])],-1);function _e(l,o,t,e,s,n){return i(),u(e.Modal,{modelValue:e.value,"onUpdate:modelValue":o[0]||(o[0]=r=>e.value=r),class:"px-6 py-4"},{default:g(()=>[a("div",de,[e.hasInfo?(i(),f("div",{key:0,class:"mb-4",innerHTML:e.configs.info},null,8,ce)):d("v-if",!0),ue])]),_:1},8,["modelValue"])}const fe=p(le,[["render",_e],["__file","/home/runner/work/slides/slides/node_modules/.pnpm/@slidev+client@0.49.10_@nuxt+kit@3.12.1_rollup@4.18.0__@vue+compiler-sfc@3.4.27_postcss@8.4.3_w2juxrewqpm4fezfs7rmoawgsu/node_modules/@slidev/client/internals/InfoDialog.vue"]]),me=m({__name:"Controls",setup(l,{expose:o}){o();const{isEmbedded:t}=z(),e=!w.drawings.presenterOnly&&!t.value,s=v();e&&W(()=>import("./DrawingControls-C_HkW8e1.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14])).then(h=>s.value=h.default);const n=v(),r=v(),c={isEmbedded:t,drawingEnabled:e,DrawingControls:s,WebCamera:n,RecordingDialog:r,get showInfoDialog(){return q},get showRecordingDialog(){return B},get configs(){return w},QuickOverview:U,InfoDialog:fe,Goto:F,ContextMenu:K};return Object.defineProperty(c,"__isScriptSetup",{enumerable:!1,value:!0}),c}});function pe(l,o,t,e,s,n){return i(),f(M,null,[e.drawingEnabled&&e.DrawingControls?(i(),u(e.DrawingControls,{key:0})):d("v-if",!0),_(e.QuickOverview),_(e.Goto),e.WebCamera?(i(),u(e.WebCamera,{key:1})):d("v-if",!0),e.RecordingDialog?(i(),u(e.RecordingDialog,{key:2,modelValue:e.showRecordingDialog,"onUpdate:modelValue":o[0]||(o[0]=r=>e.showRecordingDialog=r)},null,8,["modelValue"])):d("v-if",!0),e.configs.info?(i(),u(e.InfoDialog,{key:3,modelValue:e.showInfoDialog,"onUpdate:modelValue":o[1]||(o[1]=r=>e.showInfoDialog=r)},null,8,["modelValue"])):d("v-if",!0),_(e.ContextMenu)],64)}const ve=p(me,[["render",pe],["__file","/home/runner/work/slides/slides/node_modules/.pnpm/@slidev+client@0.49.10_@nuxt+kit@3.12.1_rollup@4.18.0__@vue+compiler-sfc@3.4.27_postcss@8.4.3_w2juxrewqpm4fezfs7rmoawgsu/node_modules/@slidev/client/internals/Controls.vue"]]),ge=m({__name:"PrintStyle",setup(l,{expose:o}){o();function t(s,{slots:n}){if(n.default)return I("style",n.default())}const e={vStyle:t,get slideHeight(){return H},get slideWidth(){return A}};return Object.defineProperty(e,"__isScriptSetup",{enumerable:!1,value:!0}),e}});function we(l,o,t,e,s,n){return i(),u(e.vStyle,null,{default:g(()=>[P(" @page { size: "+C(e.slideWidth)+"px "+C(e.slideHeight)+"px; margin: 0px; } ",1)]),_:1})}const he=p(ge,[["render",we],["__file","/home/runner/work/slides/slides/node_modules/.pnpm/@slidev+client@0.49.10_@nuxt+kit@3.12.1_rollup@4.18.0__@vue+compiler-sfc@3.4.27_postcss@8.4.3_w2juxrewqpm4fezfs7rmoawgsu/node_modules/@slidev/client/internals/PrintStyle.vue"]]),xe=m({__name:"PresenterMouse",setup(l,{expose:o}){o();const t={get sharedState(){return T}};return Object.defineProperty(t,"__isScriptSetup",{enumerable:!1,value:!0}),t}}),ye={key:0,class:"absolute top-0 left-0 right-0 bottom-0 pointer-events-none text-xl"};function ke(l,o,t,e,s,n){const r=te;return e.sharedState.cursor?(i(),f("div",ye,[_(r,{class:"absolute stroke-white dark:stroke-black",style:O({left:`${e.sharedState.cursor.x}%`,top:`${e.sharedState.cursor.y}%`,strokeWidth:16})},null,8,["style"])])):d("v-if",!0)}const be=p(xe,[["render",ke],["__file","/home/runner/work/slides/slides/node_modules/.pnpm/@slidev+client@0.49.10_@nuxt+kit@3.12.1_rollup@4.18.0__@vue+compiler-sfc@3.4.27_postcss@8.4.3_w2juxrewqpm4fezfs7rmoawgsu/node_modules/@slidev/client/internals/PresenterMouse.vue"]]),Se=m({__name:"play",setup(l,{expose:o}){o();const{next:t,prev:e,isPrintMode:s}=z(),{isDrawing:n}=ee(),r=R();function c(x){var S;y.value||x.button===0&&((S=x.target)==null?void 0:S.id)==="slide-container"&&(x.pageX/window.innerWidth>.5?t():e())}X(r),Y();const h=D(()=>G.value||y.value),E=v(),b={next:t,prev:e,isPrintMode:s,isDrawing:n,root:r,onClick:c,persistNav:h,SideEditor:E,get isEditorVertical(){return L},get showEditor(){return y},get windowSize(){return Q},Controls:ve,SlideContainer:oe,NavControls:J,SlidesShow:Z,PrintStyle:he,get onContextMenu(){return $},PresenterMouse:be};return Object.defineProperty(b,"__isScriptSetup",{enumerable:!1,value:!0}),b}}),Ce=a("div",{id:"twoslash-container"},null,-1);function Ve(l,o,t,e,s,n){return i(),f(M,null,[e.isPrintMode?(i(),u(e.PrintStyle,{key:0})):d("v-if",!0),a("div",{id:"page-root",ref:"root",class:k(["grid",e.isEditorVertical?"grid-rows-[1fr_max-content]":"grid-cols-[1fr_max-content]"])},[_(e.SlideContainer,{style:{background:"var(--slidev-slide-container-background, black)"},width:e.isPrintMode?e.windowSize.width.value:void 0,"is-main":"",onPointerdown:e.onClick,onContextmenu:e.onContextMenu},{default:g(()=>[_(e.SlidesShow,{"render-context":"slide"}),_(e.PresenterMouse)]),controls:g(()=>[e.isPrintMode?d("v-if",!0):(i(),f("div",{key:0,class:k(["absolute bottom-0 left-0 transition duration-300 opacity-0 hover:opacity-100",[e.persistNav?"!opacity-100 right-0":"opacity-0 p-2",e.isDrawing?"pointer-events-none":""]])},[_(e.NavControls,{persist:e.persistNav},null,8,["persist"])],2))]),_:1},8,["width","onContextmenu"]),e.SideEditor&&e.showEditor?(i(),u(e.SideEditor,{key:0,resize:!0})):d("v-if",!0)],2),e.isPrintMode?d("v-if",!0):(i(),u(e.Controls,{key:1})),Ce],64)}const Re=p(Se,[["render",Ve],["__file","/home/runner/work/slides/slides/node_modules/.pnpm/@slidev+client@0.49.10_@nuxt+kit@3.12.1_rollup@4.18.0__@vue+compiler-sfc@3.4.27_postcss@8.4.3_w2juxrewqpm4fezfs7rmoawgsu/node_modules/@slidev/client/pages/play.vue"]]);export{Re as default};