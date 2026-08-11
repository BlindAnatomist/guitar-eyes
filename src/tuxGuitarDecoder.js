const SUPPORTED_LEGACY_HEADERS = new Map([
  ["TuxGuitar File Format - 1.0", "TG_1_0"],
  ["TuxGuitar File Format - 1.1", "TG_1_1"],
  ["TuxGuitar File Format - 1.2", "TG_1_2"],
  ["TuxGuitar File Format - 1.3", "TG_1_3"],
  ["TuxGuitar File Format - 1.5", "TG_1_5"],
]);
const READ_ONLY_LEGACY_HEADERS = new Set([
  "TG_DEVEL-0.01",
  "TG_DEVEL-0.8",
  "TuxGuitar File Format - 0.9",
]);
const UPSTREAM_RELEASE = "2.0.1";
const UPSTREAM_COMMIT = "533efa74e6a56bdae28bb776358305607c79cbff";
const MODERN_VERSION_TEXT = "TuxGuitar_file_format 2.0.0";
const MAX_ARCHIVE_BYTES = 16 * 1024 * 1024;
const MAX_ENTRIES = 64;
const MAX_XML_BYTES = 8 * 1024 * 1024;
const MAX_TRACKS = 32;
const MAX_MEASURES = 4096;
const MAX_BEATS = 200000;
const EFFECT_PALM_MUTE = 0x002000;

export class TuxGuitarImportError extends Error {
  constructor(message, code = "TUXGUITAR_IMPORT_ERROR") {
    super(message);
    this.name = "TuxGuitarImportError";
    this.code = code;
  }
}
function fail(message, code) { throw new TuxGuitarImportError(message, code); }
function requireValue(condition, message, code) { if (!condition) fail(message, code); }

class LegacyReader {
  constructor(bytes) { this.bytes = bytes; this.offset = 0; }
  need(count, label = "field") {
    if (this.offset + count > this.bytes.length) fail(`The TuxGuitar ${label} is truncated.`, "TRUNCATED_TUXGUITAR_FILE");
  }
  u8(label) { this.need(1, label); return this.bytes[this.offset++]; }
  u16(label) { this.need(2,label); const v=(this.bytes[this.offset]<<8)|this.bytes[this.offset+1]; this.offset+=2; return v; }
  u32(label) { this.need(4,label); const v=(this.bytes[this.offset]*0x1000000)+(this.bytes[this.offset+1]<<16)+(this.bytes[this.offset+2]<<8)+this.bytes[this.offset+3]; this.offset+=4; return v>>>0; }
  string8(label) { const n=this.u8(`${label} length`); this.need(n*2,label); let s=""; for(let i=0;i<n;i++) s+=String.fromCharCode(this.u16(label)); return s; }
  string32(label) { const n=this.u32(`${label} length`); requireValue(n<=1000000, `The TuxGuitar ${label} is unreasonably large.`, "TUXGUITAR_STRING_LIMIT"); this.need(n*2,label); let s=""; for(let i=0;i<n;i++) s+=String.fromCharCode(this.u16(label)); return s; }
}

