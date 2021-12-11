# multimedia-audio-project

COMP 4431 mini project

Added the code in post-processor.js for:

- `MA filter` - create a Moving Average filter for lowpass and highpass filtering
- `fade` - create exponential fade in and fadeout
- `reverb` - create a comb filter function and an all pass filter function for the algorithm

Add UI related elements in audioproc.html:

- the carousel for song list, and the pictures for each of the songs
- the tab in "column 1: tab of post processing to apply" (can find it by search)
- the button for start, pause, resume, and stop
- the parameters in id with "lowpass", "fade" and "reverb"

Add UI related logic in main.js:

- showPPButton: add the post-processing option in switch & add the logic
- logic for start, pause, resume, and stop 
