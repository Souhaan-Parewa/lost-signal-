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
function playdrone()