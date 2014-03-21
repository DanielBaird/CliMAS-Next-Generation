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
  trackSplitter: false,
  trackPeriod: 100,
  events: {
    'click #btn-change': 'toggleForms',
    'click #btn-compare': 'toggleSplitter'
  },
  initialize: function() {
    this.mapLayer = new MapLayer('left', 'Left Map', 'left.map');
    _.bindAll(this);
    return this.speciesInfoFetchProcess = this.fetchSpeciesInfo();
  },
  render: function() {
    this.$el.append(AppView.templates.layout({
      leftTag: AppView.templates.leftTag(),
      rightTag: AppView.templates.rightTag(),
      leftForm: AppView.templates.leftForm()
    }));
    $('#contentwrap').append(this.$el);
    this.map = L.map('map', {
      center: [-20, 136],
      zoom: 5
    });
    L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(this.map);
    this.leftForm = this.$el.find('.left.form');
    this.buildLeftForm();
    this.leftTag = this.$el.find('.left.tag');
    this.rightTag = this.$el.find('.right.tag');
    this.splitLine = this.$el.find('.splitline');
    return this.splitThumb = this.$el.find('.splitthumb');
  },
  centreMap: function(repeatedlyFor) {
    var later, _i, _results;
    if (!repeatedlyFor) {
      repeatedlyFor = 500;
    }
    _results = [];
    for (later = _i = 0; _i <= repeatedlyFor; later = _i += 25) {
      _results.push(setTimeout((function(_this) {
        return function() {
          return _this.map.invalidateSize(false);
        };
      })(this), later));
    }
    return _results;
  },
  toggleForms: function() {
    this.$el.toggleClass('showforms');
    return this.centreMap();
  },
  toggleSplitter: function() {
    this.$el.toggleClass('split');
    if (this.$el.hasClass('split')) {
      this.activateSplitter();
    } else {
      this.deactivateSplitter();
    }
    return this.centreMap();
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
  buildLeftForm: function() {
    return this.speciesInfoFetchProcess.done((function(_this) {
      return function() {
        return _this.$el.find('#leftmapthing').autocomplete({
          source: _this.speciesLookupList
        });
      };
    })(this));
  },
  startSplitterTracking: function() {
    this.trackSplitter = true;
    this.splitLine.addClass('dragging');
    return this.locateSplitter();
  },
  locateSplitter: function() {
    if (this.trackSplitter) {
      this.resizeThings();
      if (this.trackSplitter === 0) {
        this.trackSplitter = false;
      } else if (this.trackSplitter !== true) {
        this.trackSplitter -= 1;
      }
      return setTimeout(this.locateSplitter, this.trackPeriod);
    }
  },
  stopSplitterTracking: function() {
    this.splitLine.removeClass('dragging');
    return this.trackSplitter = 5;
  },
  activateSplitter: function() {
    this.splitThumb.draggable({
      containment: $('#mapwrapper'),
      scroll: false,
      start: this.startSplitterTracking,
      drag: this.resizeThings,
      stop: this.stopSplitterTracking
    });
    return this.resizeThings();
  },
  deactivateSplitter: function() {
    this.splitThumb.draggable('destroy');
    return this.resizeThings();
  },
  resizeThings: function() {
    var newWidth;
    if (this.$el.hasClass('split')) {
      newWidth = this.splitThumb.position().left + (this.splitThumb.width() / 2.0);
      this.splitLine.css('left', newWidth);
      return this.leftTag.css('clip', 'rect(0 ' + newWidth + 'px auto 0)');
    } else {
      return this.leftTag.css('clip', 'rect(auto auto auto auto)');
    }
  }
}, {
  templates: {
    layout: _.template("<div class=\"splitline\"></div>\n<div class=\"splitthumb\"><span>&#x276e; &#x276f;</span></div>\n<div class=\"left tag\"><%= leftTag %></div>\n<div class=\"right tag\"><%= rightTag %></div>\n<div class=\"left form\"></div>\n<div class=\"right form\"></div>\n<div id=\"mapwrapper\"><div id=\"map\"></div></div>"),
    leftTag: _.template("<div>\n    <input id=\"leftmapthing\" name=\"leftmapthing\" placeholder=\"&hellip; start typing species or group name &hellip;\" />\n    <button id=\"btn-change\">change</button>\n    <button id=\"btn-compare\">compare</button>\n</div>"),
    rightTag: _.template("<div>\n    <input id=\"rightmapthing\" name=\"rightmapthing\" placeholder=\"&hellip; start typing species or group name &hellip;\" />\n</div>"),
    leftForm: _.template("")
  }
});

