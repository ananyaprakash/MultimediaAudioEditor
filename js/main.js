// Retrieve the sampling rate (usually 44100 or 48000)
var sampleRate = new (window.AudioContext || window.webkitAudioContext)()
  .sampleRate;
var duration = 6.0; // The default duration of the  waveform, in seconds
var audioControl = null; // The 'audioController' instance
//TODO: change waveform type to song
var currentWaveformType = "sine-time"; // Currently selected waveform type
var currentEffects = []; // Currently selected post-processings
var currentZoomLevel = "all"; // Currently selected zoom mode
var zoomStartFrom = 0.0; // Zoom start from (in seconds)
var currentSongName = undefined;

// Event handler for the 'change' event of the zoom <select>
function changeZoomLevel(e) {
  currentZoomLevel = $("#zoomLevel").val();
  if (currentZoomLevel == "all") {
    $("#zoomStartFrom").prop("disabled", true);
  } else {
    $("#zoomStartFrom").prop("disabled", false);
  }
  zoomStartFrom = parseFloat($("#zoomStartFrom").val());
  audioControl.zoom();
}

// Handle the post-processings tabs
function updatePostProcessingPaneInfo(target) {
  // The "data-pp" attribute stores which stage the post-processing is, e.g. 1 for post-processing 1
  var ppStage = parseInt(target.data("pp"));

  // Update the tab's title to the newly selected post-processing
  target.parents("li").find("span.title").html(target.html());

  // Update the currently selected post-processing stored in the memory
  currentEffects[ppStage - 1] = target.attr("href").substring(1);

  // In the tab pane, find every parameters control <input>s
  $(target.attr("href") + " input").each(function (i, e) {
    // Update their values to the previously set value, if any
    var oldValue = $(e).data("p" + ppStage);
    if ($(e).data("p" + ppStage)) {
      $(e).val(oldValue);
    }

    // Set the "data-active" attribute to "pX", so that when the <input> element
    // is changed, the event handler knows which "data-pX" need to be updated,
    // and store the newly selected value
    $(e).data("active", "p" + ppStage);
  });
}

// Event handler for the 'click' event of the 'btnImportMIDI'
// Read the JSON file from the file input
function importMIDI(e) {
  // Stop the audio that is currently playing back, if any
  audioControl.stop();

  // Disable the 'Import' and 'Save Music' buttons
  // $("#saveMidiLink").addClass("disabled");
  $("button.btn-import-json").prop("disabled", true);
  $("#btnPauseResume").prop("disabled", true);
  $("#btnPlay").prop("disabled", true);
  $("#btnStop").prop("disabled", true);
  clearEffects();

  console.log("Generating music from customized MIDI...");

  if (
    $("#importMidiJSONFile")[0].files &&
    $("#importMidiJSONFile")[0].files.length > 0
  ) {
    var file = $("#importMidiJSONFile")[0].files[0];

    if (file.name.split(".").pop() == "json") {
      // Ignore non-JSON file
      var reader = new FileReader();

      reader.onload = (function (file) {
        return function (e) {
          try {
            var data = JSON.parse(e.target.result);
            currentSongName = file.name.split(".")[0];
            console.log("Automatically Boost...");
            currentEffects.push("boost");
            // Start generating the music
            audioControl.generateMusicFromMIDI(data);
            $("#volumn").prop("disabled", false);
            // Enable the 'Import' and 'Save Music' buttons
          } catch (err) {
            console.log(err);
            alert("Failed to load the JSON file");
          } finally {
            // Enable the 'Import' button
            $("#btnImportMIDI").prop("disabled", false);
          }
        };
      })(file);

      reader.readAsText(file);

      $("button.btn-import-json").prop("disabled", false);
      $("#btnPlay").prop("disabled", false);
      $("#btnStop").prop("disabled", false);
    }
  } else {
    alert("Please select a JSON file first!");
    // Enable the 'Import' button
    $("#btnImportMIDI").prop("disabled", false);
  }
}

