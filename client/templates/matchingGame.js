Sounds = new Mongo.Collection(null);

HTTP.get('sounds.json', function(error, response) {
  if (!error) {
    var sounds = response.data;
    sounds.forEach(function(sound) {
      Sounds.insert(sound);
    });

    ViewModel.byTemplate("matchingGame")[0].reset();
  }
});


Session.setDefault("playingId", null);
Session.setDefault("numSounds", 5);

Session.setDefault("randomSounds", []);
Session.setDefault("reorderedRandomSounds", []);

Template.matchingGame.helpers({
  randomSounds: function() {
    return Session.get("randomSounds");
  },
  reorderedRandomSounds: function() {
    return Session.get("reorderedRandomSounds");
  }
});

var isPlaying;
Template.matchingGame.events({
  'ended audio': function (event) {
    // Session.set("playingId", null);
    isPlaying = false;
  },
  'playing audio': function(event) {
    var elem = document.getElementById(Session.get('playingId'));
    isPlaying = true;
    (function movePlayhead() {
      if (isPlaying) requestAnimationFrame(movePlayhead);
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
  reset: function() {

    // pause any sound that's playing

    var playingId = Session.get("playingId");

    if (playingId != null) {
      var playing = document.getElementById(playingId);
      playing.pause();
      playing.currentTime = 0;
    }

    Session.set("playingId", null);

    // re-randomize sounds list and unmark all as found

    Sounds.find().forEach(function(sound) {
      Sounds.update(sound._id, {$set: {
        found: false,
        randOrder: Math.random()
      }})
    });

    // pick new random sounds, and randomize that sublist again
    // for the spectrograms

    var randomSounds = Sounds.find({}, {
      sort: {'randOrder': 1},
      limit: Session.get("numSounds")
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

    Session.set("randomSounds", randomSounds);
    Session.set("reorderedRandomSounds", reorderedRandomSounds);

    // $.fn.moveTo(1);
  },

  foundAll: function () {
    return Sounds.find({found: true}).count() == Session.get("numSounds");
  },

  soundPlaying: function() {
    return Session.get('playingId') != null;
  },
  scrubPos: 0
});

// Template.matchingGame.onRendered( function () {
//   ViewModel.byTemplate("matchingGame")[0].reset();
// });