function readDuration(reader, context) {
  const flags=reader.u8(`${context} duration flags`);
  requireValue((flags & ~0x07)===0, `${context} uses unknown duration flags.`, "UNSUPPORTED_TUXGUITAR_DURATION");
  const value=reader.u8(`${context} duration value`);
  requireValue([1,2,4,8,16,32,64].includes(value), `${context} uses unsupported duration value ${value}.`, "UNSUPPORTED_TUXGUITAR_DURATION");
  const dots=(flags&0x02)?2:(flags&0x01)?1:0;
  let tupletNumerator=-1, tupletDenominator=-1;
  if(flags&0x04){ tupletNumerator=reader.u8(`${context} tuplet enters`); tupletDenominator=reader.u8(`${context} tuplet times`); }
  return {durationDenominator:value,dots,tupletNumerator,tupletDenominator};
}
function durationTicks(duration) {
  requireValue(duration.dots===0 && duration.tupletNumerator===-1, "The TuxGuitar proof profile does not include dotted or tuplet timing.", "UNSUPPORTED_TUXGUITAR_DURATION");
  return 3840 / duration.durationDenominator;
}
function readEffect(reader, context) {
  const flags=(reader.u8(`${context} effect flags`)<<16)|(reader.u8(`${context} effect flags`)<<8)|reader.u8(`${context} effect flags`);
  requireValue((flags & ~EFFECT_PALM_MUTE)===0, `${context} uses a TuxGuitar note effect outside the current palm-mute proof profile.`, "UNSUPPORTED_TUXGUITAR_EFFECT");
  return (flags&EFFECT_PALM_MUTE)?["palm mute"]:[];
}
function readNotes(reader, context) {
  const notes=[]; let more=true; let guard=0;
  while(more){
    if(++guard>64) fail(`${context} contains too many simultaneous notes.`, "TUXGUITAR_NOTE_LIMIT");
    const flags=reader.u8(`${context} note flags`);
    requireValue((flags & ~0x0f)===0, `${context} uses unknown note flags.`, "UNSUPPORTED_TUXGUITAR_NOTE");
    const fret=reader.u8(`${context} fret`); const sourceString=reader.u8(`${context} string`);
    if(flags&0x08) reader.u8(`${context} velocity`);
    const techniques=(flags&0x04)?readEffect(reader,context):[];
    requireValue((flags&0x02)===0, `${context} contains a tied note, outside the first TuxGuitar proof profile.`, "UNSUPPORTED_TUXGUITAR_TIE");
    notes.push({sourceString,fret,visible:true,isDead:false,techniques}); more=Boolean(flags&0x01);
  }
  return notes;
}
function readMeasureHeader(reader, prior, index) {
  const context=`TuxGuitar measure ${index+1}`; const flags=reader.u8(`${context} header flags`);
  requireValue((flags & ~0x7f)===0, `${context} uses unknown measure-header flags.`, "UNSUPPORTED_TUXGUITAR_MEASURE_HEADER");
  requireValue((flags & 0x7c)===0, `${context} uses repeats, alternatives, markers, or triplet-feel metadata outside the first TuxGuitar profile.`, "UNSUPPORTED_TUXGUITAR_MEASURE_STRUCTURE");
  let numerator=prior?.numerator??4, denominator=prior?.denominator??4;
  if(flags&0x01){ numerator=reader.u8(`${context} numerator`); const d=readDuration(reader,`${context} denominator`); requireValue(d.dots===0&&d.tupletNumerator===-1,"A TuxGuitar time-signature denominator uses unsupported timing.","UNSUPPORTED_TUXGUITAR_METER"); denominator=d.durationDenominator; }
  if(flags&0x02) reader.u16(`${context} tempo`);
  requireValue(numerator===4&&denominator===4, `${context} uses ${numerator}/${denominator}; this first TuxGuitar checkpoint is bounded to 4/4.`, "UNSUPPORTED_TUXGUITAR_METER");
  return {numerator,denominator};
}
function readLegacyMeasure10(reader, header, measureIndex, startTicks) {
  const flags=reader.u8(`measure ${measureIndex+1} flags`); requireValue((flags&~0x03)===0,"A TuxGuitar measure uses unsupported clef or key metadata flags.","UNSUPPORTED_TUXGUITAR_MEASURE");
  let currentDuration={durationDenominator:4,dots:0,tupletNumerator:-1,tupletDenominator:-1}; const beats=[]; let more=true; let cursor=startTicks; let guard=0;
  while(more){ if(++guard>MAX_BEATS) fail("A TuxGuitar measure exceeds the beat limit.","TUXGUITAR_BEAT_LIMIT"); const h=reader.u8("beat flags"); requireValue((h&~0x1f)===0,"A TuxGuitar beat uses unknown flags.","UNSUPPORTED_TUXGUITAR_BEAT"); requireValue((h&0x18)===0,"Chord-diagram or text objects are outside the first TuxGuitar proof profile.","UNSUPPORTED_TUXGUITAR_BEAT_OBJECT"); if(h&0x02) currentDuration=readDuration(reader,"beat"); const notes=(h&0x04)?readNotes(reader,`Measure ${measureIndex+1} beat ${beats.length+1}`):[]; beats.push({startTicks:cursor,isRest:notes.length===0,...currentDuration,graceType:"none",techniques:[],notes}); cursor+=durationTicks(currentDuration); more=Boolean(h&0x01); }
  if(flags&0x01) requireValue(reader.u8("clef")===1,"Only treble-clef TuxGuitar guitar measures are accepted in this checkpoint.","UNSUPPORTED_TUXGUITAR_CLEF");
  if(flags&0x02) requireValue(reader.u8("key signature")===0,"Key-signature changes are outside the first TuxGuitar profile.","UNSUPPORTED_TUXGUITAR_KEY");
  return {bar:{sourceNumber:measureIndex+1,timeSignatureNumerator:header.numerator,timeSignatureDenominator:header.denominator,repeatStart:false,repeatCount:0,alternateEndings:0,voices:[{beats}]},endTicks:cursor};
}
function readLegacyMeasure11(reader, header, measureIndex, startTicks) {
  const flags=reader.u8(`measure ${measureIndex+1} flags`); requireValue((flags&~0x03)===0,"A TuxGuitar measure uses unsupported flags.","UNSUPPORTED_TUXGUITAR_MEASURE");
  let voiceFlags=0,currentDuration={durationDenominator:4,dots:0,tupletNumerator:-1,tupletDenominator:-1}; const beats=[];let more=true,cursor=startTicks,guard=0;
  while(more){ if(++guard>MAX_BEATS)fail("A TuxGuitar measure exceeds the beat limit.","TUXGUITAR_BEAT_LIMIT");const h=reader.u8("beat flags");requireValue((h&0x0e)===0,"Stroke, chord-diagram, or text objects are outside the first TuxGuitar profile.","UNSUPPORTED_TUXGUITAR_BEAT_OBJECT");requireValue((h&0xc0)===0,"A second active TuxGuitar voice is outside the first profile.","MULTIPLE_TUXGUITAR_VOICES");requireValue((h&0x10)!==0,"A TuxGuitar beat contains no primary voice.","EMPTY_TUXGUITAR_BEAT"); if(h&0x20)voiceFlags=reader.u8("voice flags");requireValue((voiceFlags&~0x0f)===0,"A TuxGuitar voice uses unknown flags.","UNSUPPORTED_TUXGUITAR_VOICE");requireValue((voiceFlags&0x0c)===0,"Explicit TuxGuitar stem direction is outside the first profile.","UNSUPPORTED_TUXGUITAR_VOICE_DIRECTION");if(voiceFlags&0x02)currentDuration=readDuration(reader,"voice");const notes=(voiceFlags&0x01)?readNotes(reader,`Measure ${measureIndex+1} beat ${beats.length+1}`):[];beats.push({startTicks:cursor,isRest:notes.length===0,...currentDuration,graceType:"none",techniques:[],notes});cursor+=durationTicks(currentDuration);more=Boolean(h&0x01); }
  if(flags&0x01)requireValue(reader.u8("clef")===1,"Only treble-clef TuxGuitar guitar measures are accepted in this checkpoint.","UNSUPPORTED_TUXGUITAR_CLEF"); if(flags&0x02)requireValue(reader.u8("key signature")===0,"Key-signature changes are outside the first profile.","UNSUPPORTED_TUXGUITAR_KEY");
  return {bar:{sourceNumber:measureIndex+1,timeSignatureNumerator:header.numerator,timeSignatureDenominator:header.denominator,repeatStart:false,repeatCount:0,alternateEndings:0,voices:[{beats}]},endTicks:cursor};
}
function skipLocalChannel(reader, version) { if(version==="TG_1_0") { const h=reader.u8("channel flags"); requireValue(h===0,"Solo/mute channel flags are outside the first TuxGuitar 1.0 profile.","UNSUPPORTED_TUXGUITAR_TRACK_STATE"); } for(let i=0;i<9;i++) reader.u8("channel data"); }
function readGlobalChannel(reader){ reader.u16("channel id"); for(let i=0;i<8;i++)reader.u8("channel data"); reader.string8("channel name"); const params=reader.u16("channel parameter count"); for(let i=0;i<params;i++){reader.string8("channel parameter key");reader.string32("channel parameter value");} }
function mapStrings(track){const n=track.staves[0].tuningMidiHighToLow.length;track.staves[0].bars.forEach(bar=>bar.voices.forEach(voice=>voice.beats.forEach(beat=>beat.notes.forEach(note=>{requireValue(note.sourceString>=1&&note.sourceString<=n,"A TuxGuitar note references a string outside the track tuning.","TUXGUITAR_STRING_OUT_OF_RANGE");note.stringNumberLowToHigh=n-note.sourceString+1;delete note.sourceString;}))));}
function readLegacy(bytes){ const r=new LegacyReader(bytes); const header=r.string8("version"); if(READ_ONLY_LEGACY_HEADERS.has(header))fail(`TuxGuitar ${header} is recognized as a historical read-only generation, but this checkpoint does not import it yet.`,"DEFERRED_TUXGUITAR_LEGACY_VERSION"); const sourceVersion=SUPPORTED_LEGACY_HEADERS.get(header); requireValue(sourceVersion,"The .tg file does not carry a supported TuxGuitar 1.0, 1.1, 1.2, 1.3, or 1.5 header.","UNSUPPORTED_TUXGUITAR_VERSION");
  const title=r.string8("song name");r.string8("artist");r.string8("album");r.string8("author"); if(!["TG_1_0","TG_1_1"].includes(sourceVersion)){r.string8("date");r.string8("copyright");r.string8("writer");r.string8("transcriber");r.string32("comments");}
  if(["TG_1_3","TG_1_5"].includes(sourceVersion)){const cc=r.u8("channel count");requireValue(cc<=64,"The TuxGuitar file contains too many channels.","TUXGUITAR_CHANNEL_LIMIT");for(let i=0;i<cc;i++)readGlobalChannel(r);}
  const measureCount=r.u16("measure count"); requireValue(measureCount>0&&measureCount<=MAX_MEASURES,"The TuxGuitar measure count is outside the checkpoint limit.","TUXGUITAR_MEASURE_LIMIT"); const headers=[];let prior=null;for(let i=0;i<measureCount;i++){prior=readMeasureHeader(r,prior,i);headers.push(prior);}
  const trackCount=r.u8("track count");requireValue(trackCount>0&&trackCount<=MAX_TRACKS,"The TuxGuitar track count is outside the checkpoint limit.","TUXGUITAR_TRACK_LIMIT");const tracks=[];
  for(let ti=0;ti<trackCount;ti++){const th=r.u8("track flags");const allowed=sourceVersion==="TG_1_0"?0x01:0x07;requireValue((th&~allowed)===0,"A TuxGuitar track uses unknown flags.","UNSUPPORTED_TUXGUITAR_TRACK");requireValue((th&allowed)===0,"Solo, mute, or lyric track state is outside the first TuxGuitar profile.","UNSUPPORTED_TUXGUITAR_TRACK_STATE");const name=r.string8("track name");if(["TG_1_3","TG_1_5"].includes(sourceVersion))r.u16("track channel id");else skipLocalChannel(r,sourceVersion);let startTicks=960;const bars=[];for(let mi=0;mi<measureCount;mi++){const parsed=sourceVersion==="TG_1_0"?readLegacyMeasure10(r,headers[mi],mi,startTicks):readLegacyMeasure11(r,headers[mi],mi,startTicks);bars.push(parsed.bar);startTicks=parsed.endTicks;}const sc=r.u8("string count");requireValue(sc===6,"The first TuxGuitar checkpoint accepts one six-string guitar staff only.","UNSUPPORTED_TUXGUITAR_STRING_COUNT");const tuning=[];for(let i=0;i<sc;i++)tuning.push(r.u8("tuning"));r.u8("track offset");r.u8("track color");r.u8("track color");r.u8("track color");const track={name:name||`Track ${ti+1}`,shortName:"",isPercussion:false,staves:[{tuningMidiHighToLow:tuning,bars}]};mapStrings(track);tracks.push(track);}
  requireValue(r.offset===bytes.length,"The TuxGuitar legacy file contains trailing data outside the bounded profile.","UNSUPPORTED_TUXGUITAR_TRAILING_DATA");return {schemaVersion:1,sourceVersion,title:title||"TuxGuitar tablature",tracks,versionEvidence:{schemaVersion:1,containerFamily:"TUXGUITAR_LEGACY_BINARY",extensionFamily:".tg",formatVersion:header,upstreamRelease:UPSTREAM_RELEASE,upstreamCommit:UPSTREAM_COMMIT,declaredTrackCount:trackCount,decodedTrackCount:tracks.length}};
}

