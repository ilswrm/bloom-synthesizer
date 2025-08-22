let ctx; //motor de audio (AudioContext), sin esto no hay sonido
let osc; //el generador de onda (OscillatorNode)
let gain; // el control de volumen (GainNode)

function startSound (){
    ctx = new (window.AudioContext || window.AudioContext)();

    //la caja que genera el sonido
    osc = ctx.createOscillator();
    osc.type = 'sine'; //tipo de onda
    osc.frequency.value = 440;

    //caja que controla el volumen
    gain = ctx.createGain();
    gain.gain.value = 0.2; //volumen de 0.0 a 1.0, al nodo de ganancia que guardé en la variable gain, cambia su parámetro interno de volumen a 0.2

    // Conexiones: Oscilador → Ganancia → Parlantes
    osc.connect(gain);
    gain.connect(ctx.destination);

    //Inicia el oscilador
    osc.start();

}

function stopSound(){
    osc.stop();
}

const slider = document.getElementById("freq");

slider.addEventListener("input", function(){
    const now = ctx.currentTime;
    osc.frequency.setTargetAtTime (slider.value, now, 0.5);

});
// Seleccionar teclas
const keys = document.querySelectorAll(".white_key, .black_key");
keys.forEach (key => { // Click en teclas
    key.addEventListener("click", () => {
        const now = ctx.currentTime;
        const freq = parseFloat(key.dataset.note);
        osc.frequency.setTargetAtTime(freq, now, 0.1);

    // Feedback visual
        key.classList.add("active");
        setTimeout(() => key.classList.remove("active"), 200);

    });
});
// Mapeo teclado físico
const keyMap = {
    'a': 261.63, //Do
    'w': 277.18,  //Do#
    's': 293.66, //Re
    'e': 311.13, //Re#
    'd': 329.63,  //Mi
    'f': 349.23, //Fa
    'r': 369.99, //Fa#
    'g': 392.00, //Sol
    't': 415.30, //Sol#
    'h': 440.00, //La
    'y': 466.16, //La#
    'j':493.88 //Si
            
};
// Escuchar teclado físico
document.addEventListener("keydown", (event) =>{
    const key = event.key.toLowerCase();
    if (keyMap[key]){
        const now = ctx.currentTime;
        osc.frequency.setTargetAtTime(keyMap[key], now, 0.1);

        // Feedback visual de la tecla correspondiente
        const htmlKey = document.querySelector (`[data-note="${keyMap[key]}"]`);
        if(htmlKey){
            htmlKey.classList.add("active");
            setTimeout(()=> htmlKey.classList.remove("active"), 200);
        }
    }
});