(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

require('./mapview/main');

$('header').disableSelection(); // unpopular but still better
$('nav > ul').mspp({});

},{"./mapview/main":2}],2:[function(require,module,exports){
var AppView;

if (!window.console) {
  window.console = {
    log: function() {
      return {};
    }
  };
}

AppView = require('./views/app');

$(function() {
  var appview;
  appview = new AppView();
  return appview.render();
});

},{"./views/app":4}],3:[function(require,module,exports){
var MapLayer;

MapLayer = Backbone.Model.extend({
  constructor: function(shortName, longName, path) {
    this.shortName = shortName;
    this.longName = longName;
    this.path = path;
    return null;
  }
});

module.exports = MapLayer;

},{}],4:[function(require,module,exports){
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

},{"../models/maplayer":3}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9mYWtlX2M3MWQzNzNjLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21haW4uanMiLCIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvbW9kZWxzL21hcGxheWVyLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L3ZpZXdzL2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5yZXF1aXJlKCcuL21hcHZpZXcvbWFpbicpO1xuXG4kKCdoZWFkZXInKS5kaXNhYmxlU2VsZWN0aW9uKCk7IC8vIHVucG9wdWxhciBidXQgc3RpbGwgYmV0dGVyXG4kKCduYXYgPiB1bCcpLm1zcHAoe30pO1xuIiwidmFyIEFwcFZpZXc7XG5cbmlmICghd2luZG93LmNvbnNvbGUpIHtcbiAgd2luZG93LmNvbnNvbGUgPSB7XG4gICAgbG9nOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH07XG59XG5cbkFwcFZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL2FwcCcpO1xuXG4kKGZ1bmN0aW9uKCkge1xuICB2YXIgYXBwdmlldztcbiAgYXBwdmlldyA9IG5ldyBBcHBWaWV3KCk7XG4gIHJldHVybiBhcHB2aWV3LnJlbmRlcigpO1xufSk7XG4iLCJ2YXIgTWFwTGF5ZXI7XG5cbk1hcExheWVyID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcbiAgY29uc3RydWN0b3I6IGZ1bmN0aW9uKHNob3J0TmFtZSwgbG9uZ05hbWUsIHBhdGgpIHtcbiAgICB0aGlzLnNob3J0TmFtZSA9IHNob3J0TmFtZTtcbiAgICB0aGlzLmxvbmdOYW1lID0gbG9uZ05hbWU7XG4gICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwTGF5ZXI7XG4iLCJ2YXIgQXBwVmlldywgTWFwTGF5ZXI7XG5cbk1hcExheWVyID0gcmVxdWlyZSgnLi4vbW9kZWxzL21hcGxheWVyJyk7XG5cbkFwcFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG4gIGV2ZW50czoge1xuICAgICdjaGFuZ2UgaW5wdXRbdHlwZT1yYWRpb10ucnR5cGUnOiAncmVuZGVyJyxcbiAgICAnY2xpY2sgI2RvaXQnOiAnZG9JdCdcbiAgfSxcbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5tYXBMYXllciA9IG5ldyBNYXBMYXllcignbGVmdCcsICdMZWZ0IE1hcCcsICdsZWZ0Lm1hcCcpO1xuICAgIHJldHVybiBfLmJpbmRBbGwodGhpcyk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIG1lO1xuICAgIG1lID0gdGhpcztcbiAgICB0aGlzLiRlbC5hcHBlbmQoQXBwVmlldy5sYXlvdXQoKSk7XG4gICAgdGhpcy4kZWwuYXBwZW5kKCQoJzxidXR0b24gaWQ9XCJkb2l0XCI+ZG8gaXQ8L2J1dHRvbj4nKSk7XG4gICAgdGhpcy4kZWwuYXBwZW5kKEFwcFZpZXcucHJlVGVtcGxhdGUoe1xuICAgICAgc3R1ZmY6ICdzdHVmZiBnb2VzIGhlcmUnXG4gICAgfSkpO1xuICAgICQoJy5jb250ZW50JykuYXBwZW5kKHRoaXMuJGVsKTtcbiAgICB0aGlzLm1hcCA9IEwubWFwKCdtYXAnLCB7XG4gICAgICBjZW50ZXI6IFs1MS41MDUsIC0wLjA5XSxcbiAgICAgIHpvb206IDEzXG4gICAgfSk7XG4gICAgcmV0dXJuIEwudGlsZUxheWVyKCdodHRwOi8vb3RpbGUxLm1xY2RuLmNvbS90aWxlcy8xLjAuMC9tYXAve3p9L3t4fS97eX0ucG5nJywge1xuICAgICAgbWF4Wm9vbTogMThcbiAgICB9KS5hZGRUbyh0aGlzLm1hcCk7XG4gIH0sXG4gIGRvSXQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiRlbC5hcHBlbmQoQXBwVmlldy5wcmVUZW1wbGF0ZSh7XG4gICAgICBzdHVmZjogdGhpcy5tYXBMYXllci5zaG9ydE5hbWVcbiAgICB9KSk7XG4gIH1cbn0sIHtcbiAgbGF5b3V0OiBfLnRlbXBsYXRlKFwiPGRpdiBpZD1cXFwibWFwXFxcIiBzdHlsZT1cXFwid2lkdGg6IDUwJTsgaGVpZ2h0OiAzMDBweDtcXFwiPjwvZGl2PlwiKSxcbiAgcHJlVGVtcGxhdGU6IF8udGVtcGxhdGUoXCI8cHJlPlxcbiAgICA8JT0gc3R1ZmYgJT5cXG48L3ByZT5cIilcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcFZpZXc7XG4iXX0=
