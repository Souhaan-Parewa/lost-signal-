let AC;

function initAudio(){
    if (!AC) AC=new(window.AudioContext || window.webkitAudioContext)();

}

function tone(freq, dur, type = 'sine', vol= 0.05, delay= 0){
    if (!AC) return;
    const t= AC.currentTime + delay;
    const osc= AC.createOscillator();
    const gain= AC.createGain();
    osc.connect(gain);
    gain.connect(AC.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t+dur);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.start(t);
    osc.stop(t + dur + 0.05)
}

function noise(dur= 0.3, vol= 0.25){
    if (!AC) return;
    const buf= AC.createBuffer(1, AC.sampleRate*dur, AC.sampleRate);
    const data= buf.getChannelData(0);
    for (let i=0; i<data.length; i++)
        data[i]= (Math.random()*2-1)*vol;
    const src= AC.createBufferSource();
    src.buffer= buf;
    src.connect(AC.destination);
    src.start();
}

function playBeep(){tone(880, 0.08, 'square', 0.04)}
function playWarn(){tone(440, 0.2, 'sawtooth', 0.09); tone(330, 0.2, 'sawtooth', 0.07, 0.28);}
function playDrone(){ [55, 110, 165].forEach((f, i) => tone(f, 5, 'sine', 0.05-i*0.01, i*0.1));}
function playHeartbeat(){tone(80, 0.05, 'sine', 0.2); tone(70, 0.05, 'sine', 0.15, 0.12)}

function playScreech(){
    if (!AC) return;
    noise(0.8, 0.45);
    tone(2400, 0.6, 'sawtooth', 0.18);
    tone(1600, 0.5, 'sawtooth', 0.12, 0.1);
    tone(3200, 0.3, 'sawtooth', 0.10, 0.2);
    tone(60, 0.4, 'sine', 0.30);
}

const CAMERAS={
    c1: {
        label: 'CAM-01 // LOBBY',
        normal: [
            '   ___________  ',
            '  |  [LOBBY]  | ',
            '  |           | ',
            '  |  [DESK]   | ',
            '  |___________| ',
            '   ||       ||  ',
        ],
        
        anomaly: [
            '   ___________  ',
            '  |  [LOBBY]  | ',
            '  |           | ',
            '  |  [DESK] O | ',
            '  |_______/|\\__| ',
            '   ||      |  ||',
        ],

        scareFace: [
            '  ██████████████  ',
            '  █  ◉      ◉  █  ',
            '  █            █  ',
            '  █  ▄██████▄  █  ',
            '  ██████████████  ',

        ],

        scareMsg: 'IT IS SITTING AT YOUR DESK',
        anomalyNote: 'FIGURE DETECTED AT LOBBY DESK.\nNo personnel scheduled.\nFigure has not moved in 22 minutes.\n\nPrevious operator note:\n"do not make eye contact with CAM-01."'
    }, 
    
    c2:{
        label: 'CAM-02 // STAIRWELL B',
        normal:[
            '  /|  /|  /|  ',
            ' / | / | / |  ',
            '/__|/__|/__|  ',
            '   |   |   |  ',
            '  ═══  |  ═══ ',
            '  [B1] | [B2] ',
        ],

        anomaly: [
            '  /|  /|  /|  ',
            ' / | / | / |  ',
            '/__|/__|/__|  ',
            '   |  /\\|   | ',
            '  ═══ || ═══  ',
            '  [B1]||[B2] ',
        ],

        scareFace: [
            '                  ',
            '  O               ',
            ' /|\\ <── HERE     ',
            '  |               ',
           ' / \\              ',
           '  FLOOR 3         ',
        ],

        scareMsg: 'IT IS ON YOUR FLOOR',
        anomalyNote: 'MOTION DETECTED IN STAIRWELL.\nShape is ascending.\nSpeed: inconsistent.\n\n"It stops whenever I check the feed."',
    },
    
    c3: {
        label: 'CAM-03 // SERVER ROOM',
        normal: [
            ' [══] [══] [══] ',
            ' |██| |██| |██| ',
            ' |██| |██| |██| ',
            ' [══] [══] [══] ',
            '                 ',
            '  TEMP: 18.4°C   ',
        ],

        anomaly: [
            ' [══] [══] [══] ',
            ' |██| |░░| |██| ',
            ' |██| |??| |██| ',
            ' [══] [══] [══] ',
            '                 ',
            '  TEMP: 38.1°C   ',
        ],

        scareFace: [
            ' ╔══════════════╗ ',
            ' ║  RACK-B DOWN ║ ',
            ' ║              ║ ',
            ' ║   WHO DID    ║ ',
            ' ║    THIS?     ║ ',
            ' ╚══════════════╝ ',
        ],

        scareMsg: 'THE SERVERS ARE BEING WIPED',
        anomalyNote: 'SERVERS RACK-B: OFFLINE.\nTemp spike: +19.7°C in under 4 minutes.\nAll logs from 02:00-03:00 deleted.\n\n"Someone was here before you."',

    },

    c4:{
        label: 'CAM-04 // PARKING',
        normal: [
            '  ___    ___    ___ ',
            ' |CAR|  |   |  |   |',
            ' |___|  |___|  |___|',
            '                     ',
            '════════════════════ ',
            '    PARKING LOT      ',
        ],

        anomaly: [
        '  ___    ___    ___ ',
        ' |CAR|  |   |  |   |',
        ' |___|  |___|  |___|',
        '         |||         ',
        '═════════|||════════ ',
        '    PARKING LOT      ',
        ],
        
        scareFace: [
            '                     ',
            '  IT IS AT THE DOOR  ',
            '                     ',
            '  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ',
            '  ▓  SIGNAL LOST  ▓  ',
            '  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ',
        ],

        scareMsg:'THE FRONT DOOR IS OPENING',
        anomalyNote:'UNIDENTIFIED ENTITY IN PARKING LOT.\nDid not arrive by vehicle.\nIs facing the entrance.\n\n"Do not let it see the light inside."',
    },

};

