// This object represent the postprocessor
Postprocessor = {
  // The postprocess function takes the audio samples data and the post-processing effect name
  // and the post-processing stage as function parameters. It gathers the required post-processing
  // paramters from the <input> elements, and then applies the post-processing effect to the
  // audio samples data of every channels.
  postprocess: function (channels, effect, pass) {
    switch (effect) {
      case "phone":
        for (var c = 0; c < channels.length; ++c) {
          var audioSequence = channels[c].audioSequenceReference;
          for (var i = 0; i < audioSequence.data.length; i += 250) {
            audioSequence.data[i] += (Math.random() * 0.125) / 2 - 0.125 / 4;
            if (audioSequence.data[i] > 1) audioSequence.data[i] = 1;
            else if (audioSequence.data[i] < -1) audioSequence.data[i] = -1;
          }
          channels[c].setAudioSequence(audioSequence);
        }
        break;
      case "reverse":
        for (var c = 0; c < channels.length; ++c) {
          var audioSequence = channels[c].audioSequenceReference;
          audioSequence.data.reverse();
          channels[c].setAudioSequence(audioSequence);
        }
        break;

      case "boost":
        var volumnPercentage = parseInt($("#volumn").val()) / 100;

        var maxGain = -1.0;
        for (var c = 0; c < channels.length; ++c) {
          var audioSequence = channels[c].audioSequenceReference;
          var gain = audioSequence.getGain();
          if (gain > maxGain) {
            maxGain = gain;
          }
        }

        var multiplier = volumnPercentage / maxGain;

        for (var c = 0; c < channels.length; ++c) {
          var audioSequence = channels[c].audioSequenceReference;
          for (var i = 0; i < audioSequence.data.length; ++i) {
            audioSequence.data[i] *= multiplier;
          }
          channels[c].setAudioSequence(audioSequence);
        }
        break;

      case "adsr":
        var attackDuration =
          parseFloat($("#adsr-attack-duration").data("p" + pass)) * sampleRate;
        var decayDuration =
          parseFloat($("#adsr-decay-duration").data("p" + pass)) * sampleRate;
        var releaseDuration =
          parseFloat($("#adsr-release-duration").data("p" + pass)) * sampleRate;
        var sustainLevel =
          parseFloat($("#adsr-sustain-level").data("p" + pass)) / 100.0;
        for (var c = 0; c < channels.length; ++c) {
          var audioSequence = channels[c].audioSequenceReference;
          var sustainDuration =
            audioSequence.data.length -
            attackDuration -
            decayDuration -
            releaseDuration;

          for (var i = 0; i < audioSequence.data.length; ++i) {
            if (i < attackDuration) {
              audioSequence.data[i] *= lerp(0, 1, i / attackDuration);
            } else if (
              i >= attackDuration &&
              i < attackDuration + decayDuration
            ) {
              audioSequence.data[i] *= lerp(
                1,
                sustainLevel,
                (i - attackDuration) / decayDuration
              );
            } else if (
              i >= attackDuration + decayDuration &&
              i < attackDuration + decayDuration + sustainDuration
            ) {
              audioSequence.data[i] *= sustainLevel;
            } else {
              audioSequence.data[i] *= lerp(
                sustainLevel,
                0,
                (i - sustainDuration - attackDuration - decayDuration) /
                  releaseDuration
              );
            }
          }
          channels[c].setAudioSequence(audioSequence);
        }
        break;

      case "ma":
        // var e = document.getElementById("filter");
        var selected = $("#filter input:radio:checked").val();
        console.log("selected", selected);

        var result = [];
        for (var c = 0; c < channels.length; ++c) {
          var audioSequence = channels[c].audioSequenceReference;
          for (var i = 0; i < audioSequence.data.length; ++i) {
            if (i > 0) {
              if (selected == "lpf") {
                result[i] =
                  (audioSequence.data[i] + audioSequence.data[i - 1]) / 2;
              } else if (selected == "hpf") {
                result[i] =
                  (audioSequence.data[i] - audioSequence.data[i - 1]) / 2;
              } else result[i] = audioSequence.data[i];
            } else result[i] = audioSequence.data[i];
          }
          audioSequence.data = result;

          channels[c].setAudioSequence(audioSequence);
        }
        console.log(selected, " done");

        break;

      case "fadeinout":
        console.log(
          "entered fade out secs",
          parseFloat($("#fadeout-duration").data("p" + pass))
        );
        var fadeInSamples =
          parseFloat($("#fadein-duration").data("p" + pass)) * sampleRate; //parseFloat($("#fadein-duration").data("p" + pass))
        var fadeOutSamples =
          parseFloat($("#fadeout-duration").data("p" + pass)) * sampleRate;
        var fadeInRate = parseFloat($("#fadein-rate").data("p" + pass));
        var fadeOutRate = parseFloat($("#fadeout-rate").data("p" + pass));
        console.log("fade in sampl", fadeInSamples);
        console.log("fade out sampl", fadeOutSamples);
        for (var c = 0; c < channels.length; ++c) {
          // Get the sample data of the channel
          var audioSequence = channels[c].audioSequenceReference;
          console.log("audioseq", audioSequence.data.length);

          for (var i = 0; i < audioSequence.data.length; ++i) {
            if (i < fadeInSamples) {
              var t = i / sampleRate;
              var multiplier = Math.pow(
                lerp(0, 1, i / fadeInSamples),
                1 / fadeInRate
              );
              if (i == fadeInSamples - 1) console.log("mul in ", multiplier);
              audioSequence.data[i] = audioSequence.data[i] * multiplier;
            } else if (i >= audioSequence.data.length - fadeOutSamples) {
              var t =
                (i - (audioSequence.data.length - fadeOutSamples)) / sampleRate;

              var multiplier = Math.exp(-t / fadeOutRate);
              audioSequence.data[i] = audioSequence.data[i] * multiplier;
            }
          } // Update the sample data with the post-processed data

          channels[c].setAudioSequence(audioSequence);
        }

        break;

      case "tremolo":
        var tremoloFrequency = parseFloat(
          $("#tremolo-frequency").data("p" + pass)
        );
        var wetness = parseFloat($("#tremolo-wetness").data("p" + pass));

        for (var c = 0; c < channels.length; ++c) {
          var audioSequence = channels[c].audioSequenceReference;
          for (var i = 0; i < audioSequence.data.length; ++i) {
            var currentTime = i / audioSequence.data.length;
            var multiplier =
              (Math.sin(
                2.0 * Math.PI * tremoloFrequency * currentTime - Math.PI / 2
              ) +
                1) /
              2;
            multiplier = multiplier * wetness + (1 - wetness);
            audioSequence.data[i] *= multiplier;
          }
          channels[c].setAudioSequence(audioSequence);
        }
        break;
      case "echo":
        var delayLineDuration = parseFloat(
          $("#echo-delay-line-duration").data("p" + pass)
        );
        var multiplier = parseFloat($("#echo-multiplier").data("p" + pass));

        for (var c = 0; c < channels.length; ++c) {
          var audioSequence = channels[c].audioSequenceReference;
          var delayLine = [];
          for (var i = 0; i < delayLineDuration * sampleRate; i++) {
            delayLine.push(0);
          }

          for (var i = 0; i < audioSequence.data.length; ++i) {
            var echo = delayLine[i % delayLine.length];
            audioSequence.data[i] += echo * multiplier;
            delayLine[i % delayLine.length] = audioSequence.data[i];
          }
          channels[c].setAudioSequence(audioSequence);
        }
        break;
      case "reverb":
        // Obtain all the required parameters
        var delayLineDuration = parseFloat(
          $("#reverb-delay-line-duration").data("p" + pass)
        );
        var delayLineDuration2 = parseFloat(
          $("#reverb-delay-line-duration2").data("p" + pass)
        );
        var delayLineDuration3 = parseFloat(
          $("#reverb-delay-line-duration3").data("p" + pass)
        );
        var delayLineDuration4 = parseFloat(
          $("#reverb-delay-line-duration4").data("p" + pass)
        );
        var delayLineDuration5 = parseFloat(
          $("#reverb-delay-line-duration-allpass").data("p" + pass)
        );
        var delayLineDuration6 = parseFloat(
          $("#reverb-delay-line-duration-allpass2").data("p" + pass)
        );
        var multiplier = parseFloat($("#reverb-multiplier").data("p" + pass));
        var multiplier2 = parseFloat($("#reverb-multiplier2").data("p" + pass));
        var multiplier3 = parseFloat($("#reverb-multiplier3").data("p" + pass));
        var multiplier4 = parseFloat($("#reverb-multiplier4").data("p" + pass));
        var gain = parseFloat($("#reverb-gain").data("p" + pass));
        var gain2 = parseFloat($("#reverb-gain2").data("p" + pass));
        var wetPercentage = parseFloat($("#dry-wet-mix").val());

        var combFilter = function (
          samples,
          delayLineDuration,
          multiplier,
          sampleRate
        ) {
          var delayLineLength = Math.floor(delayLineDuration * sampleRate);
          var delayLine = new Array(delayLineLength).fill(0);
          var sample = 0;
          for (var i = 0; i < samples.length; ++i) {
            // Get the echoed sample from the delay line
            sample = delayLine[i % delayLineLength];
            // Add the echoed sample to the current sample, with a multiplier
            samples[i] = samples[i] + multiplier * sample;
            // Put the current sample into the delay line
            delayLine[i % delayLineLength] = samples[i];
          }

          // Boost algorithm
          var max = 0,
            min = 0;
          for (var i = 0; i < samples.length; i++) {
            if (max < samples[i]) max = samples[i];
            if (min > samples[i]) min = samples[i];
          }
          min = -1 * min;
          var biggest = Math.max(max, min);
          var boostMultiplier = 1 / biggest;
          for (var i = 0; i < samples.length; i++) {
            samples[i] = samples[i] * boostMultiplier;
          }
          return samples;
        };

        var allPassFilter = function (
          samples,
          delayLineDuration,
          multiplier,
          sampleRate
        ) {
          var delayLineLength = Math.floor(delayLineDuration * sampleRate);
          var delayLine = new Array(delayLineLength).fill(0);
          var sample = 0;
          for (var i = 0; i < samples.length; ++i) {
            // Get the echoed sample from the delay line
            sample = delayLine[i % delayLineLength];
            // Put the current sample into the delay line
            delayLine[i % delayLineLength] = samples[i] + sample * multiplier;
            sample = sample * (1 - Math.pow(multiplier, 2));
            samples[i] = sample + samples[i] * -multiplier;
          }

          // Boost algorithm
          var max = 0,
            min = 0;
          for (var i = 0; i < samples.length; i++) {
            if (max < samples[i]) max = samples[i];
            if (min > samples[i]) min = samples[i];
          }
          min = -1 * min;
          var biggest = Math.max(max, min);
          var boostMultiplier = 1 / biggest;
          for (var i = 0; i < samples.length; i++) {
            samples[i] = samples[i] * boostMultiplier;
          }

          return samples;
        };

        for (var c = 0; c < channels.length; ++c) {
          // Get the sample data of the channel
          var audioSequence = channels[c].audioSequenceReference;

          // deep copy
          var originalData = JSON.parse(JSON.stringify(audioSequence.data));

          var combFilterSamples1 = combFilter(
            audioSequence.data,
            delayLineDuration,
            multiplier,
            sampleRate
          );
          var combFilterSamples2 = combFilter(
            audioSequence.data,
            delayLineDuration2,
            multiplier2,
            sampleRate
          );
          var combFilterSamples3 = combFilter(
            audioSequence.data,
            delayLineDuration3,
            multiplier3,
            sampleRate
          );
          var combFilterSamples4 = combFilter(
            audioSequence.data,
            delayLineDuration4,
            multiplier4,
            sampleRate
          );

          var combFilterOutput = new Array(audioSequence.data.length).fill(0);
          for (var i = 0; i < audioSequence.data.length; i++) {
            combFilterOutput[i] =
              combFilterSamples1[i] +
              combFilterSamples2[i] +
              combFilterSamples3[i] +
              combFilterSamples4[i];
          }

          var allPassFilterSamples1 = allPassFilter(
            combFilterOutput,
            delayLineDuration5,
            gain,
            sampleRate
          );
          var allPassFilterSamples2 = allPassFilter(
            allPassFilterSamples1,
            delayLineDuration6,
            gain2,
            sampleRate
          );

          // Dry/wet mix
          var mixedOutput = new Array(audioSequence.data.length).fill(0);
          for (var i = 0; i < audioSequence.data.length; i++) {
            mixedOutput[i] =
              originalData[i] * (1 - wetPercentage) +
              wetPercentage * allPassFilterSamples2[i];
          }
          audioSequence.data = mixedOutput;

          channels[c].setAudioSequence(audioSequence);
        }

        // // Simple reverb algorithm
        // for(var c = 0; c < channels.length; ++c) {
        //     // Get the sample data of the channel
        //     var audioSequence = channels[c].audioSequenceReference;
        //     // Create a new empty delay line
        //     var delayLine = new Array(delayLineLength).fill(0);
        //     var delayLine2 = new Array(delayLineLength).fill(0);
        //     var delayLine3 = new Array(delayLineLength).fill(0);
        //     // Create samples
        //     var sample = 0;
        //     var sample2 = 0;
        //     var sample3 = 0;
        //     // Get the sample data of the channel
        //     for(var i = 0; i < audioSequence.data.length; ++i) {
        //         sample = delayLine[i % delayLineLength];
        //         sample2 = delayLine2[i % delayLineLength];
        //         sample3 = delayLine3[i % delayLineLength];

        //         audioSequence.data[i] = audioSequence.data[i] +
        //                                   (multiplier * sample +
        //                                     multiplier2 * sample2 +
        //                                     multiplier3 * sample3) * 0.5;

        //         delayLine[i % delayLineLength] = audioSequence.data[i];
        //         delayLine2[i % delayLineLength] = audioSequence.data[i];
        //         delayLine3[i % delayLineLength] = audioSequence.data[i];

        //     }

        //     // Update the sample data with the post-processed data
        //     channels[c].setAudioSequence(audioSequence);
        // }
        break;

      default:
        // Do nothing
        break;
    }
    return;
  },
};
