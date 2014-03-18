
# $ = require 'jquery'
# _ = require 'lodash'
# Backbone = require 'backbone'
# L = require 'leaflet'

MapLayer = require '../models/maplayer'

AppView = Backbone.View.extend {
    # ---------------------------------------------------------------
    events:
        'change input[type=radio].rtype':  'render'
        # 'change select.regionselect':      'changeRegion'
        # 'change input[type=radio].year':   'changeYear'
        # 'change input[type=radio].format': 'changeFormat'
        'click #doit':                 'doIt'
    # ---------------------------------------------------------------
    initialize: ()->
        @mapLayer = new MapLayer 'left', 'Left Map', 'left.map'
        _.bindAll this
    # ---------------------------------------------------------------
    render: ()->
        me = this
        @$el.append AppView.layout()
        @$el.append $('<button id="doit">do it</button>')
        @$el.append AppView.preTemplate { stuff: 'stuff goes here' }
        $('.content').append @$el
        @map = L.map 'map', {
            center: [51.505, -0.09]
            zoom: 13
        }
        L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
            maxZoom: 18
        }).addTo @map
    # ---------------------------------------------------------------
    doIt: ()->
        @$el.append AppView.preTemplate { stuff: @mapLayer.shortName }
    # ---------------------------------------------------------------
},{ # ================================================================
    # templates here
    # ---------------------------------------------------------------
    layout: _.template """
        <div id="map" style="width: 50%; height: 300px;"></div>
    """
    # ---------------------------------------------------------------
    preTemplate: _.template """
        <pre>
            <%= stuff %>
        </pre>
    """
    # ---------------------------------------------------------------
}

module.exports = AppView