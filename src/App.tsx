import {useEffect,useRef,useState} from 'react';
import {defaults,limits} from './simulation/engine.js';
type Params={hr:number;contractility:number;volume:number;resistance:number;compliance:number};
type Sample={t:number;aorta:number;lv:number;flow:number;volume:number;stable:boolean;metrics:Record<string,number>|null;total:number};
type Point={x:number;y:number};
const fields:[keyof Params,string,string][]=[['hr','Frecuencia cardíaca','lat/min'],['contractility','Contractilidad izquierda','%'],['volume','Volumen sanguíneo','mL'],['resistance','Resistencia sistémica','%'],['compliance','Compliancia arterial','%']];
const indicators=[['co','Gasto cardíaco','L/min'],['sv','Volumen sistólico','mL'],['sbp','Presión sistólica','mmHg'],['dbp','Presión diastólica','mmHg'],['map','Presión media','mmHg'],['rap','Presión auricular derecha','mmHg'],['edv','Volumen telediastólico','mL'],['esv','Volumen telesistólico','mL'],['ef','Fracción de eyección','%']];
const practices=[
{title:'Exploración libre',goal:'Modifica los controles y observa la respuesta del sistema.'},
{title:'Resistencia vascular',goal:'Compara resistencia al 150 % y al 70 %, reiniciando entre experimentos. Explica cómo cambia el gradiente de presión.'},
{title:'Contractilidad',goal:'Reduce la contractilidad al 60 %. Relaciona el volumen telesistólico con el cambio del volumen expulsado.'},
{title:'Pérdida de volumen',goal:'Explora la relación entre volumen, llenado y gasto. Esta primera versión aplica el cambio inmediatamente; la retirada gradual queda pendiente.'}
];
function Chart({title,unit,current,reference=[]}:{title:string;unit:string;current:Point[];reference?:Point[]}){
 const all=[...current,...reference].filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y));
 const xs=all.map(p=>p.x),ys=all.map(p=>p.y);
 const xmin=Math.min(...xs,0),xmax=Math.max(...xs,1),ymin=Math.min(...ys,0),ymax=Math.max(...ys,1);
 const path=(points:Point[])=>points.map((p,i)=>(i?'L':'M')+(35+((p.x-xmin)/(xmax-xmin))*510).toFixed(2)+','+(155-((p.y-ymin)/(ymax-ymin))*130).toFixed(2)).join(' ');
 return <section className="chart"><h3>{title} <small>{unit}</small></h3><svg viewBox="0 0 570 185" role="img" aria-label={title+'; serie actual continua y referencia discontinua'}><path d="M35 15V155H550" fill="none" stroke="#93a8b8"/><text x="2" y="23">{ymax.toFixed(0)}</text><text x="2" y="155">{ymin.toFixed(0)}</text><path d={path(reference)} fill="none" stroke="#bf5800" strokeWidth="2" strokeDasharray="6 4"/><path d={path(current)} fill="none" stroke="#007e87" strokeWidth="2"/><text x="35" y="178">{xmin.toFixed(1)}</text><text x="510" y="178">{xmax.toFixed(1)}</text></svg></section>;
}
export default function App(){
 const worker=useRef<Worker|null>(null);
 const [ready,setReady]=useState(false),[running,setRunning]=useState(false),[error,setError]=useState('');
 const [params,setParams]=useState<Params>({...defaults}),[applied,setApplied]=useState<Params>({...defaults});
 const [samples,setSamples]=useState<Sample[]>([]),[current,setCurrent]=useState<Sample|null>(null);
 const [reference,setReference]=useState<Sample[]>([]),[practice,setPractice]=useState(0);
 const [prediction,setPrediction]=useState(''),[conclusion,setConclusion]=useState('');
 const [speed,setSpeed]=useState(1),[events,setEvents]=useState<{t:number;parameters:Params}[]>([]);
 useEffect(()=>{
  const w=new Worker(new URL('./simulation/worker.js',import.meta.url),{type:'module'});worker.current=w;
  w.onmessage=({data})=>{
   if(data.type==='ERROR'){setError(data.payload);setRunning(false);return;}
   if(data.type==='READY'){setCurrent(data.payload);setSamples([]);setReady(true);setRunning(false);}
   if(data.type==='SAMPLES'){setSamples(prev=>[...prev,...data.payload].slice(-1500));setCurrent(data.payload.at(-1));}
   if(data.type==='PAUSED'||data.type==='APPLIED')setCurrent(data.payload);
  };
  w.onerror=()=>{setError('No se pudo ejecutar el motor de simulación.');setRunning(false);};
  w.postMessage({type:'INITIALIZE'});return()=>{w.terminate();worker.current=null;};
 },[]);
 const send=(type:string,payload?:unknown)=>worker.current?.postMessage({type,payload});
 const reset=()=>{if(!window.confirm('¿Reiniciar la ejecución y borrar la referencia? Las respuestas se conservarán.'))return;setRunning(false);setReady(false);setReference([]);setEvents([]);setParams({...defaults});setApplied({...defaults});setError('');send('RESET');};
 const apply=()=>{for(const [key] of fields){const [min,max]=limits[key];if(!Number.isFinite(params[key])||params[key]<min||params[key]>max){setError('Revisa '+key);return;}}setError('');send('APPLY_PARAMETERS',params);setApplied({...params});setEvents(e=>[...e,{t:current?.t??0,parameters:{...params}}]);};
 const download=(name:string,body:string,type:string)=>{const url=URL.createObjectURL(new Blob([body],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 const points=(data:Sample[],key:'aorta'|'lv'|'flow'|'volume',pv=false):Point[]=>{const tail=data.slice(-500),start=tail[0]?.t??0;return tail.map(s=>({x:pv?s.volume:s.t-start,y:s[key]}));};
 const latestRef=reference.at(-1)?.metrics;
 return <><header><div><p className="eyebrow">LABORATORIO VIRTUAL · VERSIÓN 0.1</p><h1>Hemodinamia</h1><p>Experimenta con presión, flujo y función cardíaca.</p></div><span className="badge">Modelo 0D</span></header>
 <main><aside><h2>Experimento</h2><label htmlFor="practice">Actividad</label><select id="practice" value={practice} onChange={e=>setPractice(Number(e.target.value))}>{practices.map((p,i)=><option key={p.title} value={i}>{p.title}</option>)}</select><p>{practices[practice].goal}</p>
 {fields.map(([key,label,unit])=><div className="control" key={key}><label htmlFor={key}>{label} <small>({unit})</small></label><input id={key} type="number" min={limits[key][0]} max={limits[key][1]} value={Number.isNaN(params[key])?'':params[key]} onChange={e=>setParams({...params,[key]:e.target.valueAsNumber})}/><input aria-label={label+' deslizador'} type="range" min={limits[key][0]} max={limits[key][1]} value={Number.isFinite(params[key])?params[key]:limits[key][0]} onChange={e=>setParams({...params,[key]:Number(e.target.value)})}/><small>Aplicado: {applied[key]} {unit}</small></div>)}
 <button disabled={!ready||Boolean(error)} onClick={apply}>Aplicar cambios</button><details><summary>Supuestos y fundamentos</summary><p>Circulación cerrada con resistencias, compliancias y elastancia ventricular. Sin barorreflejo ni intercambio gaseoso.</p><p>Navier–Stokes describe velocidad y presión en el espacio. Este modelo 0D conserva volumen y usa relaciones reducidas; no calcula recirculación ni esfuerzo cortante parietal.</p></details></aside>
 <div className="workspace"><section className="toolbar" aria-label="Control de simulación"><button disabled={!ready||Boolean(error)||(practice>0&&!prediction.trim())} onClick={()=>{send(running?'PAUSE':'START');setRunning(!running);}}>{running?'Pausar':'Iniciar'}</button><button className="secondary" onClick={reset}>Reiniciar</button><label>Velocidad <select value={speed} onChange={e=>{setSpeed(Number(e.target.value));send('SET_SPEED',Number(e.target.value));}}><option value={.5}>0,5x</option><option value={1}>1x</option><option value={2}>2x</option></select></label><span>{current?.t.toFixed(1)??'0.0'} s · {!ready?'Preparando basal…':running?'Ejecutando':'Pausada'} · {current?.stable?'Estabilizada':'En transición'}</span></section>
 {error&&<p className="error" role="alert">{error} Reinicia para recuperar un estado válido.</p>}
 <p className="notice">Prototipo educativo en validación. Basal precalculado durante 30 segundos simulados. Cambios de volumen instantáneos.</p>
 <section className="metrics" aria-label="Indicadores">{indicators.map(([key,label,unit])=><article key={key}><span>{label}</span><strong>{current?.metrics?.[key]?.toFixed(1)??'—'} <small>{unit}</small></strong>{latestRef&&current?.metrics&&<small>Δ {(current.metrics[key]-latestRef[key]).toFixed(1)} {unit}</small>}</article>)}</section>
 <section className="comparison"><button className="secondary" disabled={!samples.length} onClick={()=>setReference(structuredClone(samples))}>Guardar referencia</button><span>Actual: línea continua · Referencia: línea discontinua</span></section>
 <div className="charts"><Chart title="Presión aórtica" unit="mmHg · tiempo relativo (s)" current={points(samples,'aorta')} reference={points(reference,'aorta')}/><Chart title="Flujo aórtico" unit="mL/s · tiempo relativo (s)" current={points(samples,'flow')} reference={points(reference,'flow')}/><Chart title="Volumen ventricular izquierdo" unit="mL · tiempo relativo (s)" current={points(samples,'volume')} reference={points(reference,'volume')}/><Chart title="Bucle presión-volumen izquierdo" unit="mmHg · volumen (mL)" current={points(samples,'lv',true)} reference={points(reference,'lv',true)}/></div>
 <section className="notes"><h2>Cuaderno de laboratorio</h2><label htmlFor="prediction">Predicción {practice>0?'(necesaria para iniciar)':''}</label><textarea id="prediction" value={prediction} onChange={e=>setPrediction(e.target.value)}/><label htmlFor="conclusion">Observaciones y explicación</label><textarea id="conclusion" value={conclusion} onChange={e=>setConclusion(e.target.value)}/><div className="actions"><button className="secondary" disabled={!samples.length} onClick={()=>download('hemodinamia.csv','tiempo_s,presion_aortica_mmHg,presion_vi_mmHg,flujo_aortico_mL_s,volumen_vi_mL\n'+samples.map(s=>[s.t,s.aorta,s.lv,s.flow,s.volume].join(',')).join('\n'),'text/csv;charset=utf-8')}>Exportar CSV</button><button className="secondary" onClick={()=>download('hemodinamia.json',JSON.stringify({modelVersion:'0.1.0',practice:practices[practice].title,parameters:applied,events,prediction,conclusion,samples,reference},null,2),'application/json')}>Exportar sesión</button><button className="secondary" onClick={()=>window.print()}>Imprimir informe</button></div><p>Datos exportados: ventana más reciente, hasta 1.500 muestras. Sin guardado automático en esta entrega.</p></section>
 </div></main><footer>Hemodinamia · Simulación fisiológica educativa · Sin uso clínico</footer></>;
}