const ORDER = ['c3', 'c1', 'c2', 'c4'];

const STATE = {
    phase: 0,
    curAnomaly: null,
    reports: 0,
    dead: false,
    jsActive: false,
    gmin: 0,
    gsec: 0,
};

const $ = id => document.getElementById(id);

const DOM = {
    boot: $('boot'),
    bootText: $('boot-text'),
    startBtn: $('start-btn'),
    monitor: $('monitor'),
    camGrid: $('cam-grid'),
    log: $('log'),
    clock: $('clock'),
    statusTxt: $('status-txt'),
    statusDot: $('status-dot'),
    rpt: $('rpt'),
    rptBody: $('rpt-body'),
    jsOverlay: $('js-overlay'),
    jsFace: $('js-face'),
    jsMsg: $('js-msg'),
    staticOv: $('static-ov'),
    staticCv: $('static-cv'),
    redFlash: $('red-flash'),
    final: $('final'),
    finalTxt: $('final-txt'),    
};

const FEEDS = {};

function ftime(){
    const h= String(3+Math.floor(STATE.gMin/60)).padStart(2, '0');
    const m= String(STATE.gMin%60).padStart(2, '0');
    const s= String(STATE.gSec%60).padStart(2, '0');
    return`${h}:${m}:${s}`;
}

setInterval(() => {
    if (STATE.dead) return;
    STATE.gSec++;
    if (STATE.gSec%10===0) STATE.gMin++;
    DOM.clock.textContent= ftime();
    Object.keys(CAMERAS).forEach(id=> {
        const el= $(`ts-${id}`);
        if (el) el.textContent= ftime();
    });
    
}, 1000);

function log(msg, cls= ''){
    const d= document.createElement('div');
    d.className= 'le'+ (cls ? ' '+ cls:'');
    d.textContent= `[${ftime()}] ${msg}`;
    DOM.log.appendChild(d);
    DOM.log.scrollTop= DOM.log.scrollHeight;
}