module.exports = AppView;

},{"../models/maplayer":3}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9mYWtlXzdhMzViYzA5LmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21haW4uanMiLCIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvbW9kZWxzL21hcGxheWVyLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L3ZpZXdzL2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxucmVxdWlyZSgnLi9tYXB2aWV3L21haW4nKTtcblxuJCgnaGVhZGVyJykuZGlzYWJsZVNlbGVjdGlvbigpOyAvLyB1bnBvcHVsYXIgYnV0IHN0aWxsIGJldHRlclxuJCgnbmF2ID4gdWwnKS5tc3BwKHt9KTtcbiIsInZhciBBcHBWaWV3O1xuXG5pZiAoIXdpbmRvdy5jb25zb2xlKSB7XG4gIHdpbmRvdy5jb25zb2xlID0ge1xuICAgIGxvZzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICB9O1xufVxuXG5BcHBWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9hcHAnKTtcblxuJChmdW5jdGlvbigpIHtcbiAgdmFyIGFwcHZpZXc7XG4gIGFwcHZpZXcgPSBuZXcgQXBwVmlldygpO1xuICByZXR1cm4gYXBwdmlldy5yZW5kZXIoKTtcbn0pO1xuIiwidmFyIE1hcExheWVyO1xuXG5NYXBMYXllciA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG4gIGNvbnN0cnVjdG9yOiBmdW5jdGlvbihzaG9ydE5hbWUsIGxvbmdOYW1lLCBwYXRoKSB7XG4gICAgdGhpcy5zaG9ydE5hbWUgPSBzaG9ydE5hbWU7XG4gICAgdGhpcy5sb25nTmFtZSA9IGxvbmdOYW1lO1xuICAgIHRoaXMucGF0aCA9IHBhdGg7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcExheWVyO1xuIiwidmFyIEFwcFZpZXcsIE1hcExheWVyO1xuXG5NYXBMYXllciA9IHJlcXVpcmUoJy4uL21vZGVscy9tYXBsYXllcicpO1xuXG5BcHBWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICB0YWdOYW1lOiAnZGl2JyxcbiAgY2xhc3NOYW1lOiAnc3BsaXRtYXAnLFxuICBpZDogJ3NwbGl0bWFwJyxcbiAgdHJhY2tTcGxpdHRlcjogZmFsc2UsXG4gIHRyYWNrUGVyaW9kOiAxMDAsXG4gIGV2ZW50czoge1xuICAgICdjbGljayAjYnRuLWNoYW5nZSc6ICd0b2dnbGVGb3JtcycsXG4gICAgJ2NsaWNrICNidG4tY29tcGFyZSc6ICd0b2dnbGVTcGxpdHRlcidcbiAgfSxcbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5tYXBMYXllciA9IG5ldyBNYXBMYXllcignbGVmdCcsICdMZWZ0IE1hcCcsICdsZWZ0Lm1hcCcpO1xuICAgIF8uYmluZEFsbCh0aGlzKTtcbiAgICByZXR1cm4gdGhpcy5zcGVjaWVzSW5mb0ZldGNoUHJvY2VzcyA9IHRoaXMuZmV0Y2hTcGVjaWVzSW5mbygpO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGVsLmFwcGVuZChBcHBWaWV3LnRlbXBsYXRlcy5sYXlvdXQoe1xuICAgICAgbGVmdFRhZzogQXBwVmlldy50ZW1wbGF0ZXMubGVmdFRhZygpLFxuICAgICAgcmlnaHRUYWc6IEFwcFZpZXcudGVtcGxhdGVzLnJpZ2h0VGFnKCksXG4gICAgICBsZWZ0Rm9ybTogQXBwVmlldy50ZW1wbGF0ZXMubGVmdEZvcm0oKVxuICAgIH0pKTtcbiAgICAkKCcjY29udGVudHdyYXAnKS5hcHBlbmQodGhpcy4kZWwpO1xuICAgIHRoaXMubWFwID0gTC5tYXAoJ21hcCcsIHtcbiAgICAgIGNlbnRlcjogWy0yMCwgMTM2XSxcbiAgICAgIHpvb206IDVcbiAgICB9KTtcbiAgICBMLnRpbGVMYXllcignaHR0cDovL290aWxlMS5tcWNkbi5jb20vdGlsZXMvMS4wLjAvbWFwL3t6fS97eH0ve3l9LnBuZycsIHtcbiAgICAgIG1heFpvb206IDE4XG4gICAgfSkuYWRkVG8odGhpcy5tYXApO1xuICAgIHRoaXMubGVmdEZvcm0gPSB0aGlzLiRlbC5maW5kKCcubGVmdC5mb3JtJyk7XG4gICAgdGhpcy5idWlsZExlZnRGb3JtKCk7XG4gICAgdGhpcy5sZWZ0VGFnID0gdGhpcy4kZWwuZmluZCgnLmxlZnQudGFnJyk7XG4gICAgdGhpcy5yaWdodFRhZyA9IHRoaXMuJGVsLmZpbmQoJy5yaWdodC50YWcnKTtcbiAgICB0aGlzLnNwbGl0TGluZSA9IHRoaXMuJGVsLmZpbmQoJy5zcGxpdGxpbmUnKTtcbiAgICByZXR1cm4gdGhpcy5zcGxpdFRodW1iID0gdGhpcy4kZWwuZmluZCgnLnNwbGl0dGh1bWInKTtcbiAgfSxcbiAgY2VudHJlTWFwOiBmdW5jdGlvbihyZXBlYXRlZGx5Rm9yKSB7XG4gICAgdmFyIGxhdGVyLCBfaSwgX3Jlc3VsdHM7XG4gICAgaWYgKCFyZXBlYXRlZGx5Rm9yKSB7XG4gICAgICByZXBlYXRlZGx5Rm9yID0gNTAwO1xuICAgIH1cbiAgICBfcmVzdWx0cyA9IFtdO1xuICAgIGZvciAobGF0ZXIgPSBfaSA9IDA7IF9pIDw9IHJlcGVhdGVkbHlGb3I7IGxhdGVyID0gX2kgKz0gMjUpIHtcbiAgICAgIF9yZXN1bHRzLnB1c2goc2V0VGltZW91dCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5tYXAuaW52YWxpZGF0ZVNpemUoZmFsc2UpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcyksIGxhdGVyKSk7XG4gICAgfVxuICAgIHJldHVybiBfcmVzdWx0cztcbiAgfSxcbiAgdG9nZ2xlRm9ybXM6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGVsLnRvZ2dsZUNsYXNzKCdzaG93Zm9ybXMnKTtcbiAgICByZXR1cm4gdGhpcy5jZW50cmVNYXAoKTtcbiAgfSxcbiAgdG9nZ2xlU3BsaXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGVsLnRvZ2dsZUNsYXNzKCdzcGxpdCcpO1xuICAgIGlmICh0aGlzLiRlbC5oYXNDbGFzcygnc3BsaXQnKSkge1xuICAgICAgdGhpcy5hY3RpdmF0ZVNwbGl0dGVyKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGVhY3RpdmF0ZVNwbGl0dGVyKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNlbnRyZU1hcCgpO1xuICB9LFxuICBmZXRjaFNwZWNpZXNJbmZvOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgIHVybDogJy9kYXRhL3NwZWNpZXMnXG4gICAgfSkuZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBzcGVjaWVzTG9va3VwTGlzdCwgc3BlY2llc1NjaU5hbWVMaXN0O1xuICAgICAgICBzcGVjaWVzTG9va3VwTGlzdCA9IFtdO1xuICAgICAgICBzcGVjaWVzU2NpTmFtZUxpc3QgPSBbXTtcbiAgICAgICAgJC5lYWNoKGRhdGEsIGZ1bmN0aW9uKHNjaU5hbWUsIGNvbW1vbk5hbWVzKSB7XG4gICAgICAgICAgc3BlY2llc1NjaU5hbWVMaXN0LnB1c2goc2NpTmFtZSk7XG4gICAgICAgICAgaWYgKGNvbW1vbk5hbWVzKSB7XG4gICAgICAgICAgICByZXR1cm4gJC5lYWNoKGNvbW1vbk5hbWVzLCBmdW5jdGlvbihjbkluZGV4LCBjbikge1xuICAgICAgICAgICAgICByZXR1cm4gc3BlY2llc0xvb2t1cExpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgbGFiZWw6IGNuICsgJyAoJyArIHNjaU5hbWUgKyAnKScsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHNjaU5hbWVcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHNwZWNpZXNMb29rdXBMaXN0LnB1c2goe1xuICAgICAgICAgICAgICBsYWJlbDogc2NpTmFtZSxcbiAgICAgICAgICAgICAgdmFsdWU6IHNjaU5hbWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIF90aGlzLnNwZWNpZXNMb29rdXBMaXN0ID0gc3BlY2llc0xvb2t1cExpc3Q7XG4gICAgICAgIHJldHVybiBfdGhpcy5zcGVjaWVzU2NpTmFtZUxpc3QgPSBzcGVjaWVzU2NpTmFtZUxpc3Q7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgYnVpbGRMZWZ0Rm9ybTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuc3BlY2llc0luZm9GZXRjaFByb2Nlc3MuZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLiRlbC5maW5kKCcjbGVmdG1hcHRoaW5nJykuYXV0b2NvbXBsZXRlKHtcbiAgICAgICAgICBzb3VyY2U6IF90aGlzLnNwZWNpZXNMb29rdXBMaXN0XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIHN0YXJ0U3BsaXR0ZXJUcmFja2luZzogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50cmFja1NwbGl0dGVyID0gdHJ1ZTtcbiAgICB0aGlzLnNwbGl0TGluZS5hZGRDbGFzcygnZHJhZ2dpbmcnKTtcbiAgICByZXR1cm4gdGhpcy5sb2NhdGVTcGxpdHRlcigpO1xuICB9LFxuICBsb2NhdGVTcGxpdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMudHJhY2tTcGxpdHRlcikge1xuICAgICAgdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgICAgIGlmICh0aGlzLnRyYWNrU3BsaXR0ZXIgPT09IDApIHtcbiAgICAgICAgdGhpcy50cmFja1NwbGl0dGVyID0gZmFsc2U7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMudHJhY2tTcGxpdHRlciAhPT0gdHJ1ZSkge1xuICAgICAgICB0aGlzLnRyYWNrU3BsaXR0ZXIgLT0gMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzZXRUaW1lb3V0KHRoaXMubG9jYXRlU3BsaXR0ZXIsIHRoaXMudHJhY2tQZXJpb2QpO1xuICAgIH1cbiAgfSxcbiAgc3RvcFNwbGl0dGVyVHJhY2tpbmc6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3BsaXRMaW5lLnJlbW92ZUNsYXNzKCdkcmFnZ2luZycpO1xuICAgIHJldHVybiB0aGlzLnRyYWNrU3BsaXR0ZXIgPSA1O1xuICB9LFxuICBhY3RpdmF0ZVNwbGl0dGVyOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNwbGl0VGh1bWIuZHJhZ2dhYmxlKHtcbiAgICAgIGNvbnRhaW5tZW50OiAkKCcjbWFwd3JhcHBlcicpLFxuICAgICAgc2Nyb2xsOiBmYWxzZSxcbiAgICAgIHN0YXJ0OiB0aGlzLnN0YXJ0U3BsaXR0ZXJUcmFja2luZyxcbiAgICAgIGRyYWc6IHRoaXMucmVzaXplVGhpbmdzLFxuICAgICAgc3RvcDogdGhpcy5zdG9wU3BsaXR0ZXJUcmFja2luZ1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLnJlc2l6ZVRoaW5ncygpO1xuICB9LFxuICBkZWFjdGl2YXRlU3BsaXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3BsaXRUaHVtYi5kcmFnZ2FibGUoJ2Rlc3Ryb3knKTtcbiAgICByZXR1cm4gdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgfSxcbiAgcmVzaXplVGhpbmdzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbmV3V2lkdGg7XG4gICAgaWYgKHRoaXMuJGVsLmhhc0NsYXNzKCdzcGxpdCcpKSB7XG4gICAgICBuZXdXaWR0aCA9IHRoaXMuc3BsaXRUaHVtYi5wb3NpdGlvbigpLmxlZnQgKyAodGhpcy5zcGxpdFRodW1iLndpZHRoKCkgLyAyLjApO1xuICAgICAgdGhpcy5zcGxpdExpbmUuY3NzKCdsZWZ0JywgbmV3V2lkdGgpO1xuICAgICAgcmV0dXJuIHRoaXMubGVmdFRhZy5jc3MoJ2NsaXAnLCAncmVjdCgwICcgKyBuZXdXaWR0aCArICdweCBhdXRvIDApJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmxlZnRUYWcuY3NzKCdjbGlwJywgJ3JlY3QoYXV0byBhdXRvIGF1dG8gYXV0byknKTtcbiAgICB9XG4gIH1cbn0sIHtcbiAgdGVtcGxhdGVzOiB7XG4gICAgbGF5b3V0OiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwic3BsaXRsaW5lXFxcIj48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJzcGxpdHRodW1iXFxcIj48c3Bhbj4mI3gyNzZlOyAmI3gyNzZmOzwvc3Bhbj48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJsZWZ0IHRhZ1xcXCI+PCU9IGxlZnRUYWcgJT48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJyaWdodCB0YWdcXFwiPjwlPSByaWdodFRhZyAlPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcImxlZnQgZm9ybVxcXCI+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwicmlnaHQgZm9ybVxcXCI+PC9kaXY+XFxuPGRpdiBpZD1cXFwibWFwd3JhcHBlclxcXCI+PGRpdiBpZD1cXFwibWFwXFxcIj48L2Rpdj48L2Rpdj5cIiksXG4gICAgbGVmdFRhZzogXy50ZW1wbGF0ZShcIjxkaXY+XFxuICAgIDxpbnB1dCBpZD1cXFwibGVmdG1hcHRoaW5nXFxcIiBuYW1lPVxcXCJsZWZ0bWFwdGhpbmdcXFwiIHBsYWNlaG9sZGVyPVxcXCImaGVsbGlwOyBzdGFydCB0eXBpbmcgc3BlY2llcyBvciBncm91cCBuYW1lICZoZWxsaXA7XFxcIiAvPlxcbiAgICA8YnV0dG9uIGlkPVxcXCJidG4tY2hhbmdlXFxcIj5jaGFuZ2U8L2J1dHRvbj5cXG4gICAgPGJ1dHRvbiBpZD1cXFwiYnRuLWNvbXBhcmVcXFwiPmNvbXBhcmU8L2J1dHRvbj5cXG48L2Rpdj5cIiksXG4gICAgcmlnaHRUYWc6IF8udGVtcGxhdGUoXCI8ZGl2PlxcbiAgICA8aW5wdXQgaWQ9XFxcInJpZ2h0bWFwdGhpbmdcXFwiIG5hbWU9XFxcInJpZ2h0bWFwdGhpbmdcXFwiIHBsYWNlaG9sZGVyPVxcXCImaGVsbGlwOyBzdGFydCB0eXBpbmcgc3BlY2llcyBvciBncm91cCBuYW1lICZoZWxsaXA7XFxcIiAvPlxcbjwvZGl2PlwiKSxcbiAgICBsZWZ0Rm9ybTogXy50ZW1wbGF0ZShcIlwiKVxuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcHBWaWV3O1xuIl19
