import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,defaults} from '../src/simulation/engine.js';
test('conserva 5000 mL durante diez minutos',()=>{
 const s=new Simulation();for(let i=0;i<10;i++)s.advance(60);
 assert.ok(Math.abs(s.sample().total-5000)/5000<0.001);
 assert.ok(s.metrics.sbp>=110&&s.metrics.sbp<=130);
 assert.ok(s.metrics.dbp>=70&&s.metrics.dbp<=90);
 assert.ok(s.metrics.co>=4.5&&s.metrics.co<=5.5);
 assert.equal(s.sample().stable,true);
});
test('reducir contractilidad reduce eyección y aumenta volumen telesistólico',()=>{
 const s=new Simulation();s.advance(30);const before={...s.metrics};
 s.apply({...defaults,contractility:60});s.advance(60);
 assert.ok(s.metrics.co<before.co);assert.ok(s.metrics.esv>before.esv);
});
test('retirada explícita conserva el nuevo volumen y reduce llenado',()=>{
 const s=new Simulation();s.advance(30);const edv=s.metrics.edv;
 s.apply({...defaults,volume:4500});s.advance(60);
 assert.ok(Math.abs(s.sample().total-4500)<0.01);assert.ok(s.metrics.edv<edv);
});
test('parámetro inválido no cambia el estado',()=>{
 const s=new Simulation();const before=JSON.stringify(s);
 assert.throws(()=>s.apply({...defaults,hr:0}));
 assert.equal(JSON.stringify(s),before);
});
test('distinta partición temporal produce indicadores equivalentes',()=>{
 const a=new Simulation(),b=new Simulation();a.advance(30);
 for(let i=0;i<600;i++)b.advance(.05);
 for(const key of ['co','map','edv'])assert.ok(Math.abs(a.metrics[key]-b.metrics[key])/Math.abs(a.metrics[key])<.01,key);
});