function show(el) {el.classList.remove('hidden'); el.classList.add('flex');}
function hide(el) {el.classList.remove('flex'); el.classList.add('hidden');}

let staticRAF= null;
function startStatic(){
    DOM.staticOv.classList.remove('hidden');
    const ctx= DOM.staticCv.getContext('2d');
    function draw(){
        DOM.staticCv.width= window.innerWidth;
        DOM.staticCv.height= window.innerHeight;
        const img= ctx.createImageData(DOM.staticCv.width, DOM.staticCv.height);
        for (let i= 0; i< img.data.length; i+= 4){
            const v= Math.random()* 255 | 0;
            img.data[i]= 0;
            img.data[i+ 1]= (v*0.6) | 0;
            img.data[i+ 2]= 0;
            img.data[i+ 3]= 180;
        }
        ctx.putImageData(img, 0, 0);
        staticRAF= requestAnimationFrame(draw);
    }
    draw();
}

function stopStatic(){
    DOM.staticOv.classList.add('hidden');
    if(staticRAF){cancelAnimationFrame(staticRAF); staticRAF= null;}
}

function flashRed(times= 4, speed= 70){
    let i=0;
    const iv= setInterval(()=>{
        DOM.redFlash.classList.toggle('hidden');
        if (++i >= times*2) {DOM.redFlash.classList.add('hidden'); clearInterval(iv);}
    }, speed);
}

function attachNoise(feedEl){
    const cv= feedEl.querySelector('.noise-cv');
    const ctx= cv.getContext('2d');
    function draw(){
        cv.width= feedEl.offsetWidth || 200;
        cv.height= feedEl.offsetHeight || 150;
        const img= ctx.createImageData(cv.width, cv.height);
        for (let i=0; i<img.data.length; i+= 4){
            const v= Math.random()* 60 | 0;
            img.data[i]= 0;
            img.data[i+ 1]= v;
            img.data[i+ 2]= 0;
            img.data[i+ 3]= 255;
        }
        ctx.putImageData(img, 0, 0);
        requestAnimationFrame(draw);
    }
    draw();
}

function buildGrid(){
    Object.entries(CAMERAS).forEach(([id, cam]) => {
        const div= document.createElement('div');
        div.className= 'feed';
        div.id= id;
        div.innerHTML= `
            <div class= "f-label">${cam.label}</div>
            <span class="f-rec">REC</span>
            <canvas class="noise-cv"></canvas>
            <div class="f-scene"><pre id="s-${id}"></pre></div>
            <div class="f-scare" id="js-${id}"><pre></pre></div>
            <div class="f-ts" id="ts-${id}">03:00:00</div>
        `;
        DOM.camGrid.appendChild(div);
        FEEDS[id]= div;
        attachNoise(div);
        $(`s-${id}`).textContent= cam.normal.join('\n');
        div.addEventListener('click', () => onFeedClick(id));
    });
}

function feedScare(id, dur= 900){
    const js= $(`js-${id}`);
    const pre= js.querySelector('pre');
    pre.textContent= CAMERAS[id].scareFace.join('\n');
    js.classList.add('show');
    setTimeout(() => js.classList.remove('show'), dur);
}

function fullscreenScare(face, msg, dur= 1200){
    if(STATE.jsActive) return;
    STATE.jsActive= true;
    playScreech();
    startStatic();
    flashRed(6, 60);
    DOM.jsFace.textContent= face;
    DOM.jsMsg.textContent= msg;
    show(DOM.jsOverlay);
    setTimeout(() => {
        hide(DOM.jsOverlay);
        stopStatic();
        STATE.jsActive= false;
    }, dur);
}

