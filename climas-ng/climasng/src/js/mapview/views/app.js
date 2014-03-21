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
