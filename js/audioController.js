// This function object set up the <audiocontroller> element
function audioController(elementContext) {
  this.elementContext = elementContext; // The context of the hosting element
  this.elementContext.audioController = this; // Export this
  this.listOfChannels = []; // List of channels of this audio controller
  this.audioPlayback = new AudioPlayback(); // Create a new playback handler for this audio controller
  //TDO: ADD NEW VAR
  this.music = undefined;

  // Check if any channel has used the name already
  this.containsChannel = function containsChannel(name) {
    for (var i = 0; i < this.listOfChannels.length; ++i) {
      if (this.listOfChannels[i].title == name) return true;
    }
    return false;
  };

  // Add a new channel to this audio control
  this.addChannel = function addChannel(channel) {
    for (var i = 0; i < this.listOfChannels.length; ++i) {
      if (this.listOfChannels[i].title === channel.title) return;
    }
    this.listOfChannels.push(channel);
  };

  // Remove a specific channel from the aduio control
  this.removeChannel = function removeChannel(channel) {
    for (var i = 0; i < this.listOfChannels.length; ++i) {
      if (this.listOfChannels[i].title === channel.title) {
        this.listOfChannels.splice(i, 1);
      }
    }
  };

  // Create a new channel with specific name
  this.createChannel = function createChannel(name) {
    if (this.audioController.containsChannel(name) === true) return undefined;

    var channelElement = document.createElement("channel");
    channelElement.title = name;
    this.appendChild(channelElement);
    var obj = new Channel(channelElement);
    this.audioController.addChannel(obj);
    return obj;
  };

  // Remove all channels that are added to this audio control
  this.removeAllChannels = function removeAllChannels() {
    for (var i = 0; i < this.children.length; ++i) {
      if (this.children[i].nodeName.toLowerCase() == "channel") {
        this.audioController.removeChannel(this.children[i].Channel);
        this.removeChild(this.children[i]);
        --i;
      }
    }
  };

  // Zoom every channels to show all samples
  this.zoomToFit = function zoomToFit() {
    for (var i = 0; i < this.audioController.listOfChannels.length; ++i) {
      this.audioController.listOfChannels[i].zoomToFit();
    }
  };

  // Zoom every channels to show the first `numberOfSeconds` seconds of the samples
  this.zoomToSeconds = function zoomToSeconds(zoomStartFrom) {
    for (var i = 0; i < this.audioController.listOfChannels.length; ++i) {
      this.audioController.listOfChannels[i].zoomToSeconds(1, zoomStartFrom);
    }
  };

  // Zoom level controller
  this.zoom = function zoom() {
    this.zoomToFit();
  };

  // Play the audio
  this.play = function play() {
    // Stop, if any, the currently playing audio
    this.stop();

    // Prepare the audio sequences information
    var sampleRate = this.audioController.listOfChannels[0]
      .audioSequenceReference.sampleRate;
    var audioDataRefs = [];
    for (var i = 0; i < this.audioController.listOfChannels.length; ++i) {
      audioDataRefs.push(
        this.audioController.listOfChannels[i].audioSequenceReference.data
      );
    }

    // Pass the audio sequences information to the audio playback handler
    this.audioController.audioPlayback.play(audioDataRefs, sampleRate);
    // this.syncTime(this.audioController.audioPlayback.getCurrentTime());
  };

  // Stop the aduio playback
  this.stop = function stop() {
    this.audioController.audioPlayback.stop();
    for (var i = 0; i < this.audioController.listOfChannels.length; ++i) {
      // this.audioController.listOfChannels[i].drawTimeStroke(time);
      this.audioController.listOfChannels[i].repaint();
    }
  };

  //trigger pauseResume() in audioPlayback, add the indicator
  this.pauseResume = function pauseResume() {
    if (this.audioController.listOfChannels[0].audioSequenceReference) {
      var audioDataRefs = [];
      for (var i = 0; i < this.audioController.listOfChannels.length; ++i) {
        audioDataRefs.push(
          this.audioController.listOfChannels[i].audioSequenceReference.data
        );
      }

      this.audioController.audioPlayback.pauseResume(audioDataRefs);
      for (var i = 0; i < this.audioController.listOfChannels.length; ++i) {
        this.audioController.listOfChannels[i].repaint();
      }
      this.syncTime(
        this.audioController.audioPlayback.getCurrentTime(),
        this.audioController.audioPlayback.isPlaying ? "Resumed" : "Paused"
      ); //return a percentage for syncTime to draw stroke

      return this.audioController.audioPlayback.isPlaying;
    }
  };

  this.pause = function pause() {
    this.audioController.audioPlayback.pause();
    for (var i = 0; i < this.audioController.listOfChannels.length; ++i) {
      this.audioController.listOfChannels[i].repaint();
    }
    this.syncTime(
      this.audioController.audioPlayback.getCurrentTime(),
      this.audioController.audioPlayback.isPlaying ? "Resumed" : "Paused"
    );
  };

  this.syncTime = function syncTime(time, text) {
    for (var i = 0; i < this.audioController.listOfChannels.length; ++i) {
      this.audioController.listOfChannels[i].drawTimeStroke(time, text);
    }
  };

  // Update the download link
  this.updateDownloadLink = function updateDownloadLink(saveLink) {
    var url = this.toWave().toBlobUrlAsync("application/octet-stream");
    $(savelink).attr("href", url);
    var fileName = currentSongName;

    fileName += "_processed";
    fileName += ".wav";
    $(savelink).attr("download", fileName);
  };

  // Export to WAV format
  this.toWave = function toWave() {
    var wave = new WaveTrack();

    var sequenceList = [];
    for (var i = 0; i < this.audioController.listOfChannels.length; ++i) {
      sequenceList.push(
        this.audioController.listOfChannels[i].audioSequenceReference
      );
    }

    wave.fromAudioSequences(sequenceList);
    return wave;
  };

  this.generateSong = function generateSong() {
    if (this.music == null) return;
    for (var i = 0; i < this.audioController.listOfChannels.length; ++i) {
      this.audioController.listOfChannels[i].generateMusic(this.music);
    }
    this.postprocess();
    this.updateDownloadLink("#savelink");
    this.zoom();
  };

  // Every channels generate music according to the JSON data
  this.generateMusicFromMIDI = function generateMusicFromMIDI(data) {
    for (var i = 0; i < this.audioController.listOfChannels.length; ++i) {
      this.audioController.listOfChannels[i].generateMusic(data);
    }
    this.postprocess();
    this.updateDownloadLink("#savelink");
    this.zoom();
    this.music = data;
  };

  // Apply post-processings to the waveform
  this.postprocess = function postprocess() {
    for (var i = 1; i <= currentEffects.length; ++i) {
      console.log("Applying postprocessing " + i + ": ", currentEffects[i - 1]);
      Postprocessor.postprocess(
        this.audioController.listOfChannels,
        currentEffects[i - 1],
        i
      );
    }
  };

  // Export some functions to the HTML element
  this.elementContext.createChannel = this.createChannel;
  this.elementContext.removeAllChannels = this.removeAllChannels;
  this.elementContext.zoomToFit = this.zoomToFit;
  this.elementContext.zoomToCycles = this.zoomToCycles;
  this.elementContext.zoomToSeconds = this.zoomToSeconds;
  this.elementContext.zoom = this.zoom;
  this.elementContext.play = this.play;
  this.elementContext.stop = this.stop;
  this.elementContext.pauseResume = this.pauseResume;
  this.elementContext.updateDownloadLink = this.updateDownloadLink;
  this.elementContext.toWave = this.toWave;
  this.elementContext.generateWaveform = this.generateWaveform;
  this.elementContext.generateMusicFromMIDI = this.generateMusicFromMIDI;
  this.elementContext.postprocess = this.postprocess;
  //TODO: ADD FUNC TO EXPORT
  this.elementContext.generateSong = this.generateSong;
  this.elementContext.syncTime = this.syncTime;
  this.elementContext.pause = this.pause;

  // Disable selection of this element
  this.elementContext.onselectstart = function () {
    return false;
  };
}

// Function for kick starting the initialization process
function initializeAudioControllers() {
  $("audioController").each(function (index, element) {
    var controller = new audioController(element);
    $("body").click(function () {
      if (controller.audioPlayback.audioContext.state != "running") {
        controller.audioPlayback.audioContext.resume().then(function () {
          console.log("Audio Context is resumed!");
        });
      }
    });
  });
}
