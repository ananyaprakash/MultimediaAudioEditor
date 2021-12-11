function musicPlayer(elementContext) {
  this.elementContext = elementContext; // The context of the hosting element
  this.elementContext.musicPlayer = this; // Export this
  var audio = new Audio();
  audio.src='../despacito.wav';
  audio.controls = true;
  audio.loop = true;
  audio.autoplay = false;

  var canvas, ctx, source, context, analyser, fbc_array, bars, bar_x, bar_width, bar_height;
  window.addEventListener("load", initMusicPlayer),
  function initMusicPlayer(){
    document.getElementById('audio_box').appendChild(audio);
    context = new webkitAudioContext();
    analyser = context.createAnalyser();
    canvas = document.getElementById('analyser_render');
    ctx = canvas.getContext('2d');
    source = context.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(context.destination);
    frameLooper();
  }

  function frameLooper(){
    window.weblitRequestAnimationFrame(frameLooper);
    fbc_array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(fbc_array);
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.fillStyle = '#F2EB88';
    bars = 300;
    for (var i = 0 ; i < bars; i++){
      bar_x = i * 3;
      bar_width = 2;
      bar_height = -(fbc_array[i] /2);
      ctx.fillRect(bar_x, canvas.height, bar_width, bar_height);
    }

  }
}