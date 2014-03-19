
# $ = require 'jquery'
# _ = require 'lodash'
# Backbone = require 'backbone'
# L = require 'leaflet'

MapLayer = require '../models/maplayer'

AppView = Backbone.View.extend {
    # ---------------------------------------------------------------
    # this view's base element
    tagName: 'div'
    className: 'splitmap'
    id: 'splitmap'
    # ---------------------------------------------------------------
    events:
        'click #doit': 'activateSplitter'
    # ---------------------------------------------------------------
    initialize: ()->
        @mapLayer = new MapLayer 'left', 'Left Map', 'left.map'
        _.bindAll this

        @fetchSpeciesInfo()
    # ---------------------------------------------------------------
    render: ()->
        @$el.append AppView.layout()
        $('#contentwrap').append @$el

        @map = L.map 'map', {
            center: [-20, 136]
            zoom: 5
        }
        L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
            maxZoom: 18
        }).addTo @map

        @leftForm = @$el.find '.left.form'
        @buildLeftForm @leftForm

        @leftTag = @$el.find '.left.tag'
        @rightTag = @$el.find '.right.tag'

        @splitLine = @$el.find '.splitline'
        @splitThumb = @$el.find '.splitthumb'

    # ---------------------------------------------------------------
    # ajaxy stuff
    # ---------------------------------------------------------------
    fetchSpeciesInfo: ()->
        return $.ajax({
            url: '/data/species'
        }).done (data)=>
            speciesLookupList = []
            speciesSciNameList = []

            $.each data, (sciName, commonNames)=>
                speciesSciNameList.push sciName
                if commonNames
                    $.each commonNames, (cnIndex, cn)=>
                        speciesLookupList.push {
                            label: cn + ' (' + sciName + ')'
                            value: sciName
                        }
                else
                    speciesLookupList.push {
                        label: sciName
                        value: sciName
                    }

            @speciesLookupList = speciesLookupList
            @speciesSciNameList = speciesSciNameList
    # ---------------------------------------------------------------
    # form creation
    # ---------------------------------------------------------------
    buildLeftForm: (wrapper)->
        # build a form inside the wrapper
        wrapper.append AppView.leftForm()

        if @speciesLookupList
            @$el.find('#speciesname').autocomplete {
                source: @speciesLookupList
            }

    # ---------------------------------------------------------------
    # splitter handling
    # ---------------------------------------------------------------
    startSplitterTracking: ()->
        @stopSplitterTracking() if @splitterTrackId

        @splitterTrackId = setInterval ()=>
            @resizeThings()
        , 200
        true
    # ---------------------------------------------------------------
    stopSplitterTracking: ()->
        clearInterval @splitterTrackId
        @resizeThings
    # ---------------------------------------------------------------
    activateSplitter: ()->
        @splitThumb.draggable {
            # axis: 'x'
            # containment: 'parent'
            # handle: '.thumb'
            containment: @$el
            scroll: false
            start: @startSplitterTracking
            drag: @resizeThings
            stop: @stopSplitterTracking
        }
        @resizeThings()
        @splitLine.addClass 'active'
        @splitThumb.addClass 'active'
    # ---------------------------------------------------------------
    deactivateSplitter: ()->
        @splitThumb.removeClass 'active'
        @splitLine.removeClass 'active'
        @splitThumb.draggable 'destroy'
    # ---------------------------------------------------------------
    resizeThings: ()->
        newWidth = @splitThumb.position().left + (@splitThumb.width() / 2.0)
        @splitLine.css 'left', newWidth
        @leftTag.css 'clip', 'rect(0 ' + newWidth + 'px auto 0)'

    # ---------------------------------------------------------------
},{ # ===============================================================
    # templates here
    # ---------------------------------------------------------------
    layout: _.template """
        <div class="splitline"></div>
        <div class="splitthumb"><span>&#x276e; &#x276f;</span></div>
        <div class="left tag">left tag<button id="doit">do it</button></div>
        <div class="right tag">right tag</div>
        <div class="left form"></div>
        <div id="mapwrapper"><div id="map"></div></div>
    """
    # ---------------------------------------------------------------
    leftForm: _.template """
        <input id="speciesname" name="speciesname" placeholder="&hellip; type a species name &hellip;" />
    """
    # ---------------------------------------------------------------
}

module.exports = AppView