// contexto de audio y volumen global
let ctx;
let masterGain;
const activeNotes = {}; // se guardan las notas activas para poder soltarlas después

// Iniciar audio
function startSound() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    const volumeSlider = document.getElementById("volume");
    masterGain.gain.value = volumeSlider.value / 100 * 0.50;
    masterGain.connect(ctx.destination);
}

// Detener audio
function stopSound() {
    if (ctx) ctx.close();
}

const volumeSlider = document.getElementById("volume");
volumeSlider.addEventListener("input", () => {
    if (masterGain) {
        masterGain.gain.value = volumeSlider.value / 100 ;
    }
});

// Teclas en pantalla
const keys = document.querySelectorAll(".white_key, .black_key");
keys.forEach(key => {
    key.addEventListener("mousedown", () => {           // mousedown para poder mantener la tecla   
        const freq = parseFloat(key.dataset.note);
        playNote(freq);
        key.classList.add("active");
    });
    key.addEventListener("mouseup", () => {     // aqui soltamos la nota al levantar clic
        const freq = parseFloat(key.dataset.note);
        stopNote(freq);
        key.classList.remove("active");
    });
});

// Mapeo del teclado físico y sus frecuencias
const keyMap = {
    'a': 261.63, // Do
    'w': 277.18, // Do#
    's': 293.66, // Re
    'e': 311.13, // Re#
    'd': 329.63, // Mi
    'f': 349.23, // Fa
    'r': 369.99, // Fa#
    'g': 392.00, // Sol
    't': 415.30, // Sol#
    'h': 440.00, // La
    'y': 466.16, // La#
    'j': 493.88  // Si
};

// Escuchar teclado físico
// Escuchar teclado físico
document.addEventListener("keydown", (event) => { // avisa cada que swe presiona una tecla
    const keyPressed = event.key.toLowerCase(); //regresa la letra tecleada en minuscula para que pueda comparar y pasarlo a frecuencia
    if (keyMap[keyPressed] && !activeNotes[keyMap[keyPressed]]) { // evita duplicados
        const freq = keyMap[keyPressed];
        playNote(freq);                 //guarda la nota y la toca
        const keyElement = Array.from(keys).find(
            k => parseFloat(k.dataset.note) === freq
        );
        if (keyElement) keyElement.classList.add("active"); //si encontró el botón entonces agrega la clase active de css para que la tecla se pinte como activa
    }
});

document.addEventListener("keyup", (event) => { //reacciona al momento de soltar
    const keyPressed = event.key.toLowerCase();
    if (keyMap[keyPressed]) {
        const freq = keyMap[keyPressed];
        stopNote(freq);  // 🔹 Liberamos la nota
        const keyElement = Array.from(keys).find(
            k => parseFloat(k.dataset.note) === freq
        );
        if (keyElement) keyElement.classList.remove("active");
    }
});

const waveSelect = document.getElementById("waveType");

const adsr = {
    attack: document.getElementById("attack"),
    decay: document.getElementById("decay"),
    sustain: document.getElementById("sustain"),
    release: document.getElementById("release")
};

function playNote(freq){
    if (!ctx) return;

    const now= ctx.currentTime;
    const oscNote = ctx.createOscillator();
    const gainNote = ctx.createGain();

    //usar el tipo de onda seleccionado en las opciones
    oscNote.type = waveSelect.value;
    oscNote.frequency.value = freq;

    // Conectar oscilador con ganancia y masterGain
    oscNote.connect(gainNote);
    gainNote.connect(masterGain);

    // ADSR aplicado (ataque y decay a sustain)
    gainNote.gain.setValueAtTime(0, now);
    gainNote.gain.linearRampToValueAtTime(0.25, now + parseFloat(adsr.attack.value)); // Attack
    gainNote.gain.linearRampToValueAtTime(parseFloat(adsr.sustain.value) * 0.5,
        now + parseFloat(adsr.attack.value) + parseFloat(adsr.decay.value)          // Decay → Sustain
    );

    oscNote.start(now);

    // Guardamos la nota activa
    activeNotes[freq] = { osc: oscNote, gain: gainNote };
}
// 🎶 Función para detener nota
function stopNote(freq) {
    if (activeNotes[freq]) {
        const { osc, gain } = activeNotes[freq];
        const now = ctx.currentTime;

        // 🔹 ADSR release
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0, now + parseFloat(adsr.release.value));

        osc.stop(now + parseFloat(adsr.release.value));
        delete activeNotes[freq]; // Limpieza
    }
}

const presets = {
    soft:   { attack: 0.12, decay: 0.15, sustain: 0.18, release: 0.7, wave: "sine" },
    softPad:     { attack: 1.2, decay: 0.8, sustain: 0.7, release: 1.5, wave: "triangle" },
    pluck:       { attack: 0.01, decay: 0.15, sustain: 0.2, release: 0.1, wave: "sawtooth" },
    bass:        { attack: 0.02, decay: 0.2, sustain: 0.8, release: 0.3, wave: "square" },
    leadBright:  { attack: 0.05, decay: 0.1, sustain: 0.3, release: 0.25, wave: "sawtooth" },
    warmPad:     { attack: 0.6, decay: 0.5, sustain: 0.6, release: 1.0, wave: "sine" },
    pluckSoft:   { attack: 0.02, decay: 0.05, sustain: 0.15, release: 0.2, wave: "triangle" },
    deepBass:    { attack: 0.1, decay: 0.15, sustain: 0.7, release: 0.5, wave: "square" },
    ketutekré:    { attack: 0.01, decay: 0.15, sustain: 0, release: 0.88, wave: "square" },

};

const presetSelect = document.getElementById("presetSelect");

presetSelect.addEventListener("change", () => {
    const selected = presets[presetSelect.value];
    adsr.attack.value = selected.attack;
    adsr.decay.value = selected.decay;
    adsr.sustain.value = selected.sustain;
    adsr.release.value = selected.release;
    waveSelect.value = selected.wave;
});

    // Envolvente simple
    //gainNote.gain.setValueAtTime(0, now);
    //gainNote.gain.linearRampToValueAtTime(0.25, now + 0.05);
    //gainNote.gain.linearRampToValueAtTime(0, now + 0.5);

    //oscNote.start(now);
    //oscNote.stop(now + 0.5);



