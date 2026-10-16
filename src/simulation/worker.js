import {Simulation,defaults} from './engine.js';
let sim, timer=null, speed=1;
const stop=()=>{if(timer!==null)clearInterval(timer);timer=null;};
const post=(type,payload)=>self.postMessage({type,payload});
function init(){stop();sim=new Simulation();sim.advance(30);sim.t=0;post('READY',sim.sample());}
self.onmessage=({data})=>{
 try{
 switch(data.type){
 case 'INITIALIZE':case 'RESET':init();break;
 case 'START':if(timer===null)timer=setInterval(()=>{try{const samples=[];for(let i=0;i<5;i++)samples.push(sim.advance(.02*speed));post('SAMPLES',samples);}catch(e){stop();post('ERROR',String(e.message));}},100);break;
 case 'PAUSE':stop();post('PAUSED',sim.sample());break;
 case 'SET_SPEED':if(![.5,1,2].includes(data.payload))throw Error('Velocidad inválida');speed=data.payload;break;
 case 'APPLY_PARAMETERS':sim.apply(data.payload);post('APPLIED',sim.sample());break;
 }
 }catch(e){stop();post('ERROR',String(e.message));}
};