function triggerAnomaly(id){
    if(STATE.dead) return;
    STATE.curAnomaly= id;

    FEEDS[id].classList.add('red-alert');
    $(`s-${id}`).textContent= CAMERAS[id].anomaly.join('\n');
    $(`s-${id}`).style.color= '#ff440022';

    playWarn();
    flashRed(3, 80);
    DOM.statusTxt.textContent= `⚠ ANOMALY — ${CAMERAS[id].label}`;
    DOM.statusTxt.style.color= '#ff2200';
    log(`MOTION / ANOMALY on ${CAMERAS[id].label} — CLICK TO INVESTIGATE`, 'c');

    setTimeout(() => {
        if (STATE.curAnomaly=== id){
            feedScare(id, 700);
            noise(0.15, 0.08);
        }
    }, 4000+ Math.random()* 3000);
}

function clearAnomaly(id){
    FEEDS[id].classList.remove('red-alert');
    $(`s-${id}`).textContent= CAMERAS[id].normal.join('\n');
    $(`s-${id}`).style.color= '';
    DOM.statusTxt.textContent= 'ALL SYSTEMS NOMINAL';
    DOM.statusTxt.style.color='';
}

function onFeedClick(id){
    if (STATE.dead || STATE.jsActive) return;
    initAudio();

    if(id=== STATE.curAnomaly){
        showReport(id);
    } else if (STATE.curAnomaly){
        feedScare(id, 600);
        noise(0.1, 0.06);
        playBeep();
        log('Focus — wrong camera.', 'w');
    }
}

function showReport(id){
    DOM.rptBody.textContent= CAMERAS[id].anomalyNote;
    show(DOM.rpt);
    playDrone();
}

$('btn-dismiss').addEventListener('click', () => {
    hide(DOM.rpt);
    if (STATE.dead) return;
    log('Anomaly dismissed.', 'w');
    const dismissed= STATE.curAnomaly;
    clearAnomaly(dismissed);
    STATE.curAnomaly= null;
    STATE.phase++;

    setTimeout(() => {
        if (!STATE.dead){
            fullscreenScare(
                CAMERAS[dismissed].scareFace.join('\n'),
                CAMERAS[dismissed].scareMsg,
                1500
            );
            log('!! YOU SHOULD NOT HAVE DISMISSED THAT !!', 'c');
            if(STATE.phase >= ORDER.length) setTimeout(beginFinal, 3000);
            else setTimeout(() => triggerAnomaly(ORDER[STATE.phase]), 6000);
        }
    }, 3000);
});

$('btn-report').addEventListener('click', () =>{
    hide(DOM.rpt);
    if (STATE.dead) return;
    STATE.reports++;
    log(`Incident #${STATE.reports} filed for ${CAMERAS[STATE.curAnomaly].label}.`);
    clearAnomaly(STATE.curAnomaly);
    STATE.curAnomaly= null;
    STATE.phase++;

    if (STATE.phase >= ORDER.length){
        setTimeout(beginFinal, 4000);
    } else{
        setTimeout(() => playHeartbeat(), 500);
        setTimeout(() => triggerAnomaly(ORDER[STATE.phase]), 9000+ Math.random()* 4000);
    }
});

function startRandomEvents(){
    setInterval(() =>{
        if(STATE.dead || STATE.curAnomaly || STATE.jsActive) return;
        const r= Math.random();

        if (r<0.12){
            const ids= Object.keys(CAMERAS);
            feedScare(ids[Math.random()* ids.length | 0], 350);
            noise(0.08, 0.04);
        } else if (r< 0.18){
            flashRed(2, 60);
            noise(0.08, 0.05);
            log(`— interference detected — `, 'w');
        } else if (r<0.22){
            playHeartbeat();
        }
    }, 7000);
}

