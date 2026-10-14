import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
for(const script of scripts)new vm.Script(script);
const main=scripts.find(s=>s.includes('function sha256full'));
const core=main.slice(main.indexOf('function rotr'), main.indexOf('// ===== Web Audio'));
const ctx=vm.createContext({TextEncoder});vm.runInContext(core,ctx);
for(const text of ['','abc','wire','Привет','😀','a'.repeat(55),'a'.repeat(56),'a'.repeat(64),'a'.repeat(1000)]){
 ctx.input=text;
 const actual=vm.runInContext('sha256full(input).finalH.map(v=>v.toString(16).padStart(8,"0")).join("")',ctx);
 assert.equal(actual,crypto.createHash('sha256').update(text).digest('hex'));
}
console.log('PASS: inline scripts parse; nine independent SHA-256 reference vectors');