function findEocd(view){for(let o=view.byteLength-22;o>=Math.max(0,view.byteLength-65557);o--)if(view.getUint32(o,true)===0x06054b50&&o+22+view.getUint16(o+20,true)===view.byteLength)return o;fail("The modern TuxGuitar .tg ZIP central directory is missing.","INVALID_TUXGUITAR_ZIP");}
function parseZip(bytes){requireValue(bytes.length<=MAX_ARCHIVE_BYTES,"The TuxGuitar archive exceeds the checkpoint size limit.","TUXGUITAR_ARCHIVE_LIMIT");const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),e=findEocd(v),count=v.getUint16(e+10,true),size=v.getUint32(e+12,true),off=v.getUint32(e+16,true);requireValue(count<=MAX_ENTRIES&&off+size<=e,"The TuxGuitar archive central directory is invalid or too large.","INVALID_TUXGUITAR_ZIP");let c=off;const entries=[];const dec=new TextDecoder("utf-8",{fatal:true});for(let i=0;i<count;i++){requireValue(v.getUint32(c,true)===0x02014b50,"A TuxGuitar ZIP central entry is invalid.","INVALID_TUXGUITAR_ZIP");const flags=v.getUint16(c+8,true),method=v.getUint16(c+10,true),cs=v.getUint32(c+20,true),us=v.getUint32(c+24,true),nl=v.getUint16(c+28,true),xl=v.getUint16(c+30,true),cl=v.getUint16(c+32,true),lo=v.getUint32(c+42,true);requireValue((flags&1)===0&&(method===0||method===8),"The TuxGuitar ZIP uses encryption or unsupported compression.","UNSUPPORTED_TUXGUITAR_ZIP");const name=dec.decode(bytes.subarray(c+46,c+46+nl));entries.push({name,method,cs,us,lo});c+=46+nl+xl+cl;}return {view:v,entries};}
async function inflateRaw(bytes,max){requireValue(typeof DecompressionStream==="function","This browser cannot expand compressed TuxGuitar archive entries.","TUXGUITAR_DECOMPRESSION_UNAVAILABLE");let s;try{s=new DecompressionStream("deflate-raw");}catch{fail("This browser cannot expand raw DEFLATE TuxGuitar entries.","TUXGUITAR_DECOMPRESSION_UNAVAILABLE");}const ab=await new Response(new Blob([bytes]).stream().pipeThrough(s)).arrayBuffer();const out=new Uint8Array(ab);requireValue(out.length<=max,"A TuxGuitar archive entry exceeds the extraction limit.","TUXGUITAR_ARCHIVE_EXPANSION_LIMIT");return out;}
async function zipEntry(bytes,zip,name,max){const matches=zip.entries.filter(e=>e.name===name);requireValue(matches.length===1,`The modern TuxGuitar archive must contain exactly one ${name}.`,"INVALID_TUXGUITAR_ZIP");const e=matches[0],v=zip.view,o=e.lo;requireValue(v.getUint32(o,true)===0x04034b50,`${name} has an invalid local ZIP header.`,"INVALID_TUXGUITAR_ZIP");const nl=v.getUint16(o+26,true),xl=v.getUint16(o+28,true),start=o+30+nl+xl,end=start+e.cs;requireValue(end<=bytes.length&&e.us<=max,`${name} exceeds the extraction limit or is truncated.`,"TUXGUITAR_ARCHIVE_EXPANSION_LIMIT");const raw=bytes.subarray(start,end),out=e.method===0?new Uint8Array(raw):await inflateRaw(raw,max);requireValue(out.length===e.us,`${name} expanded to an unexpected size.`,"INVALID_TUXGUITAR_ZIP");return out;}
function direct(node,name){return Array.from(node?.children||[]).filter(n=>n.localName===name||n.nodeName===name);}
function one(node,name,required=true){const a=direct(node,name);if(required)requireValue(a.length===1,`The TuxGuitar XML requires one ${name} element.`,"INVALID_TUXGUITAR_XML");else requireValue(a.length<=1,`The TuxGuitar XML contains duplicate ${name} elements.`,"INVALID_TUXGUITAR_XML");return a[0]||null;}
function text(node,name,d=""){const n=one(node,name,false);return n?String(n.textContent||"").trim():d;}
function intText(node,name,d=null){const s=text(node,name,d===null?"":String(d));const n=Number(s);requireValue(Number.isInteger(n),`The TuxGuitar XML ${name} value is invalid.`,"INVALID_TUXGUITAR_XML");return n;}
function parseModernXml(source){requireValue(!/<!DOCTYPE\s|<!ENTITY\s/i.test(source),"The TuxGuitar XML contains a document type or custom entity declaration.","UNSAFE_TUXGUITAR_XML");requireValue(typeof DOMParser==="function","This browser cannot parse TuxGuitar XML.","TUXGUITAR_DOM_UNAVAILABLE");const doc=new DOMParser().parseFromString(source,"application/xml");requireValue(doc.getElementsByTagName("parsererror").length===0,"The TuxGuitar content.xml is malformed.","INVALID_TUXGUITAR_XML");const root=doc.documentElement;requireValue(root?.nodeName==="TuxGuitarFile","The TuxGuitar XML root is invalid.","INVALID_TUXGUITAR_XML");const ver=one(root,"TGVersion");requireValue(ver.getAttribute("major")==="2"&&ver.getAttribute("minor")==="0","The TuxGuitar XML reports an unsupported native major/minor version.","UNSUPPORTED_TUXGUITAR_VERSION");const song=one(root,"TGSong");const title=text(song,"name","TuxGuitar tablature");const hs=direct(song,"TGMeasureHeader");requireValue(hs.length>0&&hs.length<=MAX_MEASURES,"The TuxGuitar measure-header count is outside the limit.","TUXGUITAR_MEASURE_LIMIT");const headers=hs.map((h,i)=>{requireValue(direct(h,"repeatOpen").length===0&&direct(h,"repeatClose").length===0&&direct(h,"repeatAlternative").length===0&&direct(h,"marker").length===0,"Repeats or markers are outside the first TuxGuitar profile.","UNSUPPORTED_TUXGUITAR_MEASURE_STRUCTURE");const ts=one(h,"timeSignature");const numerator=Number(ts.getAttribute("numerator")),denominator=Number(ts.getAttribute("denominator"));requireValue(numerator===4&&denominator===4,`TuxGuitar measure ${i+1} is not 4/4.`,"UNSUPPORTED_TUXGUITAR_METER");return {numerator,denominator};});const trackNodes=direct(song,"TGTrack");requireValue(trackNodes.length>0&&trackNodes.length<=MAX_TRACKS,"The TuxGuitar track count is outside the limit.","TUXGUITAR_TRACK_LIMIT");const tracks=trackNodes.map((tn,ti)=>{requireValue(!one(tn,"soloMute",false),"Solo/mute track state is outside the first TuxGuitar profile.","UNSUPPORTED_TUXGUITAR_TRACK_STATE");const tuning=direct(tn,"TGString").map(n=>Number(String(n.textContent||"").trim()));requireValue(tuning.length===6&&tuning.every(Number.isInteger),"The first TuxGuitar checkpoint accepts one six-string guitar staff only.","UNSUPPORTED_TUXGUITAR_STRING_COUNT");const ms=direct(tn,"TGMeasure");requireValue(ms.length===headers.length,"The TuxGuitar track measure count contradicts the song headers.","INVALID_TUXGUITAR_XML");const bars=[];ms.forEach((m,mi)=>{const clef=text(m,"clef",mi===0?"treble":"");if(clef)requireValue(clef==="treble","Only treble-clef guitar measures are accepted.","UNSUPPORTED_TUXGUITAR_CLEF");const key=text(m,"keySignature",mi===0?"0":"");if(key)requireValue(Number(key)===0,"Key-signature changes are outside the first profile.","UNSUPPORTED_TUXGUITAR_KEY");const beats=[];let sequential=mi===0?960:(bars.flatMap(b=>b.voices[0].beats).reduce((a,b)=>a+durationTicks(b),960));direct(m,"TGBeat").forEach((bn,bi)=>{requireValue(direct(bn,"stroke").length===0&&direct(bn,"pickStroke").length===0&&direct(bn,"chord").length===0&&direct(bn,"text").length===0,"A TuxGuitar beat object is outside the first profile.","UNSUPPORTED_TUXGUITAR_BEAT_OBJECT");const voices=direct(bn,"voice");const active=voices.filter(v=>String(v.getAttribute("empty")||"false")!=="true");requireValue(active.length===1,"The first TuxGuitar profile requires exactly one active voice per beat.","MULTIPLE_TUXGUITAR_VOICES");const vn=active[0],dn=one(vn,"duration");const value=Number(dn.getAttribute("value"));const dotted=String(dn.getAttribute("dotted")||"");requireValue(Number.isInteger(value)&&!dotted&&direct(dn,"divisionType").length===0,"The beat uses unsupported duration timing.","UNSUPPORTED_TUXGUITAR_DURATION");const notes=direct(vn,"note").map((nn,ni)=>{const fret=Number(nn.getAttribute("value")),sourceString=Number(nn.getAttribute("string"));requireValue(Number.isInteger(fret)&&Number.isInteger(sourceString),"A TuxGuitar note lacks fret/string coordinates.","INVALID_TUXGUITAR_NOTE");const childNames=direct(nn,"palmMute").length;const allowed=new Set(["palmMute"]);for(const child of Array.from(nn.children||[]))requireValue(allowed.has(child.nodeName),`A TuxGuitar note effect ${child.nodeName} is outside the first profile.`,"UNSUPPORTED_TUXGUITAR_EFFECT");requireValue(nn.getAttribute("tiedNote")!=="true","Tied notes are outside the first profile.","UNSUPPORTED_TUXGUITAR_TIE");return {sourceString,fret,visible:true,isDead:false,techniques:childNames?["palm mute"]:[]};});const isRest=notes.length===0;beats.push({startTicks:sequential,sourcePreciseStart:intText(bn,"preciseStart",sequential),isRest,durationDenominator:value,dots:0,tupletNumerator:-1,tupletDenominator:-1,graceType:"none",techniques:[],notes});sequential+=durationTicks(beats.at(-1));});bars.push({sourceNumber:mi+1,timeSignatureNumerator:headers[mi].numerator,timeSignatureDenominator:headers[mi].denominator,repeatStart:false,repeatCount:0,alternateEndings:0,voices:[{beats}]});});const track={name:text(tn,"name",`Track ${ti+1}`),shortName:"",isPercussion:false,staves:[{tuningMidiHighToLow:tuning,bars}]};mapStrings(track);return track;});return {title,tracks};}
async function readModern(bytes){const zip=parseZip(bytes),versionBytes=await zipEntry(bytes,zip,"version.txt",256),content=await zipEntry(bytes,zip,"content.xml",MAX_XML_BYTES);let versionText,xml;try{versionText=new TextDecoder("utf-8",{fatal:true}).decode(versionBytes).trim();xml=new TextDecoder("utf-8",{fatal:true}).decode(content);}catch{fail("The TuxGuitar archive text is not valid UTF-8.","INVALID_TUXGUITAR_TEXT");}requireValue(versionText===MODERN_VERSION_TEXT,`The modern .tg archive reports ${versionText||"no version"}; this checkpoint requires exact TuxGuitar file format 2.0.0 evidence.`,"UNSUPPORTED_TUXGUITAR_VERSION");const parsed=parseModernXml(xml);return {schemaVersion:1,sourceVersion:"TG_2_0",title:parsed.title,tracks:parsed.tracks,versionEvidence:{schemaVersion:1,containerFamily:"TUXGUITAR_ZIP_XML",extensionFamily:".tg",formatVersion:"2.0.0",versionText,versionEntry:"version.txt",contentEntry:"content.xml",upstreamRelease:UPSTREAM_RELEASE,upstreamCommit:UPSTREAM_COMMIT,declaredTrackCount:parsed.tracks.length,decodedTrackCount:parsed.tracks.length}};}
export async function decodeTuxGuitarFile(file){requireValue(file&&typeof file.arrayBuffer==="function","Choose a TuxGuitar .tg file first.","MISSING_TUXGUITAR_FILE");const bytes=new Uint8Array(await file.arrayBuffer());requireValue(bytes.length>0&&bytes.length<=MAX_ARCHIVE_BYTES,"The TuxGuitar file is empty or exceeds the checkpoint size limit.","TUXGUITAR_FILE_SIZE_LIMIT");return bytes[0]===0x50&&bytes[1]===0x4b?readModern(bytes):readLegacy(bytes);}
