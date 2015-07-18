Template.soundCard.viewmodel( function (data) {
  return {
    togglePlay: function() {
      var parentTemplate = this.parent().templateInstance;
      var playingId = parentTemplate.playingId;

      if (playingId.get() != data._id) {
        if (playingId.get() != null) {
          var playing = parentTemplate.find('.'+playingId.get());
          playing.pause();
          playing.currentTime = 0;
        }

        var audio = parentTemplate.find('.'+data._id);
        audio.play();
        playingId.set(data._id);

      } else {
        var playing = parentTemplate.find('.'+playingId.get());
        playing.pause();
        playing.currentTime = 0;
        playingId.set(null);
      }
    },

    isPlaying: function() {
      return data._id == this.parent().templateInstance.playingId.get();
    },

    isFound: function() {
      return this.parent().templateInstance.data.sounds.findOne({_id: data._id}).found;
    }
  }
});

Template.spectrogramCard.viewmodel( function(data) {
  return {
    lastClickTimestamp: 0,
    lastPlayhead: 0,
    guess: function() {
      if (data._id == this.parent().templateInstance.playingId.get()) {
        this.parent().templateInstance.data.sounds.update( {_id: data._id}, {$set: {found: true}} );
        return true;
      } else {
        var wrongGuess = this.wrongGuess;
        wrongGuess(true);
        setTimeout(function() {wrongGuess(false)}, 100);
        return false;
      }
    },

    isFound: function() {
      return this.parent().templateInstance.data.sounds.findOne({_id: data._id}).found;
    },

    wrongGuess: false,

    scrub: function(event) {
      var playingId = this.parent().templateInstance.playingId.get();
      if (playingId != null) {
        var playing = this.parent().templateInstance.find('.'+playingId);

        if (event.timeStamp - this.lastClickTimestamp() < 400) {
          // handle double-click: guess this spectrogram
          var correct = this.guess();
          this.lastClickTimestamp(0);
          if (!correct) {
            // reset playhead back to position before double-click if guessed wrong
            playing.currentTime = this.lastPlayhead();
          } else {
            // stop playing if correct
            playing.pause();
            playing.currentTime = 0;
            this.parent().templateInstance.playingId.set(null);
          }
        } else {
          // handle single click: move the playhead
        
          this.lastClickTimestamp(event.timeStamp);
          var elemWidth = event.target.scrollWidth;
          var newScrub = event.offsetX / elemWidth;

          this.lastPlayhead(playing.currentTime);
          playing.currentTime = newScrub * playing.duration;
          playing.play();
        }
      }
    }
  }
});