const FINAL_LINES= [
    '> UPLOADING INCIDENT REPORTS...',
    '',
    '████████████░░░░ 78%',
    '',
    '> ERROR: REMOTE HOST REFUSED CONNECTION',
    '',
    '> REVIEWING FOOTAGE ARCHIVE...',
    '',
    '> CAM-04 04:11:08 — entity has entered the building.', 
    '> CAM-02 04:11:34 — ascending stairwell. floor 2.',
    '> CAM-02 04:11:41 — Floor 3.',
    '> CAM-01 04:11:55 — lobby camera: no signal.',
    '',
    '. . .',
    '',
    '',
    '> CHECKING OPERATOR FEED...',
    '',
    '> CAM-03 // SERVER ROOM LIVE',
    '',
    ' you are in cam-03',
    ' you have been in frame this entire time.',
    '',
    ' it has been watching you',
    ' the same way you have been watching it.',
    '',
    ' why did you keep the lights on?',
    '',
    '',
    '[ SIGNAL LOST ]',
    '[ CONNECTION TERMINATED BY REMOTE HOST ]',
    '',
    '// the previous operator is still logged in //',
];

function corrupt(str){
    const chars= '░▒▓█▄▀■□▪◘◙'.split('');
    return str.split('').map(ch =>
        Math.random() <0.35 ? chars[Math.random()* chars.length | 0] : ch
    ).join('');
}

function typeFinal(i){
    if(i >= FINAL_LINES.length) return;
    DOM.finalTxt.textContent += FINAL_LINES[i] + '\n';
    const pause= FINAL_LINES[i].startsWith('>') ? 700
               : FINAL_LINES[i].startsWith('.') ? 600
               : 100;
    setTimeout(() => typeFinal(i + 1), pause);
}

function beginFinal(){
    STATE.dead= true;

    fullscreenScare('◉____◉\n ___\n \\___/', 'IT IS INSIDE', 2000);
    setTimeout(startStatic, 200);
    setTimeout(stopStatic, 2200);

    Object.keys(CAMERAS).forEach(id => {
        const s= $(`s-${id}`);
        s.textContent= corrupt(CAMERAS[id].anomaly.join('\n'));
        s.style.color='#ff2200';
    });

    log('SIGNAL LOST', 'c');

    setTimeout(() => {
      show(DOM.final);
      typeFinal(0);  
    }, 2500);
}

const BOOT_LINES= [
    'CERBERUS SECURITY SYSTEMS v4.1.2',
    '____________________________________',
    'Mounting camera arrays.............  [OK]',
    'Loading anomaly detection...........  [OK]',
    'Establishing feed at SITE-07........  [OK]',
    'Checking operator handoff log.......  [OK]',
    '',
    'HANDOFF NOTE FROM PREVIOUS OPERATOR:',
    '',
    '  "Something kept appearing on CAM-04.',
    '   I filed three reports. Nothing came.',
    '   I dismissed the fourth one.',
    '   Do not dismiss anything."',
    '',
    ' — END OF LOG (operator did not sign out)',
    '',
    '// NIGHT SHIFT: 03:00 — 07:00 //',
    '// SITE-07 OCCUPANCY: 0 SCHEDULED //',
    '',
];

let bi= 0;
function typeBoot(){
    if (bi >= BOOT_LINES.length){
        DOM.startBtn.classList.remove('hidden');
        return;
    }
    DOM.bootText.textContent += BOOT_LINES[bi] + '\n';
    bi++;

    const delay = bi < 4 ? 55: bi< 9 ? 70: 110;
    setTimeout(typeBoot, delay);
}

typeBoot();

DOM.startBtn.addEventListener('click', () => {
    initAudio();
    playBeep();
    hide(DOM.boot);
    show(DOM.monitor);
    buildGrid();
    startGame();
});

function startGame() {
    log('Night shift initialized. You are the only operator on duty.');
    log('4 feeds active. Site is empty — no personnel scheduled.');
    setTimeout(() => log('Reviewing previous shift notes...'), 2500);
    setTimeout(() => log('"Do not dismiss anything." — prev. operator', 'w'), 4500);
    setTimeout(() => log('Previous operator did not clock out.', 'c'), 7000);
    setTimeout(() => triggerAnomaly(ORDER[STATE.phase]), 14000);
    startRandomEvents();
}