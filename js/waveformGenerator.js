// This object represent the waveform generator
var WaveformGenerator = {
  // The generateWaveform function takes 4 parameters:
  //     - type, the type of waveform to be generated
  //     - frequency, the frequency of the waveform to be generated
  //     - amp, the maximum amplitude of the waveform to be generated
  //     - duration, the length (in seconds) of the waveform to be generated
  generateWaveform: function (type, frequency, amp, duration) {
    var nyquistFrequency = sampleRate / 2; // Nyquist frequency
    var totalSamples = Math.floor(sampleRate * duration); // Number of samples to generate
    var result = []; // The temporary array for storing the generated samples

    switch (type) {
      case "sine-time": // Sine wave, time domain
        for (var i = 0; i < totalSamples; ++i) {
          var currentTime = i / sampleRate;
          result.push(amp * Math.sin(2.0 * Math.PI * frequency * currentTime));
        }
        break;

      default:
        break;
    }

    return result;
  },
};
