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