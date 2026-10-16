export const defaults = Object.freeze({hr:75,contractility:100,volume:5000,resistance:100,compliance:100});
export const limits = {hr:[40,180],contractility:[25,200],volume:[3000,7000],resistance:[40,250],compliance:[30,200]};
const initial=[3100,40,140,180,400,40,140,960];
const v0=[2250,20,10,100,300,20,10,800];
export function validate(p) {
 for(const k of Object.keys(defaults)) if(!Number.isFinite(p[k])||p[k]<limits[k][0]||p[k]>limits[k][1]) throw Error('Parámetro inválido: '+k);
 return {...p};
}
export function pressures(v, phase, p) {
 const activation=phase<0.4?Math.sin(Math.PI*phase/0.4)**2:0;
 return [(v[0]-v0[0])/100,(v[1]-v0[1])/10,(0.04+0.55*activation)*(v[2]-v0[2]),
 (v[3]-v0[3])/5,(v[4]-v0[4])/20,(v[5]-v0[5])/10,
 (0.06+2.4*p.contractility/100*activation)*(v[6]-v0[6]),(v[7]-v0[7])/(1.4*p.compliance/100)];
}
function rates(v,phase,p){
 const a=pressures(v,phase,p);
 const resistances=[0.025,0.01,0.01,0.12,0.025,0.01,0.01,1.05*p.resistance/100];
 const q=a.map((x,i)=>(x-a[(i+1)%8])/resistances[i]);
 for(const i of [1,2,5,6]) q[i]=Math.max(0,q[i]);
 return {dv:q.map((_,i)=>q[(i+7)%8]-q[i]),q,a};
}
function rk(v,phase,h,p){
 const f=p.hr/60;
 const a=rates(v,phase,p).dv;
 const b=rates(v.map((x,i)=>x+h*a[i]/2),(phase+h*f/2)%1,p).dv;
 const c=rates(v.map((x,i)=>x+h*b[i]/2),(phase+h*f/2)%1,p).dv;
 const d=rates(v.map((x,i)=>x+h*c[i]),(phase+h*f)%1,p).dv;
 return v.map((x,i)=>x+h*(a[i]+2*b[i]+2*c[i]+d[i])/6);
}
export class Simulation {
 constructor(p=defaults){this.p=validate(p);this.v=[...initial];this.v[0]+=p.volume-5000;this.t=0;this.phase=0;this.h=0.001;this.metrics=null;this.stableCount=0;this.previous=null;this.resetCycle();}
 resetCycle(){this.cycle={duration:0,flow:0,pressure:0,ra:0,min:Infinity,max:-Infinity,edv:this.v[6],esv:this.v[6]};}
 apply(p){p=validate(p);const delta=p.volume-this.p.volume;if(this.v[0]+delta<=0)throw Error('Volumen venoso insuficiente');this.v[0]+=delta;this.p=p;this.stableCount=0;this.previous=null;this.metrics=null;this.resetCycle();this.skipCycle=true;}
 advance(duration){
 if(!Number.isFinite(duration)||duration<0||duration>60)throw Error('Duración inválida');
 const end=this.t+duration;let iterations=0;
 while(this.t<end-1e-12){
  if(++iterations>200000)throw Error('Límite de integración');
  const h=Math.min(this.h,end-this.t), full=rk(this.v,this.phase,h,this.p);
  const half=rk(this.v,this.phase,h/2,this.p);
  const fine=rk(half,(this.phase+h*this.p.hr/120)%1,h/2,this.p);
  const error=Math.max(...fine.map((x,i)=>Math.abs(x-full[i])/(1e-6+1e-6*Math.abs(x))));
  if(error>1){this.h=h/2;if(this.h<1e-8)throw Error('Integración no convergente');continue;}
  if(fine.some(x=>!Number.isFinite(x)||x<=0))throw Error('Estado de volumen inválido');
  const old=rates(this.v,this.phase,this.p);
  this.v=fine;this.t+=h;
  const nextPhase=this.phase+h*this.p.hr/60;this.phase=nextPhase%1;
  const now=rates(this.v,this.phase,this.p),c=this.cycle;
  c.duration+=h;c.flow+=h*(old.q[6]+now.q[6])/2;c.pressure+=h*(old.a[7]+now.a[7])/2;c.ra+=h*(old.a[1]+now.a[1])/2;
  c.min=Math.min(c.min,old.a[7],now.a[7]);c.max=Math.max(c.max,old.a[7],now.a[7]);
  c.edv=Math.max(c.edv,this.v[6]);c.esv=Math.min(c.esv,this.v[6]);
  if(nextPhase>=1){
   if(!this.skipCycle){
    this.metrics={hr:this.p.hr,co:c.flow/c.duration*0.06,sv:c.flow,map:c.pressure/c.duration,sbp:c.max,dbp:c.min,rap:c.ra/c.duration,edv:c.edv,esv:c.esv,ef:100*(c.edv-c.esv)/c.edv};
    const prev=this.previous;
    this.stableCount=prev&&Math.abs(c.flow-prev.sv)/Math.max(1,Math.abs(prev.sv))<0.01&&Math.abs(c.edv-prev.edv)/Math.max(1,Math.abs(prev.edv))<0.01?this.stableCount+1:0;
    this.previous=this.metrics;
   }
   this.skipCycle=false;this.resetCycle();
  }
  if(error<0.03)this.h=Math.min(0.002,h*2);
 }
 return this.sample();
 }
 sample(){const r=rates(this.v,this.phase,this.p);return {t:this.t,aorta:r.a[7],lv:r.a[6],flow:r.q[6],volume:this.v[6],metrics:this.metrics,stable:this.stableCount>=5,total:this.v.reduce((a,b)=>a+b,0)};}
}
