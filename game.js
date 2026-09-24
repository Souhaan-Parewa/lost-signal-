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
    

}