//TODO: ADD: FUNC
function togglePauseResume(e) {
  var isPlaying = audioControl.pauseResume();
  var target = $(e.target);
  if (target.prop("tagName") !== "BUTTON") {
    target = target.parents("button");
  }

  if (isPlaying) {
    document.getElementById("icon-Pause").style.display = "inline";
    document.getElementById("icon-Play").style.display = "none";
  } else {
    document.getElementById("icon-Play").style.display = "inline";
    document.getElementById("icon-Pause").style.display = "none";
  }
}

//directly import the json as music through clicking Select button
function importJsonSong(e) {
  audioControl.stop();
  $("#btnPauseResume").prop("disabled", true);
  $("#btnPlay").prop("disabled", true);
  $("#btnStop").prop("disabled", true);
  clearEffects();

  var target = $(e.target);

  if (target.prop("tagName") !== "BUTTON") {
    target = target.parents("button");
  }
  const songNumber = target[0].id.split("-")[2];
  var file;

  switch (songNumber) {
    case "1":
      file = "music/despacito.json";
      currentSongName = "despacito";
      break;
    case "2":
      file = "music/let_it_go.json";
      currentSongName = "let_it_go";
      break;
    case "3":
      file = "music/moonlight_sonata.json";
      currentSongName = "moonlight_sonata";
      break;
    case "4":
      file = "music/phantom_of_the_opera.json";
      currentSongName = "phantom_of_the_opera";
      break;
    case "5":
      file = "music/art_of_fugue.json";
      currentSongName = "art_of_fugue";
      break;
    case "6":
      file = "music/beauty_and_the_beast.json";
      currentSongName = "beauty_and_the_beast";
      break;
    case "7":
      file = "music/small_world.json";
      currentSongName = "small_world";
      break;
    case "8":
      file = "music/turkish_march.json";
      currentSongName = "turkish_march";
      break;
    case "9":
      file = "music/let_it_go_short.json";
      currentSongName = "let_it_go_short";
      break;
    case "10":
      file = "music/despacito_intro.json";
      currentSongName = "despacito_intro";
      break;
    case "11":
      file = "music/small_world_intro.json";
      currentSongName = "small_world_into";
      break;
  }

  console.log("Generating music from MIDI...");

  fetch(file)
    .then((response) => response.json())
    .then((jsonResponse) => {
      try {
        console.log("Automatically Boost...");
        currentEffects.push("boost");
        audioControl.generateMusicFromMIDI(jsonResponse);
        $("#btnPlay").prop("disabled", false);
        $("#btnStop").prop("disabled", false);
        $("#volumn").prop("disabled", false);
      } catch (err) {
        console.log(err);
        alert("Failed to load the JSON file");
      }
    });
}

function clearEffects() {
  var allAddBtn = document.getElementsByClassName("PP-btn-add");
  var allRemoveBtn = document.getElementsByClassName("PP-btn-remove");
  var allTickIcon = document.getElementsByClassName("selectedEffect");

  $("#adsr-attack-duration").prop("disabled", true);
  $("#adsr-decay-duration").prop("disabled", true);
  $("#adsr-sustain-level").prop("disabled", true);
  $("#adsr-release-duration").prop("disabled", true);
  $("#tremolo-frequency").prop("disabled", true);
  $("#tremolo-wetness").prop("disabled", true);
  $("#echo-delay-line-duration").prop("disabled", true);
  $("#echo-multiplier").prop("disabled", true);
  $("#fadein-duration").prop("disabled", true);
  $("#fadeout-duration").prop("disabled", true);
  $("#fadein-rate").prop("disabled", true);
  $("#fadeout-rate").prop("disabled", true);
  $("#reverb-multiplier").prop("disabled", true);
  $("#reverb-multiplier2").prop("disabled", true);
  $("#reverb-multiplier3").prop("disabled", true);
  $("#reverb-multiplier4").prop("disabled", true);
  $("#reverb-delay-line-duration").prop("disabled", true);
  $("#reverb-delay-line-duration2").prop("disabled", true);
  $("#reverb-delay-line-duration3").prop("disabled", true);
  $("#reverb-delay-line-duration4").prop("disabled", true);
  $("#reverb-gain").prop("disabled", true);
  $("#reverb-gain2").prop("disabled", true);
  $("#reverb-delay-line-duration-allpass").prop("disabled", true);
  $("#reverb-delay-line-duration-allpass2").prop("disabled", true);
  $("#dry-wet-mix").prop("disabled", true);

  //reset all buttons
  Object.values(allAddBtn).forEach((btn) => (btn.style.display = "block"));
  Object.values(allRemoveBtn).forEach((btn) => (btn.style.display = "none"));
  Object.values(allTickIcon).forEach((icon) => (icon.style.display = "none"));
  currentEffects = []; //clear effects
}

