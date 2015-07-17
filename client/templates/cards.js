Template.soundCard.viewmodel( function (data) {
  return {
    togglePlay: function() {
      var playingId = Session.get("playingId");

      if (playingId != data._id) {
        if (playingId != null) {
          var playing = document.getElementById(playingId);
          playing.pause();
          playing.currentTime = 0;
        }

        var audio = document.getElementById(data._id);
        audio.play();
        Session.set("playingId", data._id);

      } else {
        var playing = document.getElementById(playingId);
        playing.pause();
        playing.currentTime = 0;
        Session.set("playingId", null);
      }
    },

    isPlaying: function() {
      return data._id == Session.get("playingId");
    },

    isFound: function() {
      return Sounds.findOne({_id: data._id}).found;
    }
  }
});

var lastClickTimestamp = 0;
var lastPlayhead;
Template.spectrogramCard.viewmodel( function(data) {
  return {
    guess: function() {
      if (data._id == Session.get("playingId")) {
        Sounds.update( {_id: data._id}, {$set: {found: true}} );
        return true;
      } else {
        var wrongGuess = this.wrongGuess;
        wrongGuess(true);
        setTimeout(function() {wrongGuess(false)}, 100);
        return false;
      }
    },

    isFound: function() {
      return Sounds.findOne({_id: data._id}).found;
    },

    wrongGuess: false,

    scrub: function(event) {
      var playingId = Session.get("playingId");
      if (playingId != null) {
        var playing = document.getElementById(playingId);

        if (event.timeStamp - lastClickTimestamp < 400) {
          // handle double-click: guess this spectrogram
          var correct = this.guess();
          lastClickTimestamp = 0;
          if (!correct) {
            // reset playhead back to position before double-click if guessed wrong
            playing.currentTime = lastPlayhead;
          } else {
            // stop playing if correct
            playing.pause();
            playing.currentTime = 0;
            Session.set("playingId", null);
          }
        } else {
          // handle single click: move the playhead
        
          lastClickTimestamp = event.timeStamp;
          var elemWidth = event.target.scrollWidth;
          var newScrub = event.offsetX / elemWidth;

          lastPlayhead = playing.currentTime;
          playing.currentTime = newScrub * playing.duration;
          playing.play();
        }
      }
    }
  }
});

// Template.spectrogramCard.onRendered(function () {
//   var template = this;
//   this.autorun(function () {
//     var data = Template.currentData();
//     var canvas = template.find("canvas");
//     var sound = document.getElementById(data._id);

//     spectrogram(sound, canvas);
//   });
// });


/*function spectrogram (audioElem, canvasElem) {
  audioElem.addEventListener('canplaythrough', function() {
    audioCtx = new AudioContext();

    src = audioCtx.createMediaElementSource(audioElem);
    analyser = audioCtx.createAnalyser();

    src.connect(analyser);
    // analyser.connect(audioCtx.destination);

    analyser.fftsize = 256;
    analyser.smoothingTimeConstant = 0.3;
    var freqs = new Uint8Array(analyser.frequencyBinCount);

    canvasCtx = canvasElem.getContext('2d');
    var width = canvasElem.width;
    var height = canvasElem.height;
    
    var duration = audioElem.duration;

    var freqHeight = height / freqs.length;

    var lastDrawnDuration = 0;
    var now;
    var elapsed;

    function drawWindow () {
      analyser.getByteFrequencyData(freqs);

      now = audioElem.currentTime;
      elapsed = now - lastDrawnDuration;
      lastDrawnDuration = now;
      
      if (now < duration) window.requestAnimationFrame(drawWindow);
      else {
        src.disconnect();
        audioCtx.close();
      }

      // if (elapsed > 0) {
        var windowWidth = (elapsed / duration) * width;
        var x_end = (now / duration) * width;

        for (var i = 0; i < freqs.length; i++) {
          var value = freqs[i];

          var color = 'rgb(V, V, V)'.replace(/V/g, 255 - value);
          var y = (freqs.length - i - 1) * freqHeight;

          canvasCtx.fillStyle = color;
          canvasCtx.fillRect(x_end - windowWidth, y, windowWidth, freqHeight);
        };
      // }

    }

    audioElem.play();
    drawWindow();
  });
}*/