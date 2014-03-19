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
  tagName: 'div',
  className: 'splitmap',
  id: 'splitmap',
  events: {
    'click #doit': 'activateSplitter'
  },
  initialize: function() {
    this.mapLayer = new MapLayer('left', 'Left Map', 'left.map');
    _.bindAll(this);
    return this.fetchSpeciesInfo();
  },
  render: function() {
    this.$el.append(AppView.layout());
    $('#contentwrap').append(this.$el);
    this.map = L.map('map', {
      center: [-20, 136],
      zoom: 5
    });
    L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(this.map);
    this.leftForm = this.$el.find('.left.form');
    this.buildLeftForm(this.leftForm);
    this.leftTag = this.$el.find('.left.tag');
    this.rightTag = this.$el.find('.right.tag');
    this.splitLine = this.$el.find('.splitline');
    return this.splitThumb = this.$el.find('.splitthumb');
  },
  fetchSpeciesInfo: function() {
    return $.ajax({
      url: '/data/species'
    }).done((function(_this) {
      return function(data) {
        var speciesLookupList, speciesSciNameList;
        speciesLookupList = [];
        speciesSciNameList = [];
        $.each(data, function(sciName, commonNames) {
          speciesSciNameList.push(sciName);
          if (commonNames) {
            return $.each(commonNames, function(cnIndex, cn) {
              return speciesLookupList.push({
                label: cn + ' (' + sciName + ')',
                value: sciName
              });
            });
          } else {
            return speciesLookupList.push({
              label: sciName,
              value: sciName
            });
          }
        });
        _this.speciesLookupList = speciesLookupList;
        return _this.speciesSciNameList = speciesSciNameList;
      };
    })(this));
  },
  buildLeftForm: function(wrapper) {
    wrapper.append(AppView.leftForm());
    if (this.speciesLookupList) {
      return this.$el.find('#speciesname').autocomplete({
        source: this.speciesLookupList
      });
    }
  },
  startSplitterTracking: function() {
    if (this.splitterTrackId) {
      this.stopSplitterTracking();
    }
    this.splitterTrackId = setInterval((function(_this) {
      return function() {
        return _this.resizeThings();
      };
    })(this), 200);
    return true;
  },
  stopSplitterTracking: function() {
    clearInterval(this.splitterTrackId);
    return this.resizeThings;
  },
  activateSplitter: function() {
    this.splitThumb.draggable({
      containment: this.$el,
      scroll: false,
      start: this.startSplitterTracking,
      drag: this.resizeThings,
      stop: this.stopSplitterTracking
    });
    this.resizeThings();
    this.splitLine.addClass('active');
    return this.splitThumb.addClass('active');
  },
  deactivateSplitter: function() {
    this.splitThumb.removeClass('active');
    this.splitLine.removeClass('active');
    return this.splitThumb.draggable('destroy');
  },
  resizeThings: function() {
    var newWidth;
    newWidth = this.splitThumb.position().left + (this.splitThumb.width() / 2.0);
    this.splitLine.css('left', newWidth);
    return this.leftTag.css('clip', 'rect(0 ' + newWidth + 'px auto 0)');
  }
}, {
  layout: _.template("<div class=\"splitline\"></div>\n<div class=\"splitthumb\"><span>&#x276e; &#x276f;</span></div>\n<div class=\"left tag\">left tag<button id=\"doit\">do it</button></div>\n<div class=\"right tag\">right tag</div>\n<div class=\"left form\"></div>\n<div id=\"mapwrapper\"><div id=\"map\"></div></div>"),
  leftForm: _.template("<input id=\"speciesname\" name=\"speciesname\" placeholder=\"&hellip; type a species name &hellip;\" />")
});