function updateVolumn(e) {
  updateSongDisplay();
}

//TODO: EDIT FUNCTION
//update the UI elements related to add/remove a post-processing effect
function showPPButton(e) {
  if (currentSongName == null) {
    window.alert("Select a song first!");
    return;
  }
  var target = $(e.target);
  //find the button
  if (target.prop("tagName") !== "BUTTON") {
    target = target.parents("button");
  }
  var ppType = target[0].id.split("-")[0];
  var ppAction = target[0].id.split("-")[1];

  switch (ppType) {
    case "reverse":
      if (ppAction === "add") {
        currentEffects.push("reverse");
        document.getElementById(ppType + "-remove").style.display = "block";
        document.getElementById(ppType + "-checked").style.display = "inline";
      } else {
        currentEffects = currentEffects.filter((item) => item !== "reverse");
        document.getElementById(ppType + "-add").style.display = "block";
        document.getElementById(ppType + "-checked").style.display = "none";
      }
      document.getElementById(ppType + "-" + ppAction).style.display = "none";
      break;
    case "adsr":
      if (ppAction === "add") {
        currentEffects.push("adsr");
        $("#adsr-attack-duration").prop("disabled", false);
        $("#adsr-decay-duration").prop("disabled", false);
        $("#adsr-sustain-level").prop("disabled", false);
        $("#adsr-release-duration").prop("disabled", false);
        document.getElementById(ppType + "-remove").style.display = "block";
        document.getElementById(ppType + "-checked").style.display = "inline";
        updatePPstage(currentEffects.indexOf("adsr") + 1, "adsr");
      } else {
        currentEffects = currentEffects.filter((item) => item !== "adsr");
        $("#adsr-attack-duration").prop("disabled", true);
        $("#adsr-decay-duration").prop("disabled", true);
        $("#adsr-sustain-level").prop("disabled", true);
        $("#adsr-release-duration").prop("disabled", true);
        document.getElementById(ppType + "-add").style.display = "block";
        document.getElementById(ppType + "-checked").style.display = "none";
      }
      document.getElementById(ppType + "-" + ppAction).style.display = "none";
      break;
    case "tremolo":
      if (ppAction === "add") {
        currentEffects.push("tremolo");
        $("#tremolo-frequency").prop("disabled", false);
        $("#tremolo-wetness").prop("disabled", false);
        document.getElementById(ppType + "-remove").style.display = "block";
        document.getElementById(ppType + "-checked").style.display = "inline";
        updatePPstage(currentEffects.indexOf("tremolo") + 1, "tremolo");
      } else {
        currentEffects = currentEffects.filter((item) => item !== "tremolo");
        $("#tremolo-frequency").prop("disabled", true);
        $("#tremolo-wetness").prop("disabled", true);
        document.getElementById(ppType + "-add").style.display = "block";
        document.getElementById(ppType + "-checked").style.display = "none";
      }
      document.getElementById(ppType + "-" + ppAction).style.display = "none";
      break;
    case "echo":
      if (ppAction === "add") {
        currentEffects.push("echo");
        $("#echo-delay-line-duration").prop("disabled", false);
        $("#echo-multiplier").prop("disabled", false);
        document.getElementById(ppType + "-remove").style.display = "block";
        document.getElementById(ppType + "-checked").style.display = "inline";
        updatePPstage(currentEffects.indexOf("echo") + 1, "echo");
      } else {
        currentEffects = currentEffects.filter((item) => item !== "echo");
        $("#echo-delay-line-duration").prop("disabled", true);
        $("#echo-multiplier").prop("disabled", true);
        document.getElementById(ppType + "-add").style.display = "block";
        document.getElementById(ppType + "-checked").style.display = "none";
      }
      document.getElementById(ppType + "-" + ppAction).style.display = "none";
      break;
    case "ma":
      if (ppAction === "add") {
        currentEffects.push("ma");
        $("#ma-none").prop("disabled", false);
        $("#ma-lpf").prop("disabled", false);
        $("#ma-hpf").prop("disabled", false);
        document.getElementById(ppType + "-remove").style.display = "block";
        document.getElementById(ppType + "-checked").style.display = "inline";
        updatePPstage(currentEffects.indexOf("ma") + 1, "ma");
      } else {
        currentEffects = currentEffects.filter((item) => item !== "ma");
        $("#ma-none").prop("disabled", true);
        $("#ma-lpf").prop("disabled", true);
        $("#ma-hpf").prop("disabled", true);
        document.getElementById(ppType + "-add").style.display = "block";
        document.getElementById(ppType + "-checked").style.display = "none";
      }
      document.getElementById(ppType + "-" + ppAction).style.display = "none";
      break;

    case "fadeinout":
      if (ppAction === "add") {
        currentEffects.push("fadeinout");
        $("#fadein-duration").prop("disabled", false);
        $("#fadeout-duration").prop("disabled", false);
        $("#fadein-rate").prop("disabled", false);
        $("#fadeout-rate").prop("disabled", false);
        document.getElementById(ppType + "-remove").style.display = "block";
        document.getElementById(ppType + "-checked").style.display = "inline";
        updatePPstage(currentEffects.indexOf("fadeinout") + 1, "fadeinout");
      } else {
        currentEffects = currentEffects.filter((item) => item !== "fadeinout");
        $("#fadein-duration").prop("disabled", true);
        $("#fadeout-duration").prop("disabled", true);
        $("#fadein-rate").prop("disabled", true);
        $("#fadeout-rate").prop("disabled", true);
        document.getElementById(ppType + "-add").style.display = "block";
        document.getElementById(ppType + "-checked").style.display = "none";
      }
      document.getElementById(ppType + "-" + ppAction).style.display = "none";
      break;
    case "reverb":
      if (ppAction === "add") {
        $("#reverb-multiplier").prop("disabled", false);
        $("#reverb-multiplier2").prop("disabled", false);
        $("#reverb-multiplier3").prop("disabled", false);
        $("#reverb-multiplier4").prop("disabled", false);
        $("#reverb-delay-line-duration").prop("disabled", false);
        $("#reverb-delay-line-duration2").prop("disabled", false);
        $("#reverb-delay-line-duration3").prop("disabled", false);
        $("#reverb-delay-line-duration4").prop("disabled", false);
        $("#reverb-gain").prop("disabled", false);
        $("#reverb-gain2").prop("disabled", false);
        $("#reverb-delay-line-duration-allpass").prop("disabled", false);
        $("#reverb-delay-line-duration-allpass2").prop("disabled", false);
        $("#dry-wet-mix").prop("disabled", false);
        currentEffects.push("reverb");
        document.getElementById(ppType + "-remove").style.display = "block";
        document.getElementById(ppType + "-checked").style.display = "inline";
        updatePPstage(currentEffects.indexOf("reverb") + 1, "reverb");
      } else {
        $("#reverb-multiplier").prop("disabled", true);
        $("#reverb-multiplier2").prop("disabled", true);
        $("#reverb-multiplier3").prop("disabled", true);
        $("#reverb-multiplier4").prop("disabled", true);
        $("#reverb-delay-line-duration").prop("disabled", true);
        $("#reverb-delay-line-duration2").prop("disabled", true);
        $("#reverb-delay-line-duration3").prop("disabled", true);
        $("#reverb-delay-line-duration4").prop("disabled", true);
        $("#reverb-gain").prop("disabled", true);
        $("#reverb-gain2").prop("disabled", true);
        $("#reverb-delay-line-duration-allpass").prop("disabled", true);
        $("#reverb-delay-line-duration-allpass2").prop("disabled", true);
        $("#dry-wet-mix").prop("disabled", true);
        currentEffects = currentEffects.filter((item) => item !== "reverb");
        document.getElementById(ppType + "-add").style.display = "block";
        document.getElementById(ppType + "-checked").style.display = "none";
      }
      document.getElementById(ppType + "-" + ppAction).style.display = "none";
      break;
  }

  updateSongDisplay();

  console.log("c", currentEffects);
}

