import fs from 'node:fs';
const TICKS_PER_QUARTER=960, STANDARD=[64,59,55,50,45,40], DUR=new Set([2,4,8]);
class E extends Error{constructor(m,c){super(m);this.code=c}}; const fail=(m,c='INVALID_POWERTAB_LEGACY_HISTORICAL')=>{throw new E(m,c)};
class R{constructor(b){this.b=b;this.offset=0} take(n,l='data'){if(n<0||this.offset+n>this.b.length)fail(`truncated ${l}`,'TRUNCATED');let v=this.b.subarray(this.offset,this.offset+n);this.offset+=n;return v}u8(l){return this.take(1,l)[0]}i8(l){let v=this.u8(l);return v>127?v-256:v}u16(l){let b=this.take(2,l);return b[0]|b[1]<<8}u32(l){let b=this.take(4,l);return (b[0]|b[1]<<8|b[2]<<16|b[3]<<24)>>>0}i32(l){return this.u32(l)|0}bool(l){let v=this.u8(l);if(v!==0&&v!==1)fail(`bad bool ${l}`);return v===1}count(l,max=50000){let v=this.u16(l);if(v===65535)v=this.u32(l);if(v>max)fail(`count ${l}`);return v}str(l){let n=this.u8(l);if(n===255){n=this.u16(l);if(n===65535)n=this.u32(l)}let raw=this.take(n,l),s='';for(const x of raw)s+=String.fromCharCode(x);return s}}
class CM{constructor(){this.next=1;this.m=new Map()}read(r,expected,c){let tag=r.u16(c);let name;if(tag===65535){let schema=r.u16(c);if(schema!==1)fail('schema');let n=r.u16(c);name=String.fromCharCode(...r.take(n,c));this.m.set(this.next,name);this.next++}else if(tag&0x8000){name=this.m.get(tag&0x7fff);if(!name)fail('class ref')}else fail('object ref');this.next++;if(name!==expected)fail(`${c} class ${name}`)}}
function modernBar(r,c){let position=r.u8(c),data=r.u8(c),key=r.u8(c);if(key!==0)fail('key');let ts=r.u32(c),pulses=r.u8(c);if(ts!==0x1a018000||pulses!==4)fail('time');let rehearsal=r.i8(c),txt=r.str(c);if(rehearsal!==127||txt!=='')fail('rehearsal');if((data>>>5)>1||(data&31)!==0)fail('bar');return {position}}
function oldBar(r,c){let position=r.u8(c),symbol=r.u16(c),key=(symbol>>>8)&255,data=symbol&255;if(key!==0||data!==0)fail('old bar');return {position}}
function note(r,cm,c,nstr){cm.read(r,'CLineData',c);let packed=r.u8(c),si=packed>>>5,fret=packed&31;if(si>=nstr)fail('string');if(r.u16(c)!==0)fail('tech');let cc=r.u8(c);if(cc!==3)fail('note complex');for(let i=0;i<cc;i++)if(r.u32(c)!==0)fail('note complex val');return {stringNumberLowToHigh:nstr-si,fret,visible:true,isDead:false,techniques:[]}}
function pos(r,cm,c,nstr){cm.read(r,'CPosition',c);let sourcePosition=r.u8(c);if(r.u16(c)!==0)fail('beam');let raw=r.u32(c),durationDenominator=raw>>>24,flags=raw&0xffffff;if(!DUR.has(durationDenominator)||(flags&~4)!==0)fail('duration/flags');let cc=r.u8(c);if(cc!==2)fail('pos complex');for(let i=0;i<cc;i++)if(r.u32(c)!==0)fail('pos complex val');let n=r.count(c,nstr),notes=[];for(let i=0;i<n;i++)notes.push(note(r,cm,c,nstr));let isRest=!!(flags&4);if(isRest&&notes.length||!isRest&&!notes.length)fail('rest contradiction');return {sourcePosition,durationDenominator,dots:0,tupletNumerator:-1,tupletDenominator:-1,graceType:'none',isRest,techniques:[],notes}}
function staff(r,cm,c,nstr){cm.read(r,'CStaff',c);if(r.u8(c)!==6)fail('staff');r.take(4,c);let voices=[];for(let v=0;v<2;v++){let n=r.count(c,1000),ps=[];for(let i=0;i<n;i++)ps.push(pos(r,cm,c,nstr));voices.push(ps)}if(voices[1].length)fail('multivoice');return voices[0]}
function empty(r,c){if(r.count(c,1000)!==0)fail(`nonempty ${c}`)}
function guitar(r,cm,c){cm.read(r,'CGuitar',c);if(r.u8(c)!==0)fail('player');let description=r.str(c)||'PowerTab Guitar';let preset=r.u8(c),vol=r.u8(c),pan=r.u8(c);r.take(4,c);if(r.u8(c)!==0)fail('capo');let tuningName=r.str(c);r.u8(c);let n=r.u8(c),t=[...r.take(n,c)];if(n!==6||t.some((x,i)=>x!==STANDARD[i])||!tuningName||preset>127||vol>127||pan>127)fail('guitar');return {name:description,shortName:description,isPercussion:false,tuningMidiHighToLow:t}}
function split(ps,bars){let starts=[0,...bars.map(x=>x.position)];let abs=0;return starts.map((start,i)=>{let end=starts[i+1]??Infinity,sel=ps.filter(p=>p.sourcePosition>=start&&p.sourcePosition<end);let rel=0,beats=sel.map(p=>{let beat={...p,startTicks:abs+rel};rel+=(4*TICKS_PER_QUARTER)/p.durationDenominator;return beat});if(rel!==4*TICKS_PER_QUARTER)fail(`measure ${i+1}`);abs+=4*TICKS_PER_QUARTER;return {sourceNumber:i+1,timeSignatureNumerator:4,timeSignatureDenominator:4,repeatStart:false,repeatCount:0,alternateEndings:0,voices:[{index:0,beats},{index:1,beats:[]}]}})}
function system(r,cm,c,g,v){cm.read(r,'CSection',c);r.take(16,c);if(v<=2){let key=r.u8(c),end=r.u16(c);if(key!==0||((end>>>8)&255)!==1||(end&255)!==0)fail('old system');r.take(4,c)}else{let end=r.u8(c);if((end>>>5)!==1||(end&31)!==0)fail('system');r.take(4,c);let start=modernBar(r,c);if(start.position!==0)fail('start')};empty(r,c);empty(r,c);empty(r,c);if(r.count(c,8)!==1)fail('staff count');let ps=staff(r,cm,c,g.tuningMidiHighToLow.length);let bn=r.count(c,64),bars=[];for(let i=0;i<bn;i++){cm.read(r,'CMusicBar',c);bars.push(v<=2?oldBar(r,c):modernBar(r,c))}return split(ps,bars)}
function score(r,cm,c,allow,v){let gn=r.count(c,32);if(allow?gn!==1:gn!==0)fail('guitar count');let g=null;for(let i=0;i<gn;i++)g=guitar(r,cm,c);for(let i=0;i<6;i++)empty(r,c);let sn=r.count(c,256);if(allow?sn!==1:sn!==0)fail('system count');let bars=[];for(let i=0;i<sn;i++)bars.push(...system(r,cm,c,g,v));return g?{...g,staves:[{tuningMidiHighToLow:g.tuningMidiHighToLow,bars}]}:null}
function header(r){if(r.u32('marker')!==0x62617470)fail('marker');let v=r.u16('version');if(v<1||v>3)fail('version');let title=r.str('title'),artist=r.str('artist');let released=r.u8('released'),releaseTitle=r.str('release title'),live=r.u8('live');if(live>1||released>10)fail('header release');r.str('composer');r.str('lyricist');r.str('arranger');if(v<=2)r.str('guitar transcriber');r.u16('year');let author=r.u8('author');if(author>1)fail('author');r.str('copyright');r.str('lyrics');if(v<=2)r.str('guitar notes');return {v,title:title||`PowerTab historical tablature`,artist}}
function font(r){r.str('font');let size=r.i32('size'),weight=r.i32('weight');r.bool('italic');r.bool('underline');r.bool('strike');r.take(4,'color');if(size<1||size>200||weight<0||weight>1000)fail('font')}
function decode(bytes){let r=new R(bytes),cm=new CM(),h=header(r),g=score(r,cm,'g',true,h.v);score(r,cm,'b',false,h.v);font(r);font(r);font(r);if(r.i32('spacing')<1)fail('spacing');r.u32('fade');r.u32('fade');if(r.offset!==bytes.length)fail(`trailing ${bytes.length-r.offset}`);let versions={1:['PTB_V10','1.0'],2:['PTB_V102','1.0.2'],3:['PTB_V15','1.5']};let [sv,pv]=versions[h.v];return {sourceVersion:sv,powerTabVersion:pv,title:h.title,tracks:[g]}}
const dir = process.argv[2] || 'fixtures/powertab-ptb-historical';
const expected = new Map([
  ['powertab-v10-original-six-position.ptb', { sourceVersion: 'PTB_V10', powerTabVersion: '1.0', bytes: 715, sha256: 'e85487ca2e71d944e67c536b0e90f6e5f424567ad3bc24601e457e7d66ae091b' }],
  ['powertab-v102-original-six-position.ptb', { sourceVersion: 'PTB_V102', powerTabVersion: '1.0.2', bytes: 715, sha256: 'ae91e9693692c764835db64b524f87f27492db4e68d8adc2d534ea6b70e413be' }],
  ['powertab-v15-original-six-position.ptb', { sourceVersion: 'PTB_V15', powerTabVersion: '1.5', bytes: 644, sha256: 'bdcdd04f0e4b1f558c0d6c8fa0f30feea78113e656530a4195c6cc683e083f53' }],
]);
const crypto = await import('node:crypto');
const results=[];
for (const [name, want] of expected) {
  const bytes=fs.readFileSync(`${dir}/${name}`);
  const sha256=crypto.createHash('sha256').update(bytes).digest('hex');
  if(bytes.length!==want.bytes||sha256!==want.sha256) fail(`${name} identity mismatch`,'IDENTITY_MISMATCH');
  const decoded=decode(bytes);
  if(decoded.sourceVersion!==want.sourceVersion||decoded.powerTabVersion!==want.powerTabVersion) fail(`${name} version mismatch`,'VERSION_MISMATCH');
  const bars=decoded.tracks[0].staves[0].bars;
  if(bars.length!==2) fail(`${name} measure count mismatch`,'SEMANTIC_MISMATCH');
  const beats=bars.flatMap(bar=>bar.voices[0].beats);
  if(beats.length!==6) fail(`${name} position count mismatch`,'SEMANTIC_MISMATCH');
  const summary=beats.map(q=>({pos:q.sourcePosition,d:q.durationDenominator,rest:q.isRest,notes:q.notes.map(n=>[n.stringNumberLowToHigh,n.fret])}));
  const wanted=[
    {pos:10,d:4,rest:false,notes:[[1,3]]},
    {pos:20,d:8,rest:false,notes:[[2,0]]},
    {pos:30,d:8,rest:false,notes:[[2,2]]},
    {pos:40,d:2,rest:false,notes:[[3,0]]},
    {pos:60,d:2,rest:true,notes:[]},
    {pos:70,d:2,rest:false,notes:[[6,0],[5,1]]},
  ];
  if(JSON.stringify(summary)!==JSON.stringify(wanted)) fail(`${name} semantic mismatch`,'SEMANTIC_MISMATCH');
  results.push({name,bytes:bytes.length,sha256,sourceVersion:decoded.sourceVersion,powerTabVersion:decoded.powerTabVersion,measures:bars.length,positions:beats.length});
}
console.log(JSON.stringify(results,null,2));
