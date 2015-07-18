Template.matchingGame.onCreated(function() {
  this.numSounds = this.data.numSounds || new ReactiveVar(5);

  this.playingId = new ReactiveVar(null);
  this.randomSounds = new ReactiveVar([]);
  this.reorderedRandomSounds = new ReactiveVar([]);
  this.isPlaying = false;
});

Template.matchingGame.helpers({
  randomSounds: function() {
    return Template.instance().randomSounds.get();
  },
  reorderedRandomSounds: function() {
    return Template.instance().reorderedRandomSounds.get();
  }
});

// var isPlaying;
Template.matchingGame.events({
  'ended audio': function (event, template) {
    // Session.set("playingId", null);
    template.isPlaying = false;
  },
  'playing audio': function(event, template) {
    var elem = template.find('.'+template.playingId.get());
    template.isPlaying = true;
    (function movePlayhead() {
      if (template.isPlaying) requestAnimationFrame(movePlayhead);
      var progress = elem.currentTime / elem.duration;
      ViewModel.byId("matchingGame").scrubPos( progress * 100 + "%" );      
    })();
  }
  // 'timeupdate audio': function (event) {
  //   var elem = event.target;
  //   var progress = elem.currentTime / elem.duration;
  //   ViewModel.byId("matchingGame").scrubPos( progress * 100 + "%" );
  // }
});

Template.matchingGame.viewmodel('matchingGame', {
  reset: function(data) {
    var template = this.templateInstance;
    var sounds = data.sounds;
    // pause any sound that's playing

    var playingId = template.playingId.get();

    if (playingId != null) {
      var playing = template.find(playingId);
      playing.pause();
      playing.currentTime = 0;
    }

    template.playingId.set(null);

    // re-randomize sounds list and unmark all as found

    sounds.find().forEach(function(sound) {
      sounds.update(sound._id, {$set: {
        found: false,
        randOrder: Math.random()
      }})
    });

    // pick new random sounds, and randomize that sublist again
    // for the spectrograms

    var randomSounds = sounds.find({}, {
      sort: {'randOrder': 1},
      limit: template.numSounds.get()
    }).fetch();

    var reorderedRandomSounds = randomSounds.slice(0);
    // Shuffle selected spectrograms to randomize spectrogram order
    // Durstenfeld shuffle from http://stackoverflow.com/a/12646864
    for (var i = reorderedRandomSounds.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = reorderedRandomSounds[i];
        reorderedRandomSounds[i] = reorderedRandomSounds[j];
        reorderedRandomSounds[j] = temp;
    }

    template.randomSounds.set(randomSounds);
    template.reorderedRandomSounds.set(reorderedRandomSounds);

    // $.fn.moveTo(1);
  },

  foundAll: function (data) {
    return data.sounds.find({found: true}).count() == this.templateInstance.numSounds.get();
  },

  soundPlaying: function() {
    return this.templateInstance.playingId.get() != null;
  },
  scrubPos: 0
});

// Template.matchingGame.onRendered( function () {
//   ViewModel.byTemplate("matchingGame")[0].reset();
// });