function updatePPstage(ppStage, pp) {
  var inputs = $($(`#${pp}-tab`).attr("href") + " input");
  inputs.each(function (i, e) {
    $(e).data("active", "p" + ppStage);
  });
}

function updateParamSetting(e) {
  var target = $(e.target);
  var activePP = target.data("active");

  if (activePP) {
    target.data(activePP, target.val());
  }
}

//ADD: Update the song waveform
function updateSongDisplay() {
  if (!$("#btnPauseResume").prop("disabled"))
    $("#btnPauseResume").prop("disabled", true);
  $("#btnPlay").prop("disabled", true);
  $("#btnStop").prop("disabled", true);
  $("#savelink").addClass("disabled");

  audioControl.pause();

  setTimeout(generateNewSong, 500);
}

function generateNewSong() {
  audioControl.generateSong();
  $("#savelink").removeClass("disabled");

  $("#btnPlay").prop("disabled", false);
  $("#btnStop").prop("disabled", false);
  $("#btnPauseResume").prop("disabled", false);
  if (!$("#btnPauseResume").prop("disabled")) audioControl.pauseResume();
}

// Set up every things when the document is fully loaded
$(document).ready(function () {
  // Check if the required WebAPIs are available
  if (
    typeof (window.AudioContext || window.webkitAudioContext) === "undefined"
  ) {
    alert(
      "Your browser has no web audio API support! Try using another browser like Google Chrome."
    );
    return;
  }

  if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
    alert(
      "Your browser has no file API support! Try using another browser like Google Chrome."
    );
    return;
  }

  // Great! Start setting up

  // First of all, bring the <audioController> online.
  // The constructor will takes the first <audioController> element and prepares
  // all the visual properties of it, sets it up so that we can use it like a normal
  // HTML DOM element.
  initializeAudioControllers();

  audioControl = document.querySelector("#audioController");

  audioControl.removeAllChannels();
  audioControl.createChannel("Left Channel");
  audioControl.createChannel("Right Channel");

  // Enable Bootstrap Toggle
  $("input[type=checkbox]").bootstrapToggle();

  //TODO: ADD EVENT HANDLERS
  $("button.PP-btn").on("click", showPPButton);
  $("button.PP-btn").on("click", function () {
    currentEffects.forEach((effect, index) => {
      var inputs = $($(`#${effect}-tab`).attr("href") + " input");
      inputs.each(function (i, e) {
        var oldValue = $(e).val(); //mark the old value
        var activePP = "p" + (currentEffects.indexOf(effect) + 1); //find the new active stage
        $(e).data("active", "p" + (index + 1));
        $(e).data(activePP, oldValue); //update value to a new active data
      });
    });
  });

  $("#btnPauseResume").on("click", togglePauseResume);
  $("button.btn-import").on("click", importJsonSong);
  $("#volumn").on("change", updateVolumn);
  $("input")
    .not("[id^=import]")
    .on("change", updateParamSetting)
    .first()
    .change();

  $("button.PP-btn-update").on("click", updateSongDisplay);

  $("#dry-wet-mix").on("change", function () {
    var percentage = parseFloat($("#dry-wet-mix").val());
    var dry = "Dry: " + ((1 - percentage) * 100).toFixed(0) + "%";
    var wet = "Wet: " + (percentage * 100).toFixed(0) + "%";
    $("#dry-percentage").text(dry);
    $("#wet-percentage").text(wet);
  });

  // Play and Stop button
  $("#btnPlay").on("click", function () {
    if (!$("#btnPlay").is(":disabled")) {
      audioControl.play();
      $("#btnPauseResume").prop("disabled", false);
      document.getElementById("icon-Pause").style.display = "inline";
      document.getElementById("icon-Play").style.display = "none";
    }
  });
  $("#btnStop").on("click", function () {
    if (!$("#btnStop").is(":disabled")) {
      audioControl.stop();
      $("#btnPauseResume").prop("disabled", true);
      document.getElementById("icon-Pause").style.display = "none";
      document.getElementById("icon-Play").style.display = "inline";
    }
  });

  // Import MIDI (in JSON format)
  $("#btnImportMIDI").on("click", importMIDI);
});
