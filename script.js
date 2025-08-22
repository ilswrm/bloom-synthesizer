// 🎵 Contexto de audio y volumen global
let ctx;
let masterGain;

// Iniciar audio
function startSound() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    const volumeSlider = document.getElementById("volume");
    masterGain.gain.value = volumeSlider.value / 100 * 0.25;
    masterGain.connect(ctx.destination);
}

// Detener audio
function stopSound() {
    if (ctx) ctx.close();
}

const volumeSlider = document.getElementById("volume");
volumeSlider.addEventListener("input", () => {
    if (masterGain) {
        masterGain.gain.value = volumeSlider.value / 100 * 0.25;
    }
});

// 🎹 Teclas en pantalla
const keys = document.querySelectorAll(".white_key, .black_key");
keys.forEach(key => {
    key.addEventListener("click", () => {
        const freq = parseFloat(key.dataset.note);
        playNote(freq);

        // Feedback visual
        key.classList.add("active");
        setTimeout(() => key.classList.remove("active"), 150);
    });
});

// ⌨️ Mapeo teclado físico → frecuencias
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
document.addEventListener("keydown", (event) => {
    const keyPressed = event.key.toLowerCase();

    if (keyMap[keyPressed]) {
        const freq = keyMap[keyPressed];
        playNote(freq);

        // Feedback visual
        const keyElement = Array.from(keys).find(
            k => parseFloat(k.dataset.note) === freq
        );
        if (keyElement) {
            keyElement.classList.add("active");
            setTimeout(() => keyElement.classList.remove("active"), 150);
        }
    }
});

// 🎶 Función para tocar una nota
function playNote(freq){
    if (!ctx) return;

    const now = ctx.currentTime;
    const oscNote = ctx.createOscillator();
    const gainNote = ctx.createGain();

    oscNote.type = 'sine';
    oscNote.frequency.value = freq;

    // Conectar oscilador → ganancia de la nota → volumen global
    oscNote.connect(gainNote);
    gainNote.connect(masterGain);

    // Envolvente simple (ataque + release)
    gainNote.gain.setValueAtTime(0, now);
    gainNote.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gainNote.gain.linearRampToValueAtTime(0, now + 0.5);

    oscNote.start(now);
    oscNote.stop(now + 0.5);
}
