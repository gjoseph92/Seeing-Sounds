Template.main.onCreated(function() {
  var Sounds = new Mongo.Collection(null);
  this.Sounds = Sounds;

  HTTP.get('sounds.json', function(error, response) {
    if (!error) {
      var sounds = response.data;
      sounds.forEach(function(sound) {
        Sounds.insert(sound);
      });

      ViewModel.byTemplate("matchingGame")[0].reset();
    }
  });

});

Template.main.helpers({
  Sounds: function() {
    return Template.instance().Sounds;
  }
})