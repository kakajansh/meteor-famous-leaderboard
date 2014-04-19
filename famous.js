Players = new Meteor.Collection("players");

if (Meteor.isClient) {
  // Routing
  Router.configure({
    layoutTemplate: 'layout',
    yieldTemplates: {
      'footer': {to: 'footer'}
    }
  });

  Router.map(function() {
    this.route('home', { path: '/' });
    this.route('leaderboard', { 
      path: '/leaderboard', 
      yieldTemplates: { 'leader_footer': {to: 'footer'} }
    });
  });

  // Famous

  var springTransition = {
    method: "spring",
    period: 600,
    // dampingRatio: .1,
    // velocity: 0.005
  }

  Template._home.rendered = function () {
    var famousData = famousCmp.dataFromTpl(this);
    famousData.modifier.setTransform(
      Transform.translate(0,window.innerHeight/2-200),
      springTransition
    );
  };

  Template.footer.rendered = Template.leader_footer.rendered = function () {
    var famousComp = famousCmp.dataFromTpl(this);
    famousComp.modifier.setOrigin([.5,1]);
  };

  // Leaderboard

  Template.leaderboard.players = function () {
    return Players.find({}, {sort: {score: -1, name: 1}});
  };

  Template.leader_footer.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.leader_footer.events({
    'click button': function () {
      console.log('dada')
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    }
  });

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    }
  });

  var Transform, Transitionable, SpringTransition;

  Meteor.startup(function() {
    Transform        = require('famous/core/Transform');
    Transitionable   = require("famous/transitions/Transitionable");
    SpringTransition = require("famous/transitions/SpringTransition");

    Transitionable.registerMethod('spring', SpringTransition);
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon",
                   "Isaac Newton",
                   "Michael Faraday",
                   "Charles Darwin",
                   "Max Planck",
                   "Gregor Mandel",
                   "Thomas Edison"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: Math.floor(Random.fraction()*10)*5});
    }
  });
}
