(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

require('./reports/main');


},{"./reports/main":2}],2:[function(require,module,exports){
(function() {
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

}).call(this);

},{"./views/app":4}],3:[function(require,module,exports){
(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(fn, scope) {
      var i, _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push(__indexOf.call(this, i) >= 0 ? fn.call(scope, this[i], i, this) : void 0);
      }
      return _results;
    };
  }

  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(needle) {
      var i, _i, _ref;
      for (i = _i = 0, _ref = this.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (this[i] === needle) {
          return i;
        }
      }
      return -1;
    };
  }

}).call(this);

},{}],4:[function(require,module,exports){
(function() {
  var AppView, debug;

  require('../util/shims');


  /* jshint -W093 */

  debug = function(itemToLog, itemLevel) {
    var levels, messageNum, threshold, thresholdNum;
    levels = ['verydebug', 'debug', 'message', 'warning'];
    threshold = 'verydebug';
    if (!itemLevel) {
      itemLevel = 'debug';
    }
    thresholdNum = levels.indexOf(threshold);
    messageNum = levels.indexOf(itemLevel);
    if (thresholdNum > messageNum) {
      return;
    }
    if (itemToLog + '' === itemToLog) {
      return console.log("[" + itemLevel + "] " + itemToLog);
    } else {
      return console.log(itemToLog);
    }
  };

  AppView = Backbone.View.extend({
    tagName: 'form',
    className: '',
    id: 'reportform',
    speciesDataUrl: "" + location.protocol + "//" + location.host + "/speciesdata",
    rasterApiUrl: "" + location.protocol + "//localhost:10600/api/raster/1/wms_data_url",
    trackSplitter: false,
    trackPeriod: 100,
    events: {
      'change .sectionselector input': 'updateSectionSelection'
    },
    initialize: function() {
      debug('AppView.initialize');
      _.bindAll.apply(_, [this].concat(_.functions(this)));
      return this.availableSections = this.fetchReportSections();
    },
    ping: function() {
      return console.log('ping!');
    },
    render: function() {
      debug('AppView.render');
      this.$el.append(AppView.templates.layout({}));
      return $('#contentwrap .maincontent').append(this.$el);
    },
    buildReportSectionList: function(data, wrapper) {
      debug('AppView.buildReportSectionList');
      return $.each(data, (function(_this) {
        return function(index, item) {
          var selectorRow, subsections;
          selectorRow = $(AppView.templates.sectionSelector(item));
          $(wrapper).append(selectorRow);
          if (item.sections.length > 0) {
            subsections = $(AppView.templates.subsections());
            _this.buildReportSectionList(item.sections, subsections);
            return $(selectorRow).addClass('hassubsections').append(subsections);
          }
        };
      })(this));
    },
    updateSectionSelection: function(event) {
      debug('AppView.updateSectionSelection');
      return this.handleSectionSelection(this.possibleSections);
    },
    handleSectionSelection: function(sectionList, parent) {
      debug('AppView.handleSectionSelection');
      return $.each(sectionList, (function(_this) {
        return function(index, item) {
          var selectionControl, selector, _ref;
          selector = _this.$("#section-" + item.id);
          selectionControl = selector.find('input');
          if (selectionControl.prop('checked')) {
            selector.removeClass('unselected');
          } else {
            selector.addClass('unselected');
          }
          debug("handling " + parent + "." + (selectionControl.val()));
          if (((_ref = item.sections) != null ? _ref.length : void 0) > 0) {
            return _this.handleSectionSelection(item.sections, item.id);
          }
        };
      })(this));
    },
    fetchReportSections: function() {
      var fetch;
      debug('AppView.fetchReportSections');
      fetch = $.Deferred();
      fetch.done((function(_this) {
        return function(data) {
          _this.possibleSections = data.sections;
          _this.$('.sectionlist').empty();
          return _this.buildReportSectionList(_this.possibleSections, _this.$('.sectionlist'));
        };
      })(this));
      setTimeout(function() {
        return fetch.resolve({
          sections: [
            {
              id: 'intro',
              name: 'Introduction',
              description: 'title, credits, and introductory paragraphs.',
              presence: 'required',
              sections: []
            }, {
              id: 'climatereview',
              name: 'Climate Review',
              description: 'a description of the region\'s current and projected climate.',
              presence: 'optional',
              sections: [
                {
                  id: 'temperature',
                  name: 'Temperature',
                  description: 'current and projected temperature.',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'rainfall',
                  name: 'Rainfall',
                  description: 'current and projected precipitation.',
                  presence: 'optional',
                  sections: []
                }
              ]
            }, {
              id: 'biodiversity',
              name: 'Biodiversity Review',
              description: 'a description of the region\'s current and projected biodiversity. A description of the region\'s current and projected biodiversity. A description of the region\'s current and projected biodiversity. A description of the region\'s current and projected biodiversity.',
              presence: 'optional',
              sections: [
                {
                  id: 'overall',
                  name: 'Overall',
                  description: 'current and projected biodiversity over all modelled species',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'mammals',
                  name: 'Mammals',
                  description: 'current and projected biodiversity over mammal species',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'amphibians',
                  name: 'Amphibians',
                  description: 'current and projected biodiversity over amphibian species',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'reptiles',
                  name: 'Reptiles',
                  description: 'current and projected biodiversity over reptile species',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'birds',
                  name: 'Birds',
                  description: 'current and projected biodiversity over bird species',
                  presence: 'optional',
                  sections: []
                }
              ]
            }, {
              id: 'appendixes',
              name: 'Appendices',
              description: 'tables and other appendices.',
              presence: 'required',
              sections: [
                {
                  id: 'observedmammallist',
                  name: 'Mammals Present',
                  description: 'list of mammals currently or projected to be present in region.',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'observedamphibianslist',
                  name: 'Amphibians Present',
                  description: 'list of amphibians currently or projected to be present in region.',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'observedreptileslist',
                  name: 'Reptiles Present',
                  description: 'list of reptiles currently or projected to be present in region.',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'observedbirdslist',
                  name: 'Birds Present',
                  description: 'list of birds currently or projected to be present in region.',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'science',
                  name: 'Science',
                  description: 'description of the climate and species distribution modelling used to generate the data in the report.',
                  presence: 'required',
                  sections: []
                }
              ]
            }
          ]
        });
      }, 1000);
      return fetch.promise();
    }
  }, {
    templates: {
      layout: _.template("<div class=\"sectionlist\">\n    loading available sections..\n</div>"),
      sectionSelector: _.template("<div class=\"sectionselector\" id=\"section-<%= id %>\">\n    <label class=\"name\"\n        <% if (presence == 'required') { print('title=\"This section is required\"'); } %>\n    ><input\n        type=\"checkbox\"\n        value=\"<%= id %>-selected\"\n        checked=\"checked\"\n        <% if (presence == 'required') { print('disabled=\"disabled\"'); } %>\n    /> <%= name %></label>\n    <p class=\"description\"><%= description %></p>\n\n</div>"),
      subsections: _.template("<div class=\"subsections clearfix\">\n    <p class=\"subsectionintro\">Contains these subsections:</p>\n</div>")
    }
  });

  module.exports = AppView;

}).call(this);

},{"../util/shims":3}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9mYWtlX2Q4MzM4NDI0LmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9yZXBvcnRzL21haW4uanMiLCIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvY2xpbWFzbmcvc3JjL2pzL3JlcG9ydHMvdXRpbC9zaGltcy5qcyIsIi9Vc2Vycy9wdnJkd2IvamN1L2NsaW1hc25nL2NsaW1hcy1uZy9jbGltYXNuZy9zcmMvanMvcmVwb3J0cy92aWV3cy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5yZXF1aXJlKCcuL3JlcG9ydHMvbWFpbicpO1xuXG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBBcHBWaWV3O1xuXG4gIGlmICghd2luZG93LmNvbnNvbGUpIHtcbiAgICB3aW5kb3cuY29uc29sZSA9IHtcbiAgICAgIGxvZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgQXBwVmlldyA9IHJlcXVpcmUoJy4vdmlld3MvYXBwJyk7XG5cbiAgJChmdW5jdGlvbigpIHtcbiAgICB2YXIgYXBwdmlldztcbiAgICBhcHB2aWV3ID0gbmV3IEFwcFZpZXcoKTtcbiAgICByZXR1cm4gYXBwdmlldy5yZW5kZXIoKTtcbiAgfSk7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBfX2luZGV4T2YgPSBbXS5pbmRleE9mIHx8IGZ1bmN0aW9uKGl0ZW0pIHsgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7IGkrKykgeyBpZiAoaSBpbiB0aGlzICYmIHRoaXNbaV0gPT09IGl0ZW0pIHJldHVybiBpOyB9IHJldHVybiAtMTsgfTtcblxuICBpZiAoIUFycmF5LnByb3RvdHlwZS5mb3JFYWNoKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihmbiwgc2NvcGUpIHtcbiAgICAgIHZhciBpLCBfaSwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gX2kgPSAwLCBfcmVmID0gdGhpcy5sZW5ndGg7IDAgPD0gX3JlZiA/IF9pIDw9IF9yZWYgOiBfaSA+PSBfcmVmOyBpID0gMCA8PSBfcmVmID8gKytfaSA6IC0tX2kpIHtcbiAgICAgICAgX3Jlc3VsdHMucHVzaChfX2luZGV4T2YuY2FsbCh0aGlzLCBpKSA+PSAwID8gZm4uY2FsbChzY29wZSwgdGhpc1tpXSwgaSwgdGhpcykgOiB2b2lkIDApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH07XG4gIH1cblxuICBpZiAoIUFycmF5LnByb3RvdHlwZS5pbmRleE9mKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbihuZWVkbGUpIHtcbiAgICAgIHZhciBpLCBfaSwgX3JlZjtcbiAgICAgIGZvciAoaSA9IF9pID0gMCwgX3JlZiA9IHRoaXMubGVuZ3RoOyAwIDw9IF9yZWYgPyBfaSA8PSBfcmVmIDogX2kgPj0gX3JlZjsgaSA9IDAgPD0gX3JlZiA/ICsrX2kgOiAtLV9pKSB7XG4gICAgICAgIGlmICh0aGlzW2ldID09PSBuZWVkbGUpIHtcbiAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG4gIH1cblxufSkuY2FsbCh0aGlzKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIEFwcFZpZXcsIGRlYnVnO1xuXG4gIHJlcXVpcmUoJy4uL3V0aWwvc2hpbXMnKTtcblxuXG4gIC8qIGpzaGludCAtVzA5MyAqL1xuXG4gIGRlYnVnID0gZnVuY3Rpb24oaXRlbVRvTG9nLCBpdGVtTGV2ZWwpIHtcbiAgICB2YXIgbGV2ZWxzLCBtZXNzYWdlTnVtLCB0aHJlc2hvbGQsIHRocmVzaG9sZE51bTtcbiAgICBsZXZlbHMgPSBbJ3ZlcnlkZWJ1ZycsICdkZWJ1ZycsICdtZXNzYWdlJywgJ3dhcm5pbmcnXTtcbiAgICB0aHJlc2hvbGQgPSAndmVyeWRlYnVnJztcbiAgICBpZiAoIWl0ZW1MZXZlbCkge1xuICAgICAgaXRlbUxldmVsID0gJ2RlYnVnJztcbiAgICB9XG4gICAgdGhyZXNob2xkTnVtID0gbGV2ZWxzLmluZGV4T2YodGhyZXNob2xkKTtcbiAgICBtZXNzYWdlTnVtID0gbGV2ZWxzLmluZGV4T2YoaXRlbUxldmVsKTtcbiAgICBpZiAodGhyZXNob2xkTnVtID4gbWVzc2FnZU51bSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoaXRlbVRvTG9nICsgJycgPT09IGl0ZW1Ub0xvZykge1xuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKFwiW1wiICsgaXRlbUxldmVsICsgXCJdIFwiICsgaXRlbVRvTG9nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKGl0ZW1Ub0xvZyk7XG4gICAgfVxuICB9O1xuXG4gIEFwcFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG4gICAgdGFnTmFtZTogJ2Zvcm0nLFxuICAgIGNsYXNzTmFtZTogJycsXG4gICAgaWQ6ICdyZXBvcnRmb3JtJyxcbiAgICBzcGVjaWVzRGF0YVVybDogXCJcIiArIGxvY2F0aW9uLnByb3RvY29sICsgXCIvL1wiICsgbG9jYXRpb24uaG9zdCArIFwiL3NwZWNpZXNkYXRhXCIsXG4gICAgcmFzdGVyQXBpVXJsOiBcIlwiICsgbG9jYXRpb24ucHJvdG9jb2wgKyBcIi8vbG9jYWxob3N0OjEwNjAwL2FwaS9yYXN0ZXIvMS93bXNfZGF0YV91cmxcIixcbiAgICB0cmFja1NwbGl0dGVyOiBmYWxzZSxcbiAgICB0cmFja1BlcmlvZDogMTAwLFxuICAgIGV2ZW50czoge1xuICAgICAgJ2NoYW5nZSAuc2VjdGlvbnNlbGVjdG9yIGlucHV0JzogJ3VwZGF0ZVNlY3Rpb25TZWxlY3Rpb24nXG4gICAgfSxcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmluaXRpYWxpemUnKTtcbiAgICAgIF8uYmluZEFsbC5hcHBseShfLCBbdGhpc10uY29uY2F0KF8uZnVuY3Rpb25zKHRoaXMpKSk7XG4gICAgICByZXR1cm4gdGhpcy5hdmFpbGFibGVTZWN0aW9ucyA9IHRoaXMuZmV0Y2hSZXBvcnRTZWN0aW9ucygpO1xuICAgIH0sXG4gICAgcGluZzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gY29uc29sZS5sb2coJ3BpbmchJyk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcucmVuZGVyJyk7XG4gICAgICB0aGlzLiRlbC5hcHBlbmQoQXBwVmlldy50ZW1wbGF0ZXMubGF5b3V0KHt9KSk7XG4gICAgICByZXR1cm4gJCgnI2NvbnRlbnR3cmFwIC5tYWluY29udGVudCcpLmFwcGVuZCh0aGlzLiRlbCk7XG4gICAgfSxcbiAgICBidWlsZFJlcG9ydFNlY3Rpb25MaXN0OiBmdW5jdGlvbihkYXRhLCB3cmFwcGVyKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5idWlsZFJlcG9ydFNlY3Rpb25MaXN0Jyk7XG4gICAgICByZXR1cm4gJC5lYWNoKGRhdGEsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICB2YXIgc2VsZWN0b3JSb3csIHN1YnNlY3Rpb25zO1xuICAgICAgICAgIHNlbGVjdG9yUm93ID0gJChBcHBWaWV3LnRlbXBsYXRlcy5zZWN0aW9uU2VsZWN0b3IoaXRlbSkpO1xuICAgICAgICAgICQod3JhcHBlcikuYXBwZW5kKHNlbGVjdG9yUm93KTtcbiAgICAgICAgICBpZiAoaXRlbS5zZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBzdWJzZWN0aW9ucyA9ICQoQXBwVmlldy50ZW1wbGF0ZXMuc3Vic2VjdGlvbnMoKSk7XG4gICAgICAgICAgICBfdGhpcy5idWlsZFJlcG9ydFNlY3Rpb25MaXN0KGl0ZW0uc2VjdGlvbnMsIHN1YnNlY3Rpb25zKTtcbiAgICAgICAgICAgIHJldHVybiAkKHNlbGVjdG9yUm93KS5hZGRDbGFzcygnaGFzc3Vic2VjdGlvbnMnKS5hcHBlbmQoc3Vic2VjdGlvbnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9LFxuICAgIHVwZGF0ZVNlY3Rpb25TZWxlY3Rpb246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy51cGRhdGVTZWN0aW9uU2VsZWN0aW9uJyk7XG4gICAgICByZXR1cm4gdGhpcy5oYW5kbGVTZWN0aW9uU2VsZWN0aW9uKHRoaXMucG9zc2libGVTZWN0aW9ucyk7XG4gICAgfSxcbiAgICBoYW5kbGVTZWN0aW9uU2VsZWN0aW9uOiBmdW5jdGlvbihzZWN0aW9uTGlzdCwgcGFyZW50KSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5oYW5kbGVTZWN0aW9uU2VsZWN0aW9uJyk7XG4gICAgICByZXR1cm4gJC5lYWNoKHNlY3Rpb25MaXN0LCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgdmFyIHNlbGVjdGlvbkNvbnRyb2wsIHNlbGVjdG9yLCBfcmVmO1xuICAgICAgICAgIHNlbGVjdG9yID0gX3RoaXMuJChcIiNzZWN0aW9uLVwiICsgaXRlbS5pZCk7XG4gICAgICAgICAgc2VsZWN0aW9uQ29udHJvbCA9IHNlbGVjdG9yLmZpbmQoJ2lucHV0Jyk7XG4gICAgICAgICAgaWYgKHNlbGVjdGlvbkNvbnRyb2wucHJvcCgnY2hlY2tlZCcpKSB7XG4gICAgICAgICAgICBzZWxlY3Rvci5yZW1vdmVDbGFzcygndW5zZWxlY3RlZCcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxlY3Rvci5hZGRDbGFzcygndW5zZWxlY3RlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBkZWJ1ZyhcImhhbmRsaW5nIFwiICsgcGFyZW50ICsgXCIuXCIgKyAoc2VsZWN0aW9uQ29udHJvbC52YWwoKSkpO1xuICAgICAgICAgIGlmICgoKF9yZWYgPSBpdGVtLnNlY3Rpb25zKSAhPSBudWxsID8gX3JlZi5sZW5ndGggOiB2b2lkIDApID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzLmhhbmRsZVNlY3Rpb25TZWxlY3Rpb24oaXRlbS5zZWN0aW9ucywgaXRlbS5pZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH0sXG4gICAgZmV0Y2hSZXBvcnRTZWN0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZmV0Y2g7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5mZXRjaFJlcG9ydFNlY3Rpb25zJyk7XG4gICAgICBmZXRjaCA9ICQuRGVmZXJyZWQoKTtcbiAgICAgIGZldGNoLmRvbmUoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgX3RoaXMucG9zc2libGVTZWN0aW9ucyA9IGRhdGEuc2VjdGlvbnM7XG4gICAgICAgICAgX3RoaXMuJCgnLnNlY3Rpb25saXN0JykuZW1wdHkoKTtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuYnVpbGRSZXBvcnRTZWN0aW9uTGlzdChfdGhpcy5wb3NzaWJsZVNlY3Rpb25zLCBfdGhpcy4kKCcuc2VjdGlvbmxpc3QnKSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZmV0Y2gucmVzb2x2ZSh7XG4gICAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgaWQ6ICdpbnRybycsXG4gICAgICAgICAgICAgIG5hbWU6ICdJbnRyb2R1Y3Rpb24nLFxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ3RpdGxlLCBjcmVkaXRzLCBhbmQgaW50cm9kdWN0b3J5IHBhcmFncmFwaHMuJyxcbiAgICAgICAgICAgICAgcHJlc2VuY2U6ICdyZXF1aXJlZCcsXG4gICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICBpZDogJ2NsaW1hdGVyZXZpZXcnLFxuICAgICAgICAgICAgICBuYW1lOiAnQ2xpbWF0ZSBSZXZpZXcnLFxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2EgZGVzY3JpcHRpb24gb2YgdGhlIHJlZ2lvblxcJ3MgY3VycmVudCBhbmQgcHJvamVjdGVkIGNsaW1hdGUuJyxcbiAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgaWQ6ICd0ZW1wZXJhdHVyZScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnVGVtcGVyYXR1cmUnLFxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdjdXJyZW50IGFuZCBwcm9qZWN0ZWQgdGVtcGVyYXR1cmUuJyxcbiAgICAgICAgICAgICAgICAgIHByZXNlbmNlOiAnb3B0aW9uYWwnLFxuICAgICAgICAgICAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdyYWluZmFsbCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnUmFpbmZhbGwnLFxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdjdXJyZW50IGFuZCBwcm9qZWN0ZWQgcHJlY2lwaXRhdGlvbi4nLFxuICAgICAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgICAgICBzZWN0aW9uczogW11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgaWQ6ICdiaW9kaXZlcnNpdHknLFxuICAgICAgICAgICAgICBuYW1lOiAnQmlvZGl2ZXJzaXR5IFJldmlldycsXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnYSBkZXNjcmlwdGlvbiBvZiB0aGUgcmVnaW9uXFwncyBjdXJyZW50IGFuZCBwcm9qZWN0ZWQgYmlvZGl2ZXJzaXR5LiBBIGRlc2NyaXB0aW9uIG9mIHRoZSByZWdpb25cXCdzIGN1cnJlbnQgYW5kIHByb2plY3RlZCBiaW9kaXZlcnNpdHkuIEEgZGVzY3JpcHRpb24gb2YgdGhlIHJlZ2lvblxcJ3MgY3VycmVudCBhbmQgcHJvamVjdGVkIGJpb2RpdmVyc2l0eS4gQSBkZXNjcmlwdGlvbiBvZiB0aGUgcmVnaW9uXFwncyBjdXJyZW50IGFuZCBwcm9qZWN0ZWQgYmlvZGl2ZXJzaXR5LicsXG4gICAgICAgICAgICAgIHByZXNlbmNlOiAnb3B0aW9uYWwnLFxuICAgICAgICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnb3ZlcmFsbCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnT3ZlcmFsbCcsXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2N1cnJlbnQgYW5kIHByb2plY3RlZCBiaW9kaXZlcnNpdHkgb3ZlciBhbGwgbW9kZWxsZWQgc3BlY2llcycsXG4gICAgICAgICAgICAgICAgICBwcmVzZW5jZTogJ29wdGlvbmFsJyxcbiAgICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnbWFtbWFscycsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTWFtbWFscycsXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2N1cnJlbnQgYW5kIHByb2plY3RlZCBiaW9kaXZlcnNpdHkgb3ZlciBtYW1tYWwgc3BlY2llcycsXG4gICAgICAgICAgICAgICAgICBwcmVzZW5jZTogJ29wdGlvbmFsJyxcbiAgICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnYW1waGliaWFucycsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQW1waGliaWFucycsXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2N1cnJlbnQgYW5kIHByb2plY3RlZCBiaW9kaXZlcnNpdHkgb3ZlciBhbXBoaWJpYW4gc3BlY2llcycsXG4gICAgICAgICAgICAgICAgICBwcmVzZW5jZTogJ29wdGlvbmFsJyxcbiAgICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAncmVwdGlsZXMnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1JlcHRpbGVzJyxcbiAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnY3VycmVudCBhbmQgcHJvamVjdGVkIGJpb2RpdmVyc2l0eSBvdmVyIHJlcHRpbGUgc3BlY2llcycsXG4gICAgICAgICAgICAgICAgICBwcmVzZW5jZTogJ29wdGlvbmFsJyxcbiAgICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnYmlyZHMnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0JpcmRzJyxcbiAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnY3VycmVudCBhbmQgcHJvamVjdGVkIGJpb2RpdmVyc2l0eSBvdmVyIGJpcmQgc3BlY2llcycsXG4gICAgICAgICAgICAgICAgICBwcmVzZW5jZTogJ29wdGlvbmFsJyxcbiAgICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICBpZDogJ2FwcGVuZGl4ZXMnLFxuICAgICAgICAgICAgICBuYW1lOiAnQXBwZW5kaWNlcycsXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAndGFibGVzIGFuZCBvdGhlciBhcHBlbmRpY2VzLicsXG4gICAgICAgICAgICAgIHByZXNlbmNlOiAncmVxdWlyZWQnLFxuICAgICAgICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnb2JzZXJ2ZWRtYW1tYWxsaXN0JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdNYW1tYWxzIFByZXNlbnQnLFxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdsaXN0IG9mIG1hbW1hbHMgY3VycmVudGx5IG9yIHByb2plY3RlZCB0byBiZSBwcmVzZW50IGluIHJlZ2lvbi4nLFxuICAgICAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgICAgICBzZWN0aW9uczogW11cbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ29ic2VydmVkYW1waGliaWFuc2xpc3QnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0FtcGhpYmlhbnMgUHJlc2VudCcsXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2xpc3Qgb2YgYW1waGliaWFucyBjdXJyZW50bHkgb3IgcHJvamVjdGVkIHRvIGJlIHByZXNlbnQgaW4gcmVnaW9uLicsXG4gICAgICAgICAgICAgICAgICBwcmVzZW5jZTogJ29wdGlvbmFsJyxcbiAgICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnb2JzZXJ2ZWRyZXB0aWxlc2xpc3QnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1JlcHRpbGVzIFByZXNlbnQnLFxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdsaXN0IG9mIHJlcHRpbGVzIGN1cnJlbnRseSBvciBwcm9qZWN0ZWQgdG8gYmUgcHJlc2VudCBpbiByZWdpb24uJyxcbiAgICAgICAgICAgICAgICAgIHByZXNlbmNlOiAnb3B0aW9uYWwnLFxuICAgICAgICAgICAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdvYnNlcnZlZGJpcmRzbGlzdCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQmlyZHMgUHJlc2VudCcsXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2xpc3Qgb2YgYmlyZHMgY3VycmVudGx5IG9yIHByb2plY3RlZCB0byBiZSBwcmVzZW50IGluIHJlZ2lvbi4nLFxuICAgICAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgICAgICBzZWN0aW9uczogW11cbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ3NjaWVuY2UnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1NjaWVuY2UnLFxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdkZXNjcmlwdGlvbiBvZiB0aGUgY2xpbWF0ZSBhbmQgc3BlY2llcyBkaXN0cmlidXRpb24gbW9kZWxsaW5nIHVzZWQgdG8gZ2VuZXJhdGUgdGhlIGRhdGEgaW4gdGhlIHJlcG9ydC4nLFxuICAgICAgICAgICAgICAgICAgcHJlc2VuY2U6ICdyZXF1aXJlZCcsXG4gICAgICAgICAgICAgICAgICBzZWN0aW9uczogW11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdXG4gICAgICAgIH0pO1xuICAgICAgfSwgMTAwMCk7XG4gICAgICByZXR1cm4gZmV0Y2gucHJvbWlzZSgpO1xuICAgIH1cbiAgfSwge1xuICAgIHRlbXBsYXRlczoge1xuICAgICAgbGF5b3V0OiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwic2VjdGlvbmxpc3RcXFwiPlxcbiAgICBsb2FkaW5nIGF2YWlsYWJsZSBzZWN0aW9ucy4uXFxuPC9kaXY+XCIpLFxuICAgICAgc2VjdGlvblNlbGVjdG9yOiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwic2VjdGlvbnNlbGVjdG9yXFxcIiBpZD1cXFwic2VjdGlvbi08JT0gaWQgJT5cXFwiPlxcbiAgICA8bGFiZWwgY2xhc3M9XFxcIm5hbWVcXFwiXFxuICAgICAgICA8JSBpZiAocHJlc2VuY2UgPT0gJ3JlcXVpcmVkJykgeyBwcmludCgndGl0bGU9XFxcIlRoaXMgc2VjdGlvbiBpcyByZXF1aXJlZFxcXCInKTsgfSAlPlxcbiAgICA+PGlucHV0XFxuICAgICAgICB0eXBlPVxcXCJjaGVja2JveFxcXCJcXG4gICAgICAgIHZhbHVlPVxcXCI8JT0gaWQgJT4tc2VsZWN0ZWRcXFwiXFxuICAgICAgICBjaGVja2VkPVxcXCJjaGVja2VkXFxcIlxcbiAgICAgICAgPCUgaWYgKHByZXNlbmNlID09ICdyZXF1aXJlZCcpIHsgcHJpbnQoJ2Rpc2FibGVkPVxcXCJkaXNhYmxlZFxcXCInKTsgfSAlPlxcbiAgICAvPiA8JT0gbmFtZSAlPjwvbGFiZWw+XFxuICAgIDxwIGNsYXNzPVxcXCJkZXNjcmlwdGlvblxcXCI+PCU9IGRlc2NyaXB0aW9uICU+PC9wPlxcblxcbjwvZGl2PlwiKSxcbiAgICAgIHN1YnNlY3Rpb25zOiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwic3Vic2VjdGlvbnMgY2xlYXJmaXhcXFwiPlxcbiAgICA8cCBjbGFzcz1cXFwic3Vic2VjdGlvbmludHJvXFxcIj5Db250YWlucyB0aGVzZSBzdWJzZWN0aW9uczo8L3A+XFxuPC9kaXY+XCIpXG4gICAgfVxuICB9KTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IEFwcFZpZXc7XG5cbn0pLmNhbGwodGhpcyk7XG4iXX0=
