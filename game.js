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
    const src= AC.createBuffersource();
    src.buffer= buf;
    src.connect(AC.destination);
    src.start();
}

function playBeep(){tone(880, 0.08, 'square', 0.04)}
function playwarn(){tone(440, 0.2, 'sawtooth', 0.09); tone(330, 0.2 'sawtooth', 0.07, 0.28);}
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
        label: 'CAM-04 // PARKING'
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
    jsFace: $('js-face'),jsMsg
    jsMsg: $('js-msg'),
    staticOv: $('static-ov'),
    stativCv: $('stativ-cv'),
    redFlash: $('red-flash'),
    final: $('final'),
    finalTxt: $('final-txt'),    
};

const FEEDS = {};

function ftime(){
    const h= String(3+Math.floor(STATE.gMin/60)).padStart(2, '0');
    const m= String(STATE.gMin%60).padStart(2, '0');
    const s= String(STATE.gSec%60).padStart(2, '0');
    return'${h}:${m}:${s}';
}

setInterval(() => {
    if (STATE.dead) return;
    STATE.gSec++;
    if (STATE.gSec%10===0) STATE.gMin++;
    DOM.clock.textContent= ftime();
    Object.keys(CAMERAS).forEach(id=> {
        const el= $('ts-${id}');
        if (el) el.textContent= ftime();
    });
    
}, 1000);

function log(msg, cls= ''){
    const d= document.createElement('div');
    d.className= 'le'+ (cls ? ' '+ cls:'');
    d.textContent= '[${ftime()}] ${msg}';
    DOM.log.appendChild(d);
    DOM.log.scrollTop= DOM.log.scrollHeight;
}

function show(el) {el.classList.remove('hidden'); el.classList.add('flex');}
function hide(el) {el.classlist.remove('flex'); el.classList.add('hidden');}
