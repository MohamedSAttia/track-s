/** Track Ford GRC — live backend (Railway Function · Bun + Redis).
    Endpoints: /api/reg · /api/progress · /api/notify · /api/trainer · /api/cert · /api/cert/verify · /api/ai
    CORS open so the platform works from Vercel, a custom domain, or even local files. */
import { createClient } from "redis";
import crypto from "node:crypto";

const TRAINER_PIN = process.env.TRAINER_PIN;
const REDIS_URL = process.env.REDIS_URL || process.env.REDIS_PRIVATE_URL || process.env.REDIS_PUBLIC_URL;
if (!REDIS_URL) throw new Error("storage_not_configured");

const client = createClient({ url: REDIS_URL });
client.on("error", () => console.error("redis connection error"));
await client.connect();

const sha = (s: string) => crypto.createHash("sha256").update(String(s)).digest("hex");
const mkTok = () => crypto.randomBytes(20).toString("hex");
const normPhone = (p: string) => String(p || "").replace(/\D/g, "").replace(/^00/, "").replace(/^966/, "0").replace(/^5/, "05");
const clip = (v: any, n: number) => String(v == null ? "" : v).trim().slice(0, n);
const clampN = (v: any, mx: number) => Math.max(0, Math.min(mx, +v || 0));

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type,x-trainer-pin,authorization,x-learner-id", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Cache-Control": "no-store" };
const J = (o: any, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", ...CORS } });
const readBody = async (req: Request) => { try { return await req.json(); } catch (e) { return {}; } };
const getJ = async (k: string) => { const v = await client.get(k); try { return v ? JSON.parse(v) : null; } catch (e) { return null; } };
const setJ = (k: string, v: any) => client.set(k, JSON.stringify(v));

// Automatic participation: exact finite catalog, independent from correctness grades.
// Catalog v1 pins current question identities and system QBANK order; never regenerate reordered IDs silently.
const PARTICIPATION_QUESTIONS = ["question:bank:1","question:bank:10","question:bank:100","question:bank:1001","question:bank:1002","question:bank:1003","question:bank:1004","question:bank:1005","question:bank:1006","question:bank:1007","question:bank:1008","question:bank:1009","question:bank:101","question:bank:1010","question:bank:1011","question:bank:1012","question:bank:1013","question:bank:1014","question:bank:1015","question:bank:1016","question:bank:1017","question:bank:1018","question:bank:1019","question:bank:102","question:bank:1020","question:bank:1021","question:bank:1022","question:bank:1023","question:bank:1024","question:bank:1025","question:bank:1026","question:bank:1027","question:bank:1028","question:bank:1029","question:bank:103","question:bank:1030","question:bank:1031","question:bank:1032","question:bank:1033","question:bank:1034","question:bank:1035","question:bank:1036","question:bank:1037","question:bank:1038","question:bank:1039","question:bank:104","question:bank:1040","question:bank:1041","question:bank:1042","question:bank:1043","question:bank:1044","question:bank:1045","question:bank:1046","question:bank:1047","question:bank:1048","question:bank:1049","question:bank:105","question:bank:1050","question:bank:1051","question:bank:1052","question:bank:1053","question:bank:1054","question:bank:1055","question:bank:1056","question:bank:1057","question:bank:1058","question:bank:1059","question:bank:106","question:bank:1060","question:bank:1061","question:bank:1062","question:bank:1063","question:bank:1064","question:bank:1065","question:bank:1067","question:bank:1068","question:bank:1069","question:bank:107","question:bank:1070","question:bank:1071","question:bank:1072","question:bank:1073","question:bank:1074","question:bank:1075","question:bank:1076","question:bank:1077","question:bank:1078","question:bank:1079","question:bank:108","question:bank:1080","question:bank:1081","question:bank:1082","question:bank:1083","question:bank:1084","question:bank:1085","question:bank:1086","question:bank:1087","question:bank:1088","question:bank:1089","question:bank:109","question:bank:1090","question:bank:1091","question:bank:1092","question:bank:1093","question:bank:1094","question:bank:1095","question:bank:1096","question:bank:1097","question:bank:11","question:bank:110","question:bank:111","question:bank:112","question:bank:113","question:bank:114","question:bank:115","question:bank:116","question:bank:117","question:bank:118","question:bank:119","question:bank:12","question:bank:120","question:bank:121","question:bank:122","question:bank:123","question:bank:124","question:bank:125","question:bank:126","question:bank:127","question:bank:128","question:bank:129","question:bank:13","question:bank:130","question:bank:131","question:bank:132","question:bank:133","question:bank:134","question:bank:135","question:bank:137","question:bank:138","question:bank:139","question:bank:14","question:bank:140","question:bank:141","question:bank:142","question:bank:143","question:bank:144","question:bank:145","question:bank:147","question:bank:148","question:bank:15","question:bank:150","question:bank:152","question:bank:154","question:bank:155","question:bank:156","question:bank:158","question:bank:159","question:bank:16","question:bank:160","question:bank:161","question:bank:162","question:bank:163","question:bank:164","question:bank:165","question:bank:166","question:bank:167","question:bank:168","question:bank:169","question:bank:17","question:bank:170","question:bank:171","question:bank:172","question:bank:173","question:bank:174","question:bank:175","question:bank:176","question:bank:177","question:bank:178","question:bank:18","question:bank:180","question:bank:182","question:bank:185","question:bank:186","question:bank:187","question:bank:188","question:bank:189","question:bank:19","question:bank:190","question:bank:191","question:bank:192","question:bank:194","question:bank:195","question:bank:196","question:bank:197","question:bank:198","question:bank:199","question:bank:2","question:bank:20","question:bank:200","question:bank:201","question:bank:203","question:bank:21","question:bank:22","question:bank:23","question:bank:24","question:bank:25","question:bank:26","question:bank:27","question:bank:28","question:bank:29","question:bank:3","question:bank:30","question:bank:31","question:bank:32","question:bank:33","question:bank:34","question:bank:35","question:bank:36","question:bank:37","question:bank:38","question:bank:39","question:bank:4","question:bank:40","question:bank:41","question:bank:42","question:bank:43","question:bank:44","question:bank:45","question:bank:46","question:bank:47","question:bank:48","question:bank:49","question:bank:5","question:bank:50","question:bank:51","question:bank:52","question:bank:53","question:bank:54","question:bank:55","question:bank:56","question:bank:57","question:bank:58","question:bank:59","question:bank:6","question:bank:60","question:bank:61","question:bank:62","question:bank:63","question:bank:64","question:bank:65","question:bank:66","question:bank:67","question:bank:68","question:bank:69","question:bank:72","question:bank:75","question:bank:76","question:bank:77","question:bank:78","question:bank:79","question:bank:8","question:bank:80","question:bank:81","question:bank:82","question:bank:83","question:bank:84","question:bank:85","question:bank:86","question:bank:87","question:bank:88","question:bank:89","question:bank:9","question:bank:90","question:bank:91","question:bank:92","question:bank:93","question:bank:94","question:bank:95","question:bank:96","question:bank:97","question:bank:98","sysq:0","sysq:1","sysq:10","sysq:100","sysq:101","sysq:102","sysq:103","sysq:104","sysq:105","sysq:106","sysq:107","sysq:108","sysq:109","sysq:11","sysq:110","sysq:111","sysq:112","sysq:113","sysq:114","sysq:115","sysq:116","sysq:117","sysq:118","sysq:119","sysq:12","sysq:120","sysq:121","sysq:122","sysq:123","sysq:124","sysq:125","sysq:126","sysq:127","sysq:128","sysq:129","sysq:13","sysq:130","sysq:131","sysq:132","sysq:133","sysq:134","sysq:135","sysq:136","sysq:137","sysq:138","sysq:139","sysq:14","sysq:140","sysq:141","sysq:142","sysq:143","sysq:144","sysq:145","sysq:146","sysq:147","sysq:148","sysq:149","sysq:15","sysq:150","sysq:151","sysq:152","sysq:153","sysq:154","sysq:155","sysq:156","sysq:157","sysq:158","sysq:159","sysq:16","sysq:160","sysq:161","sysq:162","sysq:163","sysq:164","sysq:165","sysq:166","sysq:167","sysq:168","sysq:169","sysq:17","sysq:170","sysq:171","sysq:172","sysq:173","sysq:174","sysq:175","sysq:176","sysq:177","sysq:178","sysq:179","sysq:18","sysq:180","sysq:181","sysq:182","sysq:183","sysq:184","sysq:19","sysq:2","sysq:20","sysq:21","sysq:22","sysq:23","sysq:24","sysq:25","sysq:26","sysq:27","sysq:28","sysq:29","sysq:3","sysq:30","sysq:31","sysq:32","sysq:33","sysq:34","sysq:35","sysq:36","sysq:37","sysq:38","sysq:39","sysq:4","sysq:40","sysq:41","sysq:42","sysq:43","sysq:44","sysq:45","sysq:47","sysq:48","sysq:49","sysq:5","sysq:51","sysq:52","sysq:53","sysq:54","sysq:55","sysq:56","sysq:57","sysq:58","sysq:59","sysq:6","sysq:60","sysq:61","sysq:62","sysq:63","sysq:64","sysq:65","sysq:66","sysq:67","sysq:68","sysq:69","sysq:7","sysq:70","sysq:71","sysq:72","sysq:73","sysq:74","sysq:75","sysq:76","sysq:77","sysq:78","sysq:79","sysq:8","sysq:80","sysq:81","sysq:82","sysq:83","sysq:84","sysq:85","sysq:86","sysq:87","sysq:88","sysq:89","sysq:9","sysq:90","sysq:91","sysq:92","sysq:93","sysq:94","sysq:95","sysq:96","sysq:97","sysq:98","sysq:99"];
const PARTICIPATION_ACTIVITIES = ["activity:arena:case","activity:arena:classify","activity:arena:incident","activity:arena:lines","activity:arena:match","activity:arena:order","activity:arena:team","activity:arena:viva","activity:exam:1","activity:exam:2","activity:exam:3","activity:exam:d1","activity:exam:d2","activity:exam:d3","activity:exam:d4","activity:exam:d5","activity:exam:free","plan:1.0","plan:1.1","plan:1.2","plan:1.3","plan:10.0","plan:10.1","plan:10.2","plan:10.3","plan:11.0","plan:11.1","plan:11.2","plan:11.3","plan:12.0","plan:12.1","plan:12.2","plan:12.3","plan:13.0","plan:13.1","plan:13.2","plan:13.3","plan:14.0","plan:14.1","plan:14.2","plan:14.3","plan:2.0","plan:2.1","plan:2.2","plan:2.3","plan:3.0","plan:3.1","plan:3.2","plan:3.3","plan:4.0","plan:4.1","plan:4.2","plan:4.3","plan:5.0","plan:5.1","plan:5.2","plan:5.3","plan:6.0","plan:6.1","plan:6.2","plan:6.3","plan:7.0","plan:7.1","plan:7.2","plan:7.3","plan:8.0","plan:8.1","plan:8.2","plan:8.3","plan:9.0","plan:9.1","plan:9.2","plan:9.3","systool:appetite","systool:assurance","systool:capital","systool:cascade","systool:catalog","systool:channels","systool:commsplan","systool:conflict","systool:culsurvey","systool:dashboard","systool:delphi","systool:exceptions","systool:horizon","systool:iacm","systool:incentive","systool:incidents","systool:irr","systool:lessons","systool:mvv","systool:options","systool:pdca","systool:pestle","systool:policydoc","systool:porter","systool:process","systool:protocol","systool:quant","systool:rca","systool:regwatch","systool:sanction","systool:scenario","systool:sod","systool:speakup","systool:stkreg","systool:swot","systool:tone","systool:training","systool:unified"];
const AP_catalog = new Map([...PARTICIPATION_QUESTIONS.map(id => [id,'question']), ...PARTICIPATION_ACTIVITIES.map(id => [id,'activity'])]);
const AP_maxPoints = PARTICIPATION_QUESTIONS.length + PARTICIPATION_ACTIVITIES.length * 5;
const AP_legacyMax = 100000;

// Monotonic progress helpers; authentication and account state are enforced separately.
class ProgressMergeError extends Error {
  constructor(code, status = 400) { super(code); this.status = status; }
}
const PM_object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const PM_own = (value, key) => Object.hasOwn(value, key);
const PM_forbidden = key => ['__proto__', 'prototype', 'constructor'].includes(key);
const PM_controls = /[\u0000-\u001f\u007f]/;
const PM_scalarBounds = { overall: 100, points: AP_legacyMax + AP_maxPoints, timeSec: 2000000 };
const PM_scoreBounds = { examBest: 100, examAttempts: 100000, quiz: 100, maturity: 5 };
const PM_fields = new Set(['days','overall','items','scores','points','timeSec','builders','org','at','today','revision']);
const PM_progressFields = ['days','overall','items','scores','points','timeSec','builders'];
const PM_number = (value, max) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max;
const PM_error = stored => { throw new ProgressMergeError(stored ? 'stored_progress_requires_review' : 'bad_snapshot', stored ? 409 : 400); };
function PM_dictionary(value, maxKeys, keyOK, valueOK, stored) {
  if (!PM_object(value) || Object.keys(value).length > maxKeys) PM_error(stored);
  for (const [key, entry] of Object.entries(value)) {
    if (PM_forbidden(key) || !keyOK(key) || !valueOK(entry)) PM_error(stored);
  }
}
function validateProgressSnapshot(value, stored = false) {
  if (!PM_object(value)) PM_error(stored);
  if (!PM_progressFields.some(key => PM_own(value, key))) PM_error(stored);
  if (!stored && Object.keys(value).some(key => !PM_fields.has(key))) PM_error(false);
  for (const [key, max] of Object.entries(PM_scalarBounds)) {
    if (PM_own(value,key) && !PM_number(value[key],max)) PM_error(stored);
  }
  if (PM_own(value,'days')) PM_dictionary(value.days,5,key=>/^[1-5]$/.test(key),v=>PM_number(v,100),stored);
  if (PM_own(value,'items')) PM_dictionary(value.items,256,key=>/^[A-Za-z0-9_.:-]{1,80}$/.test(key),v=>typeof v==='boolean',stored);
  if (PM_own(value,'scores')) {
    if (!PM_object(value.scores)) PM_error(stored);
    if (!stored && Object.keys(value.scores).some(key => !PM_own(PM_scoreBounds,key) && !['arena','team'].includes(key))) PM_error(false);
    for (const [key,max] of Object.entries(PM_scoreBounds)) {
      if (PM_own(value.scores,key) && !PM_number(value.scores[key],max)) PM_error(stored);
    }
    if (PM_own(value.scores,'arena')) PM_dictionary(value.scores.arena,32,key=>/^[A-Za-z0-9_.:-]{1,80}$/.test(key),v=>PM_number(v,100),stored);
    if (PM_own(value.scores,'team')) PM_dictionary(value.scores.team,100,key=>key.length>0&&key.length<=80&&key.trim()===key&&!PM_controls.test(key),v=>PM_number(v,100000),stored);
  }
  if (PM_own(value,'builders') && (!Array.isArray(value.builders) || value.builders.length>20 || value.builders.some(v=>typeof v!=='string'||v.length<1||v.length>24||PM_controls.test(v)||PM_forbidden(v)))) PM_error(stored);
  if (PM_own(value,'org') && (typeof value.org!=='string'||value.org.length>120)) PM_error(stored);
  if (PM_own(value,'at') && (!Number.isSafeInteger(value.at)||value.at<0)) PM_error(stored);
  if (PM_own(value,'today') && (!Number.isSafeInteger(value.today)||value.today<0||value.today>6)) PM_error(stored);
  if (PM_own(value,'revision') && (!Number.isSafeInteger(value.revision)||value.revision<0)) PM_error(stored);
  return value;
}
function parseStoredProgress(raw) {
  if (raw === null || raw === undefined) return null;
  let value;
  try { value = JSON.parse(raw); } catch { PM_error(true); }
  validateProgressSnapshot(value,true);
  if (PM_own(value,'participation')) validateParticipation(value.participation,value.points);
  return value;
}
function PM_maxDictionary(previous, incoming) {
  const result = Object.assign(Object.create(null), previous || {});
  for (const [key,value] of Object.entries(incoming || {})) result[key] = Math.max(result[key] || 0,value);
  return result;
}
function mergeProgressSnapshot(previous, incoming, at = Date.now()) {
  validateProgressSnapshot(incoming);
  if (previous !== null) validateProgressSnapshot(previous,true);
  const old = previous || {}, result = { ...old };
  if (!old.participation && PM_own(incoming,'points') && incoming.points > AP_legacyMax) PM_error(false);
  for (const key of Object.keys(PM_scalarBounds)) {
    if (key === 'points' && old.participation) continue;
    if (PM_own(old,key)||PM_own(incoming,key)) result[key] = Math.max(old[key] || 0,incoming[key] || 0);
  }
  if (PM_own(old,'days')||PM_own(incoming,'days')) result.days = PM_maxDictionary(old.days,incoming.days);
  if (PM_own(old,'items')||PM_own(incoming,'items')) {
    result.items = Object.assign(Object.create(null),old.items || {});
    for (const [key,value] of Object.entries(incoming.items || {})) result.items[key] = Boolean(result.items[key] || value);
  }
  if (PM_own(old,'scores')||PM_own(incoming,'scores')) {
    const a=old.scores || {},b=incoming.scores || {}; result.scores = { ...a };
    for (const key of Object.keys(PM_scoreBounds)) if (PM_own(a,key)||PM_own(b,key)) result.scores[key] = Math.max(a[key] || 0,b[key] || 0);
    for (const key of ['arena','team']) if (PM_own(a,key)||PM_own(b,key)) result.scores[key] = PM_maxDictionary(a[key],b[key]);
  }
  if (PM_own(old,'builders')||PM_own(incoming,'builders')) result.builders = [...new Set([...(old.builders || []),...(incoming.builders || [])])];
  if (PM_own(old,'org')||PM_own(incoming,'org')) result.org = old.org || incoming.org || '';
  result.at = at;
  // today is arrival metadata, not completion credit; revision is server-owned.
  if (PM_own(incoming,'today')) result.today = incoming.today;
  result.revision = (old.revision || 0) + 1;
  try { validateProgressSnapshot(result,true); }
  catch { throw new ProgressMergeError('progress_merge_limit_reached',409); }
  return result;
}
const MONOTONIC_PROGRESS_CAS = `-- trackford:monotonic-progress-v1
local user = redis.call('HGET', KEYS[2], ARGV[3])
if not user or user ~= ARGV[4] then return 0 end
local current = redis.call('GET', KEYS[1])
if (current or '') ~= ARGV[1] then return 0 end
local seenType = redis.call('TYPE', KEYS[3]).ok
if seenType ~= 'none' and seenType ~= 'hash' then return redis.error_reply('invalid_seen_type') end
redis.call('SET', KEYS[1], ARGV[2])
redis.call('HSET', KEYS[3], ARGV[3], ARGV[5])
return 1`;

// The ledger lives inside the existing progress key: deletion removes its incarnation too.
// Only this API may write ledger fields. Legacy client point calculations stop at init.
function validateParticipation(value, total) {
  const fail=()=>{throw new ProgressMergeError('stored_participation_requires_review',409);};
  if(!PM_object(value)||value.version!==1||typeof value.incarnation!=='string'||!/^[0-9a-f]{32}$/.test(value.incarnation)||!PM_number(value.legacyPoints,AP_legacyMax)||!Number.isSafeInteger(value.initializedAt)||value.initializedAt<1||!Array.isArray(value.completedIds)||value.completedIds.length>AP_catalog.size)fail();
  const ids=new Set(value.completedIds);
  if(ids.size!==value.completedIds.length||value.completedIds.some(id=>typeof id!=='string'||!AP_catalog.has(id)))fail();
  const earned=value.completedIds.reduce((n,id)=>n+(AP_catalog.get(id)==='question'?1:5),0);
  if(value.earnedPoints!==earned||total!==value.legacyPoints+earned)fail();
  return value;
}
function participationView(snapshot) {
  if(!snapshot||!PM_own(snapshot,'participation'))return null;
  const p=validateParticipation(snapshot.participation,snapshot.points);
  const questionCount=p.completedIds.filter(id=>AP_catalog.get(id)==='question').length;
  return {...p,totalPoints:snapshot.points,questionCount,activityCount:p.completedIds.length-questionCount};
}
const PARTICIPATION_CAS=`-- trackford:participation-cas-v1
local user=redis.call('HGET',KEYS[2],ARGV[3])
if not user or user~=ARGV[4] then return 0 end
local current=redis.call('GET',KEYS[1])
if (current or '')~=ARGV[1] then return 0 end
-- A single mutation means no partial ledger/balance/seen write on a Redis command error.
redis.call('SET',KEYS[1],ARGV[2])
return 1`;
function participationInput(body, init) {
  if(!PM_object(body)||body.version!==1||Object.keys(body).some(k=>!(init?['id','token','version','legacyPoints']:['id','token','version','incarnation','eventIds']).includes(k)))throw new ProgressMergeError('bad_participation');
  if(init){if(!PM_number(body.legacyPoints,AP_legacyMax))throw new ProgressMergeError('bad_legacy_points');return;}
  if(typeof body.incarnation!=='string'||!/^[0-9a-f]{32}$/.test(body.incarnation))throw new ProgressMergeError('bad_incarnation');
  if(!Array.isArray(body.eventIds)||body.eventIds.length<1||body.eventIds.length>50||body.eventIds.some(id=>typeof id!=='string'||!AP_catalog.has(id)))throw new ProgressMergeError('unknown_participation_event');
}
async function participationWrite(credentials,body,init) {
  for(let attempt=0;attempt<8;attempt++) {
    const auth=await learnerAccount(credentials),key='tf:progress:'+auth.id,raw=await client.get(key);
    const previous=parseStoredProgress(raw),existing=participationView(previous);
    if(!init&&!existing)throw new ProgressMergeError('participation_not_initialized',409);
    if(!init&&body.incarnation!==existing.incarnation)throw new ProgressMergeError('stale_participation_incarnation',409);
    const at=Date.now(),snapshot={...(previous||{points:0}),at,revision:((previous&&previous.revision)||0)+1};
    const p=existing?{...previous.participation,completedIds:[...existing.completedIds]}:{version:1,incarnation:crypto.randomBytes(16).toString('hex'),legacyPoints:Math.max((previous&&previous.points)||0,body.legacyPoints),earnedPoints:0,completedIds:[],initializedAt:at};
    const completed=new Set(p.completedIds),awardedIds=[];let addedPoints=0;
    if(!init)for(const id of body.eventIds)if(!completed.has(id)){completed.add(id);awardedIds.push(id);addedPoints+=AP_catalog.get(id)==='question'?1:5;}
    p.completedIds=[...completed];p.earnedPoints+=addedPoints;snapshot.participation=p;snapshot.points=p.legacyPoints+p.earnedPoints;
    validateProgressSnapshot(snapshot,true);validateParticipation(p,snapshot.points);
    const saved=Number(await client.sendCommand(['EVAL',PARTICIPATION_CAS,'2',key,'tf:users',raw||'',JSON.stringify(snapshot),auth.id,auth.raw]));
    if(saved===1)return{ok:true,authenticated:true,learnerId:auth.id,user:publicAccount(auth.user),at:snapshot.at,revision:snapshot.revision,snapshot,participation:participationView(snapshot),...await learnerManualSummary(auth.user,snapshot),awardedIds,addedPoints};
    if(saved!==0)throw new ProgressMergeError('participation_storage_unavailable',503);
  }
  throw new ProgressMergeError('participation_write_conflict',409);
}

// Existing-account state only. No cookies, provider credentials, or token index.
class AccountError extends Error { constructor(code,status=400){super(code);this.status=status;} }
const accountFail=(code,status=400)=>{throw new AccountError(code,status);};
const accountId=value=>typeof value==='string'&&/^[0-9a-f]{16}$/.test(value);
const accountToken=value=>typeof value==='string'&&/^[0-9a-f]{40}$/.test(value);
const safeEqual=(a,b)=>typeof a==='string'&&typeof b==='string'&&crypto.timingSafeEqual(Buffer.from(sha(a),'hex'),Buffer.from(sha(b),'hex'));
function accountBlocked(user){
  if((user.blocked!==undefined&&typeof user.blocked!=='boolean')||(user.suspended!==undefined&&typeof user.suspended!=='boolean')||(user.status!==undefined&&!['active','blocked','suspended'].includes(user.status)))accountFail('invalid_account',409);
  return user.blocked===true||user.suspended===true||user.status==='blocked'||user.status==='suspended';
}
function accountRecord(raw,id){let user;try{user=JSON.parse(raw);}catch{accountFail('invalid_account',409);}if(!user||typeof user!=='object'||Array.isArray(user)||user.id!==id)accountFail('invalid_account',409);accountBlocked(user);return user;}
function publicAccount(user){const{pinHash,tok,...pub}=user;const blocked=accountBlocked(user);return{...pub,status:blocked?'blocked':'active',blocked};}
const ACCOUNT_CAS=`-- trackford:account-cas-v1
local current=redis.call('HGET',KEYS[1],ARGV[1])
if (current or '')~=ARGV[2] then return 0 end
redis.call('HSET',KEYS[1],ARGV[1],ARGV[3])
return 1`;
const AUTH_RATE=`-- trackford:auth-rate-v1
local count=redis.call('INCR',KEYS[1])
if count==1 then redis.call('EXPIRE',KEYS[1],tonumber(ARGV[1])) end
return count`;
async function authRate(scope,key,limit,seconds){const n=Number(await client.sendCommand(['EVAL',AUTH_RATE,'1','tf:rate:'+scope+':'+sha(key),String(seconds)]));if(!Number.isSafeInteger(n)||n<1)accountFail('rate_unavailable',503);if(n>limit)accountFail('rate_limited',429);}
const requestIp=req=>String(req.headers.get('x-forwarded-for')||req.headers.get('x-real-ip')||'unknown').split(',').at(-1).trim().slice(0,100);
async function saveAccount(id,raw,user){return Number(await client.sendCommand(['EVAL',ACCOUNT_CAS,'1','tf:users',id,raw||'',JSON.stringify(user)]))===1;}
async function updateAccount(id,change){if(!accountId(id))accountFail('bad_id');for(let attempt=0;attempt<8;attempt++){const raw=await client.hGet('tf:users',id);if(!raw)accountFail('not_found',404);const current=accountRecord(raw,id),updated=change(current);if(updated===null)return{user:current,changed:false};if(await saveAccount(id,raw,updated))return{user:updated,changed:true};}accountFail('account_write_conflict',409);}
async function trainerAccount(req,q){
  if(typeof TRAINER_PIN!=='string'||!TRAINER_PIN.trim())accountFail('trainer_not_configured',503);
  const header=req.headers.get('x-trainer-pin'),query=q.get('pin');
  if(q.getAll('pin').length>1||(header!==null&&query!==null&&header!==query))accountFail('conflicting_credentials');
  await authRate('trainer-requests','all',600,60);await authRate('trainer-ip',requestIp(req),120,60);
  const failureKey='tf:rate:trainer-fail:'+sha(requestIp(req)),failureRaw=await client.get(failureKey),failures=Number(failureRaw);
  if(!Number.isSafeInteger(failures)||failures<0)accountFail('rate_unavailable',503);if(failures>=10)accountFail('rate_limited',429);
  if(!safeEqual(header??query??'',TRAINER_PIN)){await authRate('trainer-fail',requestIp(req),10,900);accountFail('bad_pin',401);}
}
function learnerCredentials(req,q,body={}){
  for(const name of ['id','token'])if(q.getAll(name).length>1)accountFail('conflicting_credentials');
  const ids=[req.headers.get('x-learner-id'),q.get('id'),body.id].filter(v=>v!==undefined&&v!==null);
  if(!ids.length||ids.some(v=>!accountId(v))||new Set(ids).size!==1)accountFail('bad_request');
  const header=req.headers.get('authorization');let bearer;
  if(header!==null){const match=/^Bearer ([0-9a-f]{40})$/.exec(header);if(!match)accountFail('bad_token',401);bearer=match[1];}
  const tokens=[bearer,q.get('token'),body.token].filter(v=>v!==undefined&&v!==null);
  if(!tokens.length||tokens.some(v=>!accountToken(v))||new Set(tokens).size!==1)accountFail('bad_token',401);
  return{id:ids[0],token:tokens[0]};
}
async function learnerAccount(credentials){const{id,token}=credentials,raw=await client.hGet('tf:users',id);if(!raw)accountFail('not_found',404);const user=accountRecord(raw,id);if(accountBlocked(user))accountFail('account_blocked',403);if(!accountToken(user.tok)||!safeEqual(user.tok,token))accountFail('bad_token',401);return{id,token,raw,user};}
function hasLearnerCredentials(req,q){return req.headers.has('authorization')||req.headers.has('x-learner-id')||q.has('id')||q.has('token');}
const ACCOUNT_DELETE_CAS=`-- trackford:account-delete-cas-v1
local current=redis.call('HGET',KEYS[1],ARGV[1])
if not current or current~=ARGV[2] then return 0 end
local seenType=redis.call('TYPE',KEYS[3]).ok
if seenType~='none' and seenType~='hash' then return redis.error_reply('invalid_seen_type') end
redis.call('HDEL',KEYS[1],ARGV[1])
redis.call('DEL',KEYS[2])
redis.call('HDEL',KEYS[3],ARGV[1])
return 1`;
async function deleteAccount(id){
  if(!accountId(id))accountFail('bad_id');
  for(let attempt=0;attempt<8;attempt++){
    const raw=await client.hGet('tf:users',id);if(!raw)accountFail('not_found',404);
    const deleted=await client.sendCommand(['EVAL',ACCOUNT_DELETE_CAS,'3','tf:users','tf:progress:'+id,'tf:seen',id,raw]);
    if(Number(deleted)===1)return{id};
  }
  accountFail('account_write_conflict',409);
}


// Trainer-only profiles are not login accounts and never reserve registration credentials.
const PENDING_KEY='tf:pending-participants:v1';
const PENDING_LIMIT=2000;
const pendingId=value=>typeof value==='string'&&/^p_[0-9a-f]{32}$/.test(value);
const pendingEmail=value=>pendingText(value,1,120)&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const pendingText=(value,min,max)=>typeof value==='string'&&value.trim()===value&&value.length>=min&&value.length<=max&&!PM_controls.test(value);
function pendingState(raw){
  const fail=()=>bonusFail('pending_storage_requires_review',409);
  if(raw===null)return{version:1,revision:0,profiles:[]};
  let state;try{state=JSON.parse(raw);}catch{fail();}
  if(!PM_object(state)||Object.keys(state).some(k=>!['version','revision','profiles'].includes(k))||state.version!==1||!Number.isSafeInteger(state.revision)||state.revision<0||!Array.isArray(state.profiles)||state.profiles.length>PENDING_LIMIT||state.revision<state.profiles.length)fail();
  const ids=new Set(),phones=new Set(),keys=new Set();
  for(const p of state.profiles){
    if(!PM_object(p)||Object.keys(p).some(k=>!['id','name','phone','group','email','created','status','idempotencyKey','fingerprint'].includes(k))||!pendingId(p.id)||ids.has(p.id)||!pendingText(p.name,3,80)||!pendingText(p.group,1,40)||typeof p.phone!=='string'||!/^0\d{8,9}$/.test(p.phone)||normPhone(p.phone)!==p.phone||phones.has(p.phone)||p.email!==undefined&&!pendingEmail(p.email)||!Number.isSafeInteger(p.created)||p.created<1||p.status!=='pending_activation'||!bonusRequestId(p.idempotencyKey)||keys.has(p.idempotencyKey)||typeof p.fingerprint!=='string'||! /^[0-9a-f]{64}$/.test(p.fingerprint))fail();
    ids.add(p.id);phones.add(p.phone);keys.add(p.idempotencyKey);
  }
  return state;
}
async function pendingRead(){try{const raw=await client.get(PENDING_KEY);return{raw,state:pendingState(raw)};}catch(e){if(e instanceof BonusError)throw e;bonusFail('pending_storage_unavailable',503);}}
function pendingPublic(profile,totals=new Map(),potentialAccountMatch=false){
  const {idempotencyKey,fingerprint,...pub}=profile,manualPoints=totals.get('pending:'+profile.id)||0;
  return{...pub,canLogin:false,manualPoints,bonusPoints:manualPoints,legacyPoints:null,automaticPoints:null,coursePoints:null,rankingPoints:null,progress:null,participation:null,potentialAccountMatch};
}
function registeredPhoneSet(all){
  const phones=new Set();
  for(const[id,raw]of Object.entries(all)){
    if(!accountId(id))bonusFail('pending_accounts_require_review',409);
    let user;try{user=accountRecord(raw,id);}catch{bonusFail('pending_accounts_require_review',409);}
    // Missing/invalid identity fields cannot safely prove phone uniqueness.
    if(typeof user.phone!=='string'||!/^0\d{8,9}$/.test(normPhone(user.phone))||sha(normPhone(user.phone)).slice(0,16)!==id)bonusFail('pending_accounts_require_review',409);
    phones.add(normPhone(user.phone));
  }
  return phones;
}
const PENDING_CREATE_CAS=`-- trackford:pending-create-cas-v1
local pt=redis.call('TYPE',KEYS[1]).ok
local ut=redis.call('TYPE',KEYS[2]).ok
if (pt~='none' and pt~='string') or (ut~='none' and ut~='hash') then return -1 end
if (redis.call('GET',KEYS[1]) or '')~=ARGV[1] then return 0 end
local expected=cjson.decode(ARGV[3])
local current=redis.call('HGETALL',KEYS[2])
if #current~=#expected*2 then return 0 end
for _,entry in ipairs(expected) do if redis.call('HGET',KEYS[2],entry[1])~=entry[2] then return 0 end end
redis.call('SET',KEYS[1],ARGV[2])
return 1`;
async function pendingCreate(body){
  if(!PM_object(body)||Object.keys(body).some(k=>!['action','profile','idempotencyKey'].includes(k))||body.action!=='pending_create'||!bonusRequestId(body.idempotencyKey)||!PM_object(body.profile)||Object.keys(body.profile).some(k=>!['name','phone','group','email'].includes(k)))bonusFail('bad_pending_request');
  const p=body.profile;
  if(typeof p.name!=='string'||typeof p.phone!=='string'||typeof p.group!=='string'||p.email!==undefined&&typeof p.email!=='string')bonusFail('bad_pending_profile');
  const profile={name:p.name.trim(),phone:normPhone(p.phone),group:p.group.trim(),...(p.email!==undefined&&p.email.trim()?{email:p.email.trim()}: {})};
  if(!pendingText(profile.name,3,80)||!/^0\d{8,9}$/.test(profile.phone)||!pendingText(profile.group,1,40)||profile.email!==undefined&&!pendingEmail(profile.email))bonusFail('bad_pending_profile');
  const fingerprint=sha(JSON.stringify({action:'pending_create',profile,idempotencyKey:body.idempotencyKey}));
  try{for(let attempt=0;attempt<8;attempt++){
    const{raw,state}=await pendingRead(),previous=state.profiles.find(p=>p.idempotencyKey===body.idempotencyKey);
    if(previous){if(previous.fingerprint!==fingerprint)bonusFail('pending_idempotency_conflict',409);return{ok:true,replayed:true,pendingParticipant:pendingPublic(previous,bonusTotals((await bonusRead()).state),!!await client.hGet('tf:users',sha(previous.phone).slice(0,16))),creationReceipt:{idempotencyKey:body.idempotencyKey,participantId:previous.id,profile}};}
    if(state.profiles.length>=PENDING_LIMIT)bonusFail('pending_profile_limit',409);
    if(state.profiles.some(p=>p.phone===profile.phone))bonusFail('pending_phone_exists',409);
    const all=await client.hGetAll('tf:users');if(registeredPhoneSet(all).has(profile.phone))bonusFail('registered_phone_exists',409);
    const participant={id:'p_'+crypto.randomBytes(16).toString('hex'),...profile,created:Date.now(),status:'pending_activation',idempotencyKey:body.idempotencyKey,fingerprint};
    state.profiles.push(participant);state.revision++;const next=JSON.stringify(state);pendingState(next);
    const result=Number(await client.sendCommand(['EVAL',PENDING_CREATE_CAS,'2',PENDING_KEY,'tf:users',raw||'',next,JSON.stringify(Object.entries(all))]));
    if(result===1)return{ok:true,replayed:false,pendingParticipant:pendingPublic(participant),creationReceipt:{idempotencyKey:body.idempotencyKey,participantId:participant.id,profile}};
    if(result===-1)bonusFail('pending_storage_requires_review',409);
    if(result!==0)bonusFail('pending_storage_unavailable',503);
  }bonusFail('pending_write_conflict',409);}catch(e){if(e instanceof BonusError)throw e;bonusFail('pending_storage_unavailable',503);}
}

// Trainer administrative bonus ledger. No learner progress or exam data is written.
const BONUS_KEY='tf:bonus-ledger:v1';
const BONUS_LIMITS={award:10000,total:1000000,events:10000,awards:5000,groups:1000,renames:10000,reason:300};
class BonusError extends Error { constructor(code,status=400){super(code);this.status=status;} }
const bonusFail=(code,status=400)=>{throw new BonusError(code,status);};
const bonusLabel=value=>typeof value==='string'&&value.length>0&&value.length<=40&&value.trim()===value&&!PM_controls.test(value);
const bonusGroupId=value=>typeof value==='string'&&/^g_[0-9a-f]{32}$/.test(value);
const bonusEventId=value=>typeof value==='string'&&/^b_[0-9a-f]{32}$/.test(value);
const bonusIncarnationValue=value=>typeof value==='string'&&(value==='legacy'||/^a_[0-9a-f]{32}$/.test(value)||/^(0|[1-9][0-9]{0,15})$/.test(value)&&Number.isSafeInteger(Number(value)));
const bonusRequestId=value=>typeof value==='string'&&/^[A-Za-z0-9:_-]{16,100}$/.test(value);
function bonusIncarnation(user){
  if(user.bonusIdentity!==undefined){if(typeof user.bonusIdentity!=='string'||!/^a_[0-9a-f]{32}$/.test(user.bonusIdentity))bonusFail('invalid_account_incarnation',409);return user.bonusIdentity;}
  if(user.created===undefined)return 'legacy';
  if(!Number.isSafeInteger(user.created)||user.created<0)bonusFail('invalid_account_incarnation',409);
  return String(user.created);
}
const bonusTargetKey=target=>target.type==='user'?'user:'+target.id+':'+target.incarnation:target.type==='pending'?'pending:'+target.id:'group:'+target.id;
function bonusState(raw){
  const fail=()=>bonusFail('bonus_storage_requires_review',409);
  if(raw===null)return{version:1,revision:0,groups:[],events:[],renames:[]};
  let state;try{state=JSON.parse(raw);}catch{fail();}
  if(!PM_object(state)||state.version!==1||!Number.isSafeInteger(state.revision)||state.revision<0||!Array.isArray(state.groups)||!Array.isArray(state.events)||!Array.isArray(state.renames)||state.groups.length>BONUS_LIMITS.groups||state.events.length>BONUS_LIMITS.events||state.renames.length>BONUS_LIMITS.renames||state.revision!==state.events.length+state.renames.length)fail();
  const groups=new Map(),labels=new Set(),ids=new Map(),requests=new Set(),reversed=new Set(),totals=new Map();
  for(const group of state.groups){if(!PM_object(group)||!bonusGroupId(group.id)||!bonusLabel(group.label)||groups.has(group.id)||labels.has(group.label))fail();groups.set(group.id,group);labels.add(group.label);}
  for(let i=0;i<state.events.length;i++){
    const e=state.events[i],t=e?.target;
    if(!PM_object(e)||!bonusEventId(e.id)||ids.has(e.id)||e.sequence!==i+1||!['award','reversal'].includes(e.kind)||e.actor!=='trainer'||!Number.isSafeInteger(e.at)||e.at<0||typeof e.reason!=='string'||e.reason.length<3||e.reason.length>BONUS_LIMITS.reason||e.reason.trim()!==e.reason||PM_controls.test(e.reason)||!bonusRequestId(e.idempotencyKey)||requests.has(e.idempotencyKey)||typeof e.fingerprint!=='string'||!/^[0-9a-f]{64}$/.test(e.fingerprint)||!Number.isSafeInteger(e.points)||e.points<1||e.points>BONUS_LIMITS.award||!PM_object(t))fail();
    if(t.type==='user'){if(!accountId(t.id)||!bonusIncarnationValue(t.incarnation)||typeof t.name!=='string'||t.name.length>80||typeof t.group!=='string'||t.group.length>40)fail();}
    else if(t.type==='pending'){if(!pendingId(t.id)||!pendingText(t.name,3,80)||!pendingText(t.group,1,40))fail();}
    else if(t.type==='group'){if(!groups.has(t.id)||!bonusLabel(t.label))fail();}
    else fail();
    if(e.kind==='reversal'){
      const original=ids.get(e.originalEventId);
      if(!original||original.kind!=='award'||reversed.has(original.id)||JSON.stringify(original.target)!==JSON.stringify(t)||original.points!==e.points)fail();
      reversed.add(original.id);
    }else if(e.originalEventId!==undefined)fail();
    const key=bonusTargetKey(t),total=(totals.get(key)||0)+(e.kind==='award'?e.points:-e.points);
    if(!Number.isSafeInteger(total)||total<0||total>BONUS_LIMITS.total)fail();totals.set(key,total);ids.set(e.id,e);requests.add(e.idempotencyKey);
  }
  if(state.events.filter(e=>e.kind==='award').length>BONUS_LIMITS.awards)fail();
  for(const r of state.renames)if(!PM_object(r)||!bonusGroupId(r.groupId)||!groups.has(r.groupId)||!bonusLabel(r.from)||!bonusLabel(r.to)||!Number.isSafeInteger(r.at)||r.at<0||r.actor!=='trainer')fail();
  return state;
}
function bonusTotals(state){const totals=new Map();for(const e of state.events){const key=bonusTargetKey(e.target);totals.set(key,(totals.get(key)||0)+(e.kind==='award'?e.points:-e.points));}return totals;}
const BONUS_CAS=`-- trackford:bonus-cas-v1
local function expectType(key,wanted)
 local kind=redis.call('TYPE',key).ok
 return kind=='none' or kind==wanted
end
if not expectType(KEYS[1],'string') or not expectType(KEYS[2],'hash') or not expectType(KEYS[3],'string') or not expectType(KEYS[4],'string') then return -1 end
if (redis.call('GET',KEYS[1]) or '')~=ARGV[1] then return 0 end
if ARGV[3]=='user' and (redis.call('HGET',KEYS[2],ARGV[4]) or '')~=ARGV[5] then return 0 end
if ARGV[3]=='pending' and (redis.call('GET',KEYS[4]) or '')~=ARGV[5] then return 0 end
if ARGV[3]=='config' and (redis.call('GET',KEYS[3]) or '')~=ARGV[5] then return 0 end
if ARGV[3]=='roster' then
 local witness=cjson.decode(ARGV[5])
 if (redis.call('GET',KEYS[3]) or '')~=witness.config or (redis.call('GET',KEYS[4]) or '')~=witness.pending then return 0 end
 local current=redis.call('HGETALL',KEYS[2])
 if #current~=#witness.users*2 then return 0 end
 for _,entry in ipairs(witness.users) do if redis.call('HGET',KEYS[2],entry[1])~=entry[2] then return 0 end end
end
redis.call('SET',KEYS[1],ARGV[2])
return 1`;
// Preflight every key type and expected value before any write; all renames and
// ledger mutations serialize through BONUS_KEY. Accounts retain their own CAS.
const BONUS_RENAME_CAS=`-- trackford:bonus-rename-cas-v1
local function expectType(key,wanted)
 local kind=redis.call('TYPE',key).ok
 return kind=='none' or kind==wanted
end
if not expectType(KEYS[1],'string') or not expectType(KEYS[2],'hash') or not expectType(KEYS[3],'string') or not expectType(KEYS[4],'string') then return -1 end
if (redis.call('GET',KEYS[1]) or '')~=ARGV[1] or (redis.call('GET',KEYS[3]) or '')~=ARGV[3] or (redis.call('GET',KEYS[4]) or '')~=ARGV[7] then return 0 end
local expected=cjson.decode(ARGV[5])
local changes=cjson.decode(ARGV[6])
local current=redis.call('HGETALL',KEYS[2])
if #current~=#expected*2 then return 0 end
for _,entry in ipairs(expected) do if redis.call('HGET',KEYS[2],entry[1])~=entry[2] then return 0 end end
if type(redis.acl_check_cmd)~='function' then return -2 end
for _,entry in ipairs(changes) do if not redis.acl_check_cmd('HSET',KEYS[2],entry[1],entry[2]) then return -3 end end
if not redis.acl_check_cmd('MSET',KEYS[1],ARGV[2],KEYS[3],ARGV[4],KEYS[4],ARGV[8]) then return -3 end
for _,entry in ipairs(changes) do redis.call('HSET',KEYS[2],entry[1],entry[2]) end
redis.call('MSET',KEYS[1],ARGV[2],KEYS[3],ARGV[4],KEYS[4],ARGV[8])
return 1`;
async function bonusRead(){try{const raw=await client.get(BONUS_KEY);return{raw,state:bonusState(raw)};}catch(e){if(e instanceof BonusError)throw e;bonusFail('bonus_storage_unavailable',503);}}
function bonusPayload(body){
  if(!PM_object(body)||!bonusRequestId(body.idempotencyKey)||typeof body.reason!=='string')bonusFail('bad_bonus_request');
  const reason=body.reason.trim();if(reason.length<3||reason.length>BONUS_LIMITS.reason||PM_controls.test(reason))bonusFail('bad_bonus_reason');
  if(body.action==='bonus_reverse'){
    if(Object.keys(body).some(k=>!['action','eventId','reason','idempotencyKey'].includes(k))||!bonusEventId(body.eventId))bonusFail('bad_bonus_request');
    return{action:body.action,eventId:body.eventId,reason,idempotencyKey:body.idempotencyKey};
  }
  if(body.action!=='bonus_award'||Object.keys(body).some(k=>!['action','target','points','reason','idempotencyKey'].includes(k))||!Number.isSafeInteger(body.points)||body.points<1||body.points>BONUS_LIMITS.award||!PM_object(body.target))bonusFail('bad_bonus_request');
  const t=body.target;let target;
  if(t.type==='user'&&Object.keys(t).every(k=>['type','id','incarnation'].includes(k))&&accountId(t.id)&&bonusIncarnationValue(t.incarnation))target={type:'user',id:t.id,incarnation:t.incarnation};
  else if(t.type==='pending'&&Object.keys(t).every(k=>['type','id'].includes(k))&&pendingId(t.id))target={type:'pending',id:t.id};
  else if(t.type==='group'&&Object.keys(t).every(k=>['type','group','token'].includes(k))&&bonusLabel(t.group)&&typeof t.token==='string'&&/^[0-9a-f]{64}$/.test(t.token))target={type:'group',group:t.group,token:t.token};
  else bonusFail('bad_bonus_target');
  return{action:body.action,target,points:body.points,reason,idempotencyKey:body.idempotencyKey};
}
function bonusTargetCatalog(state,cfgRaw,all,pending){
  let cfg;try{cfg=cfgRaw===null?{}:JSON.parse(cfgRaw);}catch{bonusFail('bonus_config_requires_review',409);}
  if(!PM_object(cfg))bonusFail('bonus_config_requires_review',409);
  const configured=new Set((Array.isArray(cfg.groups)?cfg.groups:[]).filter(bonusLabel)),members=new Map();
  for(const[id,raw]of Object.entries(all)){if(!accountId(id))continue;let user;try{user=accountRecord(raw,id);}catch{continue;}const label=user.group||'عام';if(!bonusLabel(label))continue;if(!members.has(label))members.set(label,[]);members.get(label).push([id,bonusIncarnation(user)]);}
  for(const p of pending.profiles){if(!members.has(p.group))members.set(p.group,[]);members.get(p.group).push([p.id,'pending']);}
  return [...new Set([...configured,...members.keys()])].sort().map(group=>{
    const stable=state.groups.find(g=>g.label===group),id=stable?.id||null;
    const token=sha(JSON.stringify(id?{group,id}:{group,id:null,configured:configured.has(group),members:(members.get(group)||[]).sort((a,b)=>a[0].localeCompare(b[0]))}));
    return{group,id,token};
  });
}
async function bonusGroupWitness(state,label,token){
  const cfgRaw=await client.get('tf:config'),all=await client.hGetAll('tf:users'),pending=await pendingRead();
  const target=bonusTargetCatalog(state,cfgRaw,all,pending.state).find(t=>t.group===label);
  if(!target)bonusFail('bonus_group_not_found',404);
  if(target.token!==token)bonusFail('bonus_target_changed',409);
  return{kind:'roster',id:'',raw:JSON.stringify({config:cfgRaw||'',users:Object.entries(all),pending:pending.raw||''})};
}

async function bonusMutate(body){
  const payload=bonusPayload(body),fingerprint=sha(JSON.stringify(payload));
  try{for(let attempt=0;attempt<8;attempt++){
    const{raw,state}=await bonusRead();
    const previous=state.events.find(e=>e.idempotencyKey===payload.idempotencyKey);
    if(previous){if(previous.fingerprint!==fingerprint)bonusFail('bonus_idempotency_conflict',409);return{ok:true,replayed:true,event:previous,bonus:bonusSummary(state)};}
    if(state.events.length>=BONUS_LIMITS.events)bonusFail('bonus_ledger_limit',409);
    if(payload.action==='bonus_award'&&state.events.filter(e=>e.kind==='award').length>=BONUS_LIMITS.awards)bonusFail('bonus_award_limit',409);
    let target,points,witness={kind:'none',id:'',raw:''},originalEventId;
    if(payload.action==='bonus_award'){
      points=payload.points;
      if(payload.target.type==='user'){
        const id=payload.target.id,userRaw=await client.hGet('tf:users',id);if(!userRaw)bonusFail('bonus_user_not_found',404);
        const user=accountRecord(userRaw,id); // Blocked accounts may receive trainer administrative bonuses.
        if(bonusIncarnation(user)!==payload.target.incarnation)bonusFail('bonus_target_changed',409);
        target={type:'user',id,incarnation:bonusIncarnation(user),name:clip(user.name,80),group:clip(user.group,40)||'عام'};
        witness={kind:'user',id,raw:userRaw};
      }else if(payload.target.type==='pending'){
        const pending=await pendingRead(),profile=pending.state.profiles.find(p=>p.id===payload.target.id);
        if(!profile)bonusFail('pending_profile_not_found',404);
        target={type:'pending',id:profile.id,name:profile.name,group:profile.group};
        witness={kind:'pending',id:profile.id,raw:pending.raw||''};
      }else{
        const label=payload.target.group;witness=await bonusGroupWitness(state,label,payload.target.token);
        let group=state.groups.find(g=>g.label===label);
        if(!group){if(state.groups.length>=BONUS_LIMITS.groups)bonusFail('bonus_group_limit',409);group={id:'g_'+crypto.randomBytes(16).toString('hex'),label};state.groups.push(group);}
        target={type:'group',id:group.id,label};
      }
    }else{
      const original=state.events.find(e=>e.id===payload.eventId);
      if(!original||original.kind!=='award')bonusFail('bonus_award_not_found',404);
      if(state.events.some(e=>e.kind==='reversal'&&e.originalEventId===original.id))bonusFail('bonus_already_reversed',409);
      target=original.target;points=original.points;originalEventId=original.id;
    }
    const current=bonusTotals(state).get(bonusTargetKey(target))||0;
    if(current+(originalEventId?-points:points)>BONUS_LIMITS.total)bonusFail('bonus_total_limit',409);
    const event={id:'b_'+crypto.randomBytes(16).toString('hex'),sequence:state.events.length+1,kind:originalEventId?'reversal':'award',target,points,reason:payload.reason,at:Date.now(),actor:'trainer',idempotencyKey:payload.idempotencyKey,fingerprint,...(originalEventId?{originalEventId}:{})};
    state.events.push(event);state.revision++;const next=JSON.stringify(state);bonusState(next);
    const result=Number(await client.sendCommand(['EVAL',BONUS_CAS,'4',BONUS_KEY,'tf:users','tf:config',PENDING_KEY,raw||'',next,witness.kind,witness.id,witness.raw]));
    if(result===-1)bonusFail('bonus_storage_requires_review',409);
    if(result===1)return{ok:true,replayed:false,event,bonus:bonusSummary(state)};
    if(result!==0)bonusFail('bonus_storage_unavailable',503);
  }bonusFail('bonus_write_conflict',409);}catch(e){if(e instanceof BonusError||e instanceof AccountError)throw e;bonusFail('bonus_storage_unavailable',503);}
}
function bonusSummary(state,before=state.events.length+1,limit=50){
  const totals=bonusTotals(state),events=state.events.filter(e=>e.sequence<before).slice(-limit).reverse();
  const reversed=new Set(state.events.filter(e=>e.kind==='reversal').map(e=>e.originalEventId));
  return{version:1,revision:state.revision,limits:BONUS_LIMITS,groups:state.groups.map(g=>({...g,points:totals.get('group:'+g.id)||0})),events:events.map(e=>({...e,reversed:reversed.has(e.id)})),eventCount:state.events.length,nextBefore:events.length&&events.at(-1).sequence>1?events.at(-1).sequence:null,renames:state.renames.slice(-50).reverse()};
}
function manualPointBreakdown(user,snapshot,totals){
  const participation=participationView(snapshot),coursePoints=PM_number(snapshot?.points,PM_scalarBounds.points)?snapshot.points:null;
  const manualBonusPoints=totals.get('user:'+user.id+':'+bonusIncarnation(user))||0;
  return{legacyPoints:participation?participation.legacyPoints:coursePoints,automaticPoints:participation?participation.earnedPoints:(coursePoints===null?null:0),manualBonusPoints,rankingPoints:coursePoints===null?null:coursePoints+manualBonusPoints};
}
async function learnerManualSummary(user,snapshot){
  try{const{state}=await bonusRead();return{...manualPointBreakdown(user,snapshot,bonusTotals(state)),manualBonusRevision:state.revision,manualBonusIncarnation:bonusIncarnation(user)};}
  catch(e){if(!(e instanceof BonusError))throw e;return{manualBonusPoints:null,rankingPoints:null,manualBonusError:e.message};}
}
async function bonusRename(from,to){
  if(!bonusLabel(from)||!bonusLabel(to))bonusFail('bad_group');
  try{for(let attempt=0;attempt<8;attempt++){
    const{raw,state}=await bonusRead(),cfgRaw=await client.get('tf:config'),pending=await pendingRead();let cfg;
    try{cfg=cfgRaw===null?{}:JSON.parse(cfgRaw);}catch{bonusFail('bonus_config_requires_review',409);}if(!PM_object(cfg)||cfg.groups!==undefined&&!Array.isArray(cfg.groups))bonusFail('bonus_config_requires_review',409);
    const all=await client.hGetAll('tf:users'),changes=[];
    for(const[id,userRaw]of Object.entries(all)){
      if(!accountId(id))continue;let user;try{user=accountRecord(userRaw,id);}catch{continue;}
      if((user.group||'عام')===from&&from!==to)changes.push([id,JSON.stringify({...user,group:to})]);
    }
    const group=state.groups.find(g=>g.label===from),destination=state.groups.find(g=>g.label===to);
    if(from!==to&&group&&destination&&group.id!==destination.id)bonusFail('bonus_group_merge_conflict',409);
    if(group&&from!==to){if(state.renames.length>=BONUS_LIMITS.renames)bonusFail('bonus_rename_limit',409);group.label=to;state.renames.push({groupId:group.id,from,to,at:Date.now(),actor:'trainer'});state.revision++;}
    const pendingMoved=from===to?0:pending.state.profiles.filter(p=>p.group===from).length;
    if(pendingMoved){for(const p of pending.state.profiles)if(p.group===from)p.group=to;pending.state.revision++;}
    cfg.groups=(cfg.groups||[]).map(g=>g===from?to:g);
    const next=JSON.stringify(state);bonusState(next);
    const result=Number(await client.sendCommand(['EVAL',BONUS_RENAME_CAS,'4',BONUS_KEY,'tf:users','tf:config',PENDING_KEY,raw||'',next,cfgRaw||'',JSON.stringify(cfg),JSON.stringify(Object.entries(all)),JSON.stringify(changes),pending.raw||'',JSON.stringify(pending.state)]));
    if(result===-1)bonusFail('bonus_storage_requires_review',409);
    if(result===-2)bonusFail('bonus_rename_acl_unavailable',503);
    if(result===-3)bonusFail('bonus_rename_acl_denied',503);
    if(result===1)return{ok:true,moved:changes.length,pendingMoved,config:cfg};
    if(result!==0)bonusFail('bonus_storage_unavailable',503);
  }bonusFail('bonus_write_conflict',409);}catch(e){if(e instanceof BonusError)throw e;bonusFail('bonus_storage_unavailable',503);}
}

await client.sendCommand(["SCRIPT","LOAD",PENDING_CREATE_CAS]);
await client.sendCommand(["SCRIPT","LOAD",BONUS_CAS]);
await client.sendCommand(["SCRIPT","LOAD",BONUS_RENAME_CAS]);
await client.sendCommand(["SCRIPT","LOAD",PARTICIPATION_CAS]);
await client.sendCommand(["SCRIPT","LOAD",MONOTONIC_PROGRESS_CAS]);
await client.sendCommand(["SCRIPT","LOAD",ACCOUNT_CAS]);
await client.sendCommand(["SCRIPT","LOAD",AUTH_RATE]);
await client.sendCommand(["SCRIPT","LOAD",ACCOUNT_DELETE_CAS]);


// ───────── Certificates & attestations (trainer-approved, publicly verifiable) ─────────
const CERT_DEFAULT={program:'Governance, Risk and Compliance Professional',programAr:'أخصائي الحوكمة والمخاطر والامتثال',kind:'Preparation Course',kindAr:'دورة تحضيرية',approvalNo:'138229',hours:'30',dates:'11–15 October 2026',datesAr:'11–15 أكتوبر 2026',signName:'Dr. Mohamed Elhefny',signTitle:'Founder & CEO',signNameAr:'د. محمد الحفني',signTitleAr:'المؤسس والرئيس التنفيذي',trainer:'Dr. Mohamed Attia',trainerAr:'د. محمد عطية',prefix:'TF-2026',site:''};
const CERT_SECRET=process.env.CERT_SECRET||sha('tf-cert:'+(process.env.TRAINER_PIN||''));
const certCfg=async()=>{const cfg=(await getJ('tf:config'))||{};return{...CERT_DEFAULT,...(cfg.cert&&typeof cfg.cert==='object'?cfg.cert:{})};};
const CERT_EN=/^[A-Za-z][A-Za-z .'\-]{2,79}$/, CERT_AR=/^[؀-ۿݐ-ݿ][؀-ۿݐ-ݿ .\-]{2,79}$/;
const certName=(v,re)=>{const s=clip(v,80).replace(/\s+/g,' ');return re.test(s)?s:null;};
const certRead=async id=>{const r=await client.hGet('tf:certs',id);try{return r?JSON.parse(r):null;}catch{return null;}};
const certCode=no=>crypto.createHmac('sha256',CERT_SECRET).update(no).digest('hex').slice(0,10).toUpperCase();
function certPublic(c){if(!c)return null;const{verify,...pub}=c;return{...pub,verify:c.status==='approved'?c.verify:undefined};}
async function certProgress(id){try{const p=parseStoredProgress(await client.get('tf:progress:'+id));const sc=(p&&p.scores)||{};return{overall:+(p&&p.overall)||0,examBest:+sc.examBest||0,timeSec:+(p&&p.timeSec)||0};}catch{return{overall:0,examBest:0,timeSec:0};}}
async function certIssueNo(c){if(c.no)return c.no;const cfg=await certCfg();const n=Number(await client.incr('tf:certseq'));const no=cfg.prefix+'-'+String(n).padStart(4,'0');await client.hSet('tf:certno',no,c.id);return no;}
async function certTrainer(b){
  const id=String(b.id||'');if(!accountId(id))return{status:400,body:{error:'bad_id'}};
  const raw=await client.hGet('tf:users',id);if(!raw)return{status:404,body:{error:'not_found'}};const user=accountRecord(raw,id);
  let c=(await certRead(id))||{id,status:'none',requestedAt:0,history:[]};
  if(b.nameEn!=null){const v=certName(b.nameEn,CERT_EN);if(!v)return{status:400,body:{error:'bad_name_en'}};c.nameEn=v;}
  if(b.nameAr!=null){const v=certName(b.nameAr,CERT_AR);if(!v)return{status:400,body:{error:'bad_name_ar'}};c.nameAr=v;}
  if(!c.nameAr&&user.name&&CERT_AR.test(user.name))c.nameAr=user.name;
  if(b.rows!==undefined){if(b.rows===null)delete c.rows;else if(Array.isArray(b.rows)&&b.rows.length<=12){const rows=b.rows.map(r=>({ar:clip(r&&r.ar,90),en:clip(r&&r.en,90),v:clip(r&&r.v,90)})).filter(r=>r.ar||r.en||r.v);if(rows.length)c.rows=rows;else delete c.rows;}else return{status:400,body:{error:'bad_rows'}};}
  const d=b.decision;
  if(d==='approve'){if(!c.nameEn||!c.nameAr)return{status:400,body:{error:'names_required'}};c.no=await certIssueNo(c);c.verify=certCode(c.no);c.status='approved';c.issuedAt=c.issuedAt||Date.now();c.approvedAt=Date.now();Object.assign(c,{progress:await certProgress(id),group:user.group||'',org:user.org||'',phone4:String(user.phone||'').slice(-4)});}
  else if(d==='reject'){c.status='rejected';c.note=clip(b.note,300);}
  else if(d==='revoke'){c.status='revoked';c.note=clip(b.note,300);c.revokedAt=Date.now();}
  else if(d!=='edit')return{status:400,body:{error:'bad_decision'}};
  c.decidedAt=Date.now();(c.history=(c.history||[]).slice(-19)).push({at:Date.now(),by:'trainer',d});
  await client.hSet('tf:certs',id,JSON.stringify(c));
  return{status:200,body:{ok:true,cert:certPublic(c)}};
}

const VH=(s)=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
async function verifyPage(req,q){
  await authRate('cert-verify',requestIp(req),60,60);
  const no=clip(q.get('c'),40).toUpperCase(),code=clip(q.get('v'),12).toUpperCase(),cfg=await certCfg();
  const id=/^[A-Z0-9\-]{6,40}$/.test(no)?await client.hGet('tf:certno',no):null;const c=id?await certRead(id):null;
  const ok=!!(c&&c.no===no&&c.status==='approved'),rev=!!(c&&c.status==='revoked'),cm=code&&c?code===c.verify:null;
  const d=t=>t?new Date(t).toISOString().slice(0,10):'—';
  const st=ok?(cm===false?['⚠️','#B7791F','Number found — verification code does not match','الرقم موجود — رمز التحقق غير مطابق']:['✓','#15803D','Valid certificate · Issued by Track Ford','شهادة صحيحة · صادرة من تراكفورد']):rev?['✕','#B42318','This certificate has been revoked','هذه الشهادة ملغاة']:['✕','#B42318','No certificate matches this number','لا توجد شهادة بهذا الرقم'];
  const row=(a,b,v)=>`<tr><th>${a}<small>${b}</small></th><td>${VH(v)}</td></tr>`;
  const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Certificate Verification · Track Ford</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;600;800&display=swap"><style>
body{margin:0;min-height:100vh;background:#0A1B3D radial-gradient(900px 400px at 80% -10%,rgba(226,184,90,.25),transparent);font-family:Rubik,Arial,sans-serif;color:#1B2436;display:grid;place-items:center;padding:16px;box-sizing:border-box}
.c{background:#FBF8F2;max-width:620px;width:100%;border-radius:22px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.45);border:2px solid #C9973B}
.h{background:linear-gradient(135deg,#06122B,#13295A);color:#fff;padding:22px 26px;border-bottom:3px solid #C9973B}.h b{color:#E2B85A;letter-spacing:.18em;font-size:12px}.h h1{margin:6px 0 0;font-size:22px}
.s{display:flex;gap:14px;align-items:center;padding:20px 26px;border-bottom:1px solid #E7DCC6}.s i{font-style:normal;width:54px;height:54px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:28px;font-weight:800;background:${st[1]};flex:none}
.s p{margin:0;font-weight:800;color:${st[1]};font-size:17px}.s p+p{font-weight:600;font-size:15px;direction:rtl;text-align:left}
table{width:100%;border-collapse:collapse}th,td{padding:11px 26px;border-bottom:1px solid #EFE6D3;text-align:left;vertical-align:top;font-size:15px}th{width:42%;color:#5B6476;font-weight:600}th small{display:block;font-size:12px;direction:rtl;text-align:left;color:#8E97A8}td{font-weight:600;color:#0A1B3D}
.f{padding:14px 26px;font-size:12px;color:#5B6476;background:#F6EEDC}</style></head><body><div class="c"><div class="h"><b>TRACK FORD · BUSINESS CONSULTING</b><h1>Certificate Verification · التحقق من الشهادة</h1></div>
<div class="s"><i>${st[0]}</i><div><p>${st[2]}</p><p>${st[3]}</p></div></div>
${c&&c.no===no?`<table>${row('Certificate No.','رقم الشهادة',c.no)}${row('Holder','حامل الشهادة',c.nameEn)}${row('Name (Arabic)','الاسم بالعربية',c.nameAr)}${row('Program','البرنامج',cfg.program+' — '+cfg.kind)}${row('Training hours','الساعات التدريبية',cfg.hours)}${row('Dates','الفترة',cfg.dates)}${row('TVTC approval No.','رقم اعتماد المؤسسة',cfg.approvalNo)}${row('Issued','تاريخ الإصدار',d(c.issuedAt))}${rev?row('Revoked','تاريخ الإلغاء',d(c.revokedAt)):''}</table>`:''}
<div class="f">Track Ford Business Consulting · trackford.sa — This page is generated live from Track Ford's certificate registry. هذه الصفحة تُنشأ مباشرة من سجل شهادات تراكفورد.</div></div></body></html>`;
  return new Response(html,{status:200,headers:{'content-type':'text/html; charset=utf-8','Cache-Control':'no-store','Access-Control-Allow-Origin':'*'}});
}
async function certRoutes(req,url,q,path){
  if(path==='/api/cert/verify'){
    await authRate('cert-verify',requestIp(req),60,60);
    const no=clip(q.get('c'),40).toUpperCase();if(!/^[A-Z0-9\-]{6,40}$/.test(no))return J({ok:true,valid:false,error:'bad_number'});
    const id=await client.hGet('tf:certno',no);const c=id?await certRead(id):null;const cfg=await certCfg();
    if(!c||c.no!==no)return J({ok:true,valid:false,error:'not_found'});
    const code=clip(q.get('v'),12).toUpperCase();
    return J({ok:true,valid:c.status==='approved',status:c.status,codeMatch:code?code===c.verify:null,cert:{no:c.no,nameEn:c.nameEn,nameAr:c.nameAr,issuedAt:c.issuedAt,revokedAt:c.revokedAt||null,program:cfg.program,programAr:cfg.programAr,kind:cfg.kind,hours:cfg.hours,dates:cfg.dates,approvalNo:cfg.approvalNo}});
  }
  if(path==='/api/cert'){
    const b=req.method==='POST'?await readBody(req):{};const auth=await learnerAccount(learnerCredentials(req,q,b));
    let c=await certRead(auth.id);const cfg=await certCfg();
    if(req.method==='GET')return J({ok:true,cert:certPublic(c),config:cfg,user:publicAccount(auth.user),progress:c&&c.status==='approved'?c.progress:await certProgress(auth.id)});
    if(req.method!=='POST')return J({error:'method_not_allowed'},405);
    await authRate('cert-request',auth.id,20,3600);
    const nameEn=certName(b.nameEn,CERT_EN),nameAr=certName(b.nameAr,CERT_AR);
    if(!nameEn)return J({error:'bad_name_en'},400);if(!nameAr)return J({error:'bad_name_ar'},400);
    if(c&&c.status==='revoked')return J({error:'cert_revoked'},403);
    if(c&&c.status==='approved'&&c.nameEn===nameEn&&c.nameAr===nameAr)return J({ok:true,cert:certPublic(c)});
    c={...(c||{id:auth.id,history:[]}),nameEn,nameAr,status:'pending',requestedAt:Date.now(),note:''};
    (c.history=(c.history||[]).slice(-19)).push({at:Date.now(),by:'learner',d:'request'});
    await client.hSet('tf:certs',auth.id,JSON.stringify(c));
    return J({ok:true,cert:certPublic(c)});
  }
  return null;
}

export default {
  async fetch(req: Request) {
    const url = new URL(req.url); const path = url.pathname; const q = url.searchParams;
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    try {
      if (path === "/" || path === "/health") return J({ ok: true, service: "trackford-grc", ts: Date.now() });

      // self-test: proves register/edit/notify/progress all work against live Redis
      if (path === "/api/selftest") return J({ok:false,error:"not_found"},404);

      if (path === "/verify") return await verifyPage(req,q);
      if (path === "/api/cert" || path === "/api/cert/verify") { const r = await certRoutes(req,url,q,path); if (r) return r; }

      // ───────── registration ─────────
      if (path === "/api/reg") {
        if (req.method === "GET") {
          if (hasLearnerCredentials(req,q)) {
            const auth = await learnerAccount(learnerCredentials(req,q));
            return J({ok:true,authenticated:true,learnerId:auth.id,user:publicAccount(auth.user)});
          }
          const n = await client.hLen("tf:users");
          return J({ ok: true, registered: n });
        }
        if (req.method !== "POST") return J({ error: "method_not_allowed" }, 405);
        const b = await readBody(req), phone = normPhone(b.phone), pin = String(b.pin || "").trim();
        if (!/^0\d{8,9}$/.test(phone)) return J({error:"bad_phone"},400);
        if (!/^\d{4,6}$/.test(pin)) return J({error:"bad_pin"},400);
        if (b.action!==undefined&&!['login','register','signup'].includes(b.action))return J({error:"bad_action"},400);
        const id = sha(phone).slice(0,16);
        await authRate('learner-login-ip',requestIp(req),120,900);await authRate('learner-login-account',id,10,900);
        for(let attempt=0;attempt<8;attempt++) {
          const raw=await client.hGet('tf:users',id),cur=raw?accountRecord(raw,id):null;
          if(cur&&accountBlocked(cur))return J({error:'account_blocked'},403);
          if(b.action==='login') {
            if(!cur)return J({error:'not_found'},404);
            if(!safeEqual(cur.pinHash,sha(pin+':'+id)))return J({error:'bad_pin'},401);
            const updated={...cur,lastLogin:Date.now(),tok:accountToken(cur.tok)?cur.tok:mkTok()};
            if(await saveAccount(id,raw,updated))return J({ok:true,user:publicAccount(updated),token:updated.tok,created:false});
          } else {
            const name=clip(b.name,80);if(name.length<3)return J({error:'bad_name'},400);
            if(cur&&!safeEqual(cur.pinHash,sha(pin+':'+id)))return J({error:'exists'},409);
            const updated={...(cur||{id,created:Date.now(),bonusIdentity:'a_'+crypto.randomBytes(16).toString('hex')}),name,phone,email:clip(b.email,120),group:clip(b.group,40)||'عام',org:clip(b.org,120),role:clip(b.role,80),pinHash:sha(pin+':'+id),tok:cur&&accountToken(cur.tok)?cur.tok:mkTok(),lastLogin:Date.now()};
            if(await saveAccount(id,raw,updated))return J({ok:true,user:publicAccount(updated),token:updated.tok,created:!cur});
          }
        }
        return J({error:'account_write_conflict'},409);
      }

      if (path === '/api/participation/init' || path === '/api/participation') {
        if(req.method!=='POST')return J({error:'method_not_allowed'},405);
        const body=await readBody(req),init=path.endsWith('/init');
        participationInput(body,init);
        return J(await participationWrite(learnerCredentials(req,q,body),body,init));
      }

      if (path === "/api/progress") {
        if (req.method === "GET") {
          const cfg=(await getJ('tf:config'))||{};
          if(!hasLearnerCredentials(req,q))return J({ok:true,config:cfg,participationVersion:1,trainerBonusVersion:1,pendingProfilesVersion:1,rules:{question:1,activity:5},catalogSize:AP_catalog.size});
          const credentials=learnerCredentials(req,q),auth=await learnerAccount(credentials);
          const snapshot=parseStoredProgress(await client.get('tf:progress:'+auth.id));
          const manualSummary=await learnerManualSummary(auth.user,snapshot);
          const latest=await learnerAccount(credentials);
          return J({ok:true,snapshot,participation:participationView(snapshot),...manualSummary,config:cfg,authenticated:true,learnerId:latest.id,user:publicAccount(latest.user)});
        }
        if(req.method!=='POST')return J({error:'method_not_allowed'},405);
        const b=await readBody(req),credentials=learnerCredentials(req,q,b);
        const incoming=validateProgressSnapshot(b.snapshot);
        for(let attempt=0;attempt<8;attempt++) {
          const auth=await learnerAccount(credentials),key='tf:progress:'+auth.id;
          const previousRaw=await client.get(key);
          const snap=mergeProgressSnapshot(parseStoredProgress(previousRaw),incoming);
          const saved=await client.sendCommand(['EVAL',MONOTONIC_PROGRESS_CAS,'3',key,'tf:users','tf:seen',previousRaw||'',JSON.stringify(snap),auth.id,auth.raw,String(snap.at)]);
          if(Number(saved)===1)return J({ok:true,at:snap.at,snapshot:snap,participation:participationView(snap),...await learnerManualSummary(auth.user,snap),authenticated:true,learnerId:auth.id,user:publicAccount(auth.user)});
        }
        return J({error:'progress_write_conflict'},409);
      }

      if (path === "/api/notify") {
        if(req.method!=='GET')return J({error:'method_not_allowed'},405);
        const credentials=learnerCredentials(req,q),auth=await learnerAccount(credentials),since=+(q.get('since')||0);
        const list=(await client.lRange('tf:notifs',0,199))||[];
        const latest=await learnerAccount(credentials),grp='group:'+(latest.user.group||'عام'),usr='user:'+latest.id;
        const notifs=list.map((x:string)=>{try{return JSON.parse(x);}catch{return null;}}).filter(Boolean)
          .filter((n:any)=>n.ts>since&&(n.to==='all'||n.to===grp||n.to===usr)).sort((a:any,b:any)=>b.ts-a.ts).slice(0,20);
        return J({ok:true,notifs,authenticated:true,learnerId:latest.id,user:publicAccount(latest.user)});
      }

      if (path === "/api/trainer") {
        await trainerAccount(req,q);
        if(!['GET','POST'].includes(req.method))return J({error:'method_not_allowed'},405);
        if (req.method === "POST") {
          const b = await readBody(req);
          if(b.action==='pending_create')return J(await pendingCreate(b));
          if(b.action==='cert_decide'){const r=await certTrainer(b);return J(r.body,r.status);}
          if(['bonus_award','bonus_reverse'].includes(b.action))return J(await bonusMutate(b));
          if(b.del){const deleted=await deleteAccount(String(b.del));return J({ok:true,deleted:deleted.id});}
          if(['block','unblock','suspend','reactivate'].includes(b.action)) {
            const blocking=['block','suspend'].includes(b.action);
            const result=await updateAccount(b.id,current=>{
              const wasBlocked=accountBlocked(current);
              if(!blocking&&!wasBlocked)return null;
              const next={...current,status:blocking?'blocked':'active',blocked:blocking};
              delete next.tok;
              if(blocking){next.blockedAt=current.blockedAt||Date.now();}
              else{delete next.blockedAt;delete next.suspended;delete next.suspendedAt;}
              return next;
            });
            return J({ok:true,user:publicAccount(result.user),blocked:accountBlocked(result.user)});
          }
          if (b.edit && b.edit.id) {
            const e=b.edit;
            if(typeof e!=='object'||Array.isArray(e)||Object.keys(e).some(k=>!['id','name','group','org','role','email'].includes(k)))return J({error:'unsupported_profile_field'},400);
            const fields={name:80,group:40,org:120,role:80,email:120},patch:any={};
            for(const[k,limit]of Object.entries(fields))if(e[k]!=null){if(typeof e[k]!=='string')return J({error:'bad_profile'},400);patch[k]=clip(e[k],limit);}
            if(patch.name!==undefined&&patch.name.length<3)return J({error:'bad_name'},400);
            if(patch.group!==undefined)patch.group=patch.group||'عام';
            const result=await updateAccount(String(e.id),current=>({...current,...patch}));
            return J({ok:true,user:publicAccount(result.user)});
          }
          if (b.renameGroup && b.renameGroup.from && b.renameGroup.to) {
            return J(await bonusRename(clip(b.renameGroup.from,40),clip(b.renameGroup.to,40)||'عام'));
          }
          if (b.notify && b.notify.to && (b.notify.title || b.notify.body)) {
            const note = { id: "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ts: Date.now(), to: clip(b.notify.to, 80), title: clip(b.notify.title, 120), body: clip(b.notify.body, 600) };
            await client.lPush("tf:notifs", JSON.stringify(note)); await client.lTrim("tf:notifs", 0, 199);
            return J({ ok: true, note });
          }
          if (b.config && typeof b.config === "object") { const cfg = Object.assign((await getJ("tf:config")) || {}, b.config, { updated: Date.now() }); await setJ("tf:config", cfg); return J({ ok: true, config: cfg }); }
          return J({ error: "bad_request" }, 400);
        }
        if(q.get('view')==='certs'){const all=await client.hGetAll('tf:certs');const certs=Object.values(all).map((j:any)=>{try{return JSON.parse(j);}catch{return null;}}).filter(Boolean);return J({ok:true,certs,config:await certCfg()});}
        if(q.get('view')==='bonus-ledger'){
          const before=q.has('before')?Number(q.get('before')):Number.MAX_SAFE_INTEGER,limit=q.has('limit')?Number(q.get('limit')):50;
          if(!Number.isSafeInteger(before)||before<1||!Number.isSafeInteger(limit)||limit<1||limit>100)return J({error:'bad_bonus_pagination'},400);
          return J({ok:true,bonus:bonusSummary((await bonusRead()).state,before,limit)});
        }
        const allObj = await client.hGetAll("tf:users");
        const users: any[] = Object.values(allObj).map((j: any) => { try { const u = JSON.parse(j); return publicAccount(u); } catch (e) { return null; } }).filter(Boolean);
        if (users.length) { const snaps = await client.mGet(users.map(u => "tf:progress:" + u.id)); users.forEach((u, i) => { try { u.progress = parseStoredProgress(snaps[i]); u.participation = participationView(u.progress); } catch (e) { u.progress = null; u.participation = null; u.progressError = "stored_progress_requires_review"; } }); }
        try { const seenObj = await client.hGetAll("tf:seen"); users.forEach(u => { u.lastSeen = Math.max(+(seenObj[u.id] || 0) || 0,(u.progress&&u.progress.at)||0); }); } catch (e) {}
        let notifs: any[] = []; try { const raw = (await client.lRange("tf:notifs", 0, 49)) || []; notifs = raw.map((x: string) => { try { return JSON.parse(x); } catch (e) { return null; } }).filter(Boolean); } catch (e) {}
        const config = (await getJ("tf:config")) || {};
        const bonusStateValue=(await bonusRead()).state,bonusTotalValues=bonusTotals(bonusStateValue),pending=(await pendingRead()).state;
        const registeredPhones=new Set(users.filter(u=>typeof u.phone==='string').map(u=>normPhone(u.phone)));
        const pendingParticipants=pending.profiles.map(p=>pendingPublic(p,bonusTotalValues,registeredPhones.has(p.phone)));
        users.forEach(u=>{
          u.bonusIncarnation=bonusIncarnation(u);
          u.bonusPoints=bonusTotalValues.get('user:'+u.id+':'+u.bonusIncarnation)||0;
          u.manualPoints=u.bonusPoints;
          u.coursePoints=PM_number(u.progress?.points,PM_scalarBounds.points)?u.progress.points:null;
          u.legacyPoints=u.participation?u.participation.legacyPoints:u.coursePoints;
          u.automaticPoints=u.participation?u.participation.earnedPoints:(u.coursePoints===null?null:0);
          u.rankingPoints=u.coursePoints===null?null:u.coursePoints+u.manualPoints;
        });
        return J({ ok: true, users, config, notifs, pendingParticipants, pendingCount:pendingParticipants.length, bonus:{...bonusSummary(bonusStateValue),targets:bonusTargetCatalog(bonusStateValue,await client.get('tf:config'),allObj,pending)}, count: users.length, capabilities: { learnerBlocking: true, monotonicProgress: true, trainerBonus: true, trainerBonusVersion: 1, pendingParticipants: true, pendingParticipantsVersion: 1, automaticParticipation: { version: 1, questionPoints: 1, activityPoints: 5, catalogSize: AP_catalog.size } } });
      }

      // ───────── AI proxy (optional; internal engines work without it) ─────────
      if (path === "/api/ai") {
        const key = process.env.ANTHROPIC_API_KEY || "";
        const b = await readBody(req);let aiCredentials=null;
        if(req.headers.has('x-trainer-pin')||q.has('pin'))await trainerAccount(req,q);
        else if(hasLearnerCredentials(req,q)||b.id!==undefined||b.token!==undefined){aiCredentials=learnerCredentials(req,q,b);await learnerAccount(aiCredentials);}

        if (!key) return J({error:"ai_unavailable"},503);
        const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" }, body: JSON.stringify({ model: b.model || "claude-3-5-haiku-latest", max_tokens: Math.min(+b.max_tokens || 1024, 4096), system: b.system || "", messages: b.messages || [{ role: "user", content: String(b.prompt || "") }] }) });
        const j = await r.json(); const text = (j.content && j.content[0] && j.content[0].text) || "";
        if(aiCredentials)await learnerAccount(aiCredentials);
        return J({ ok: r.ok, text, raw: j }, r.ok ? 200 : 502);
      }

      return J({ error: "not_found" }, 404);
    } catch (e: any) { if(e instanceof AccountError || e instanceof ProgressMergeError || e instanceof BonusError)return J({error:e.message},e.status); return J({ error: "server_error" }, 500); }
  }
};