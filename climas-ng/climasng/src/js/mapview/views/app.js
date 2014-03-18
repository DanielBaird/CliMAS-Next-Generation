var AppView, MapLayer;

MapLayer = require('../models/maplayer');

AppView = Backbone.View.extend({
  events: {
    'change input[type=radio].rtype': 'render',
    'click #doit': 'doIt'
  },
  initialize: function() {
    this.mapLayer = new MapLayer('left', 'Left Map', 'left.map');
    return _.bindAll(this);
  },
  render: function() {
    var me;
    me = this;
    this.$el.append(AppView.layout());
    this.$el.append($('<button id="doit">do it</button>'));
    this.$el.append(AppView.preTemplate({
      stuff: 'stuff goes here'
    }));
    $('.content').append(this.$el);
    this.map = L.map('map', {
      center: [51.505, -0.09],
      zoom: 13
    });
    return L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(this.map);
  },
  doIt: function() {
    return this.$el.append(AppView.preTemplate({
      stuff: this.mapLayer.shortName
    }));
  }
}, {
  layout: _.template("<div id=\"map\" style=\"width: 50%; height: 300px;\"></div>"),
  preTemplate: _.template("<pre>\n    <%= stuff %>\n</pre>")
});

module.exports = AppView;