module.exports = AppView;

},{"../models/maplayer":3}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9mYWtlXzI0MzE4YWZlLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21haW4uanMiLCIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvbW9kZWxzL21hcGxheWVyLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L3ZpZXdzL2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbnJlcXVpcmUoJy4vbWFwdmlldy9tYWluJyk7XG5cbiQoJ2hlYWRlcicpLmRpc2FibGVTZWxlY3Rpb24oKTsgLy8gdW5wb3B1bGFyIGJ1dCBzdGlsbCBiZXR0ZXJcbiQoJ25hdiA+IHVsJykubXNwcCh7fSk7XG4iLCJ2YXIgQXBwVmlldztcblxuaWYgKCF3aW5kb3cuY29uc29sZSkge1xuICB3aW5kb3cuY29uc29sZSA9IHtcbiAgICBsb2c6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfTtcbn1cblxuQXBwVmlldyA9IHJlcXVpcmUoJy4vdmlld3MvYXBwJyk7XG5cbiQoZnVuY3Rpb24oKSB7XG4gIHZhciBhcHB2aWV3O1xuICBhcHB2aWV3ID0gbmV3IEFwcFZpZXcoKTtcbiAgcmV0dXJuIGFwcHZpZXcucmVuZGVyKCk7XG59KTtcbiIsInZhciBNYXBMYXllcjtcblxuTWFwTGF5ZXIgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24oc2hvcnROYW1lLCBsb25nTmFtZSwgcGF0aCkge1xuICAgIHRoaXMuc2hvcnROYW1lID0gc2hvcnROYW1lO1xuICAgIHRoaXMubG9uZ05hbWUgPSBsb25nTmFtZTtcbiAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgIHJldHVybiBudWxsO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYXBMYXllcjtcbiIsInZhciBBcHBWaWV3LCBNYXBMYXllcjtcblxuTWFwTGF5ZXIgPSByZXF1aXJlKCcuLi9tb2RlbHMvbWFwbGF5ZXInKTtcblxuQXBwVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgdGFnTmFtZTogJ2RpdicsXG4gIGNsYXNzTmFtZTogJ3NwbGl0bWFwJyxcbiAgaWQ6ICdzcGxpdG1hcCcsXG4gIGV2ZW50czoge1xuICAgICdjbGljayAjZG9pdCc6ICdhY3RpdmF0ZVNwbGl0dGVyJ1xuICB9LFxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLm1hcExheWVyID0gbmV3IE1hcExheWVyKCdsZWZ0JywgJ0xlZnQgTWFwJywgJ2xlZnQubWFwJyk7XG4gICAgXy5iaW5kQWxsKHRoaXMpO1xuICAgIHJldHVybiB0aGlzLmZldGNoU3BlY2llc0luZm8oKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRlbC5hcHBlbmQoQXBwVmlldy5sYXlvdXQoKSk7XG4gICAgJCgnI2NvbnRlbnR3cmFwJykuYXBwZW5kKHRoaXMuJGVsKTtcbiAgICB0aGlzLm1hcCA9IEwubWFwKCdtYXAnLCB7XG4gICAgICBjZW50ZXI6IFstMjAsIDEzNl0sXG4gICAgICB6b29tOiA1XG4gICAgfSk7XG4gICAgTC50aWxlTGF5ZXIoJ2h0dHA6Ly9vdGlsZTEubXFjZG4uY29tL3RpbGVzLzEuMC4wL21hcC97en0ve3h9L3t5fS5wbmcnLCB7XG4gICAgICBtYXhab29tOiAxOFxuICAgIH0pLmFkZFRvKHRoaXMubWFwKTtcbiAgICB0aGlzLmxlZnRGb3JtID0gdGhpcy4kZWwuZmluZCgnLmxlZnQuZm9ybScpO1xuICAgIHRoaXMuYnVpbGRMZWZ0Rm9ybSh0aGlzLmxlZnRGb3JtKTtcbiAgICB0aGlzLmxlZnRUYWcgPSB0aGlzLiRlbC5maW5kKCcubGVmdC50YWcnKTtcbiAgICB0aGlzLnJpZ2h0VGFnID0gdGhpcy4kZWwuZmluZCgnLnJpZ2h0LnRhZycpO1xuICAgIHRoaXMuc3BsaXRMaW5lID0gdGhpcy4kZWwuZmluZCgnLnNwbGl0bGluZScpO1xuICAgIHJldHVybiB0aGlzLnNwbGl0VGh1bWIgPSB0aGlzLiRlbC5maW5kKCcuc3BsaXR0aHVtYicpO1xuICB9LFxuICBmZXRjaFNwZWNpZXNJbmZvOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgIHVybDogJy9kYXRhL3NwZWNpZXMnXG4gICAgfSkuZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBzcGVjaWVzTG9va3VwTGlzdCwgc3BlY2llc1NjaU5hbWVMaXN0O1xuICAgICAgICBzcGVjaWVzTG9va3VwTGlzdCA9IFtdO1xuICAgICAgICBzcGVjaWVzU2NpTmFtZUxpc3QgPSBbXTtcbiAgICAgICAgJC5lYWNoKGRhdGEsIGZ1bmN0aW9uKHNjaU5hbWUsIGNvbW1vbk5hbWVzKSB7XG4gICAgICAgICAgc3BlY2llc1NjaU5hbWVMaXN0LnB1c2goc2NpTmFtZSk7XG4gICAgICAgICAgaWYgKGNvbW1vbk5hbWVzKSB7XG4gICAgICAgICAgICByZXR1cm4gJC5lYWNoKGNvbW1vbk5hbWVzLCBmdW5jdGlvbihjbkluZGV4LCBjbikge1xuICAgICAgICAgICAgICByZXR1cm4gc3BlY2llc0xvb2t1cExpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgbGFiZWw6IGNuICsgJyAoJyArIHNjaU5hbWUgKyAnKScsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHNjaU5hbWVcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHNwZWNpZXNMb29rdXBMaXN0LnB1c2goe1xuICAgICAgICAgICAgICBsYWJlbDogc2NpTmFtZSxcbiAgICAgICAgICAgICAgdmFsdWU6IHNjaU5hbWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIF90aGlzLnNwZWNpZXNMb29rdXBMaXN0ID0gc3BlY2llc0xvb2t1cExpc3Q7XG4gICAgICAgIHJldHVybiBfdGhpcy5zcGVjaWVzU2NpTmFtZUxpc3QgPSBzcGVjaWVzU2NpTmFtZUxpc3Q7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgYnVpbGRMZWZ0Rm9ybTogZnVuY3Rpb24od3JhcHBlcikge1xuICAgIHdyYXBwZXIuYXBwZW5kKEFwcFZpZXcubGVmdEZvcm0oKSk7XG4gICAgaWYgKHRoaXMuc3BlY2llc0xvb2t1cExpc3QpIHtcbiAgICAgIHJldHVybiB0aGlzLiRlbC5maW5kKCcjc3BlY2llc25hbWUnKS5hdXRvY29tcGxldGUoe1xuICAgICAgICBzb3VyY2U6IHRoaXMuc3BlY2llc0xvb2t1cExpc3RcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgc3RhcnRTcGxpdHRlclRyYWNraW5nOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5zcGxpdHRlclRyYWNrSWQpIHtcbiAgICAgIHRoaXMuc3RvcFNwbGl0dGVyVHJhY2tpbmcoKTtcbiAgICB9XG4gICAgdGhpcy5zcGxpdHRlclRyYWNrSWQgPSBzZXRJbnRlcnZhbCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLnJlc2l6ZVRoaW5ncygpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSwgMjAwKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgc3RvcFNwbGl0dGVyVHJhY2tpbmc6IGZ1bmN0aW9uKCkge1xuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5zcGxpdHRlclRyYWNrSWQpO1xuICAgIHJldHVybiB0aGlzLnJlc2l6ZVRoaW5ncztcbiAgfSxcbiAgYWN0aXZhdGVTcGxpdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zcGxpdFRodW1iLmRyYWdnYWJsZSh7XG4gICAgICBjb250YWlubWVudDogdGhpcy4kZWwsXG4gICAgICBzY3JvbGw6IGZhbHNlLFxuICAgICAgc3RhcnQ6IHRoaXMuc3RhcnRTcGxpdHRlclRyYWNraW5nLFxuICAgICAgZHJhZzogdGhpcy5yZXNpemVUaGluZ3MsXG4gICAgICBzdG9wOiB0aGlzLnN0b3BTcGxpdHRlclRyYWNraW5nXG4gICAgfSk7XG4gICAgdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgICB0aGlzLnNwbGl0TGluZS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgcmV0dXJuIHRoaXMuc3BsaXRUaHVtYi5hZGRDbGFzcygnYWN0aXZlJyk7XG4gIH0sXG4gIGRlYWN0aXZhdGVTcGxpdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zcGxpdFRodW1iLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICB0aGlzLnNwbGl0TGluZS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgcmV0dXJuIHRoaXMuc3BsaXRUaHVtYi5kcmFnZ2FibGUoJ2Rlc3Ryb3knKTtcbiAgfSxcbiAgcmVzaXplVGhpbmdzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbmV3V2lkdGg7XG4gICAgbmV3V2lkdGggPSB0aGlzLnNwbGl0VGh1bWIucG9zaXRpb24oKS5sZWZ0ICsgKHRoaXMuc3BsaXRUaHVtYi53aWR0aCgpIC8gMi4wKTtcbiAgICB0aGlzLnNwbGl0TGluZS5jc3MoJ2xlZnQnLCBuZXdXaWR0aCk7XG4gICAgcmV0dXJuIHRoaXMubGVmdFRhZy5jc3MoJ2NsaXAnLCAncmVjdCgwICcgKyBuZXdXaWR0aCArICdweCBhdXRvIDApJyk7XG4gIH1cbn0sIHtcbiAgbGF5b3V0OiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwic3BsaXRsaW5lXFxcIj48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJzcGxpdHRodW1iXFxcIj48c3Bhbj4mI3gyNzZlOyAmI3gyNzZmOzwvc3Bhbj48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJsZWZ0IHRhZ1xcXCI+bGVmdCB0YWc8YnV0dG9uIGlkPVxcXCJkb2l0XFxcIj5kbyBpdDwvYnV0dG9uPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcInJpZ2h0IHRhZ1xcXCI+cmlnaHQgdGFnPC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwibGVmdCBmb3JtXFxcIj48L2Rpdj5cXG48ZGl2IGlkPVxcXCJtYXB3cmFwcGVyXFxcIj48ZGl2IGlkPVxcXCJtYXBcXFwiPjwvZGl2PjwvZGl2PlwiKSxcbiAgbGVmdEZvcm06IF8udGVtcGxhdGUoXCI8aW5wdXQgaWQ9XFxcInNwZWNpZXNuYW1lXFxcIiBuYW1lPVxcXCJzcGVjaWVzbmFtZVxcXCIgcGxhY2Vob2xkZXI9XFxcIiZoZWxsaXA7IHR5cGUgYSBzcGVjaWVzIG5hbWUgJmhlbGxpcDtcXFwiIC8+XCIpXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcHBWaWV3O1xuIl19
