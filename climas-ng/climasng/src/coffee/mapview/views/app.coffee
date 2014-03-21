
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

    # tracking the splitter bar
    trackSplitter: false
    trackPeriod: 100
    # ---------------------------------------------------------------
    events:
        'click #btn-change': 'toggleForms'
        'click #btn-compare': 'toggleSplitter'
    # ---------------------------------------------------------------
    initialize: ()->
        @mapLayer = new MapLayer 'left', 'Left Map', 'left.map'
        _.bindAll this

        @speciesInfoFetchProcess = @fetchSpeciesInfo()
    # ---------------------------------------------------------------
    render: ()->
        @$el.append AppView.templates.layout {
            leftTag: AppView.templates.leftTag()
            rightTag: AppView.templates.rightTag()

            leftForm: AppView.templates.leftForm()
        }
        $('#contentwrap').append @$el

        @map = L.map 'map', {
            center: [-20, 136]
            zoom: 5
        }
        L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
            maxZoom: 18
        }).addTo @map

        @leftForm = @$el.find '.left.form'
        @buildLeftForm()

        @leftTag = @$el.find '.left.tag'
        @rightTag = @$el.find '.right.tag'

        @splitLine = @$el.find '.splitline'
        @splitThumb = @$el.find '.splitthumb'

    # ---------------------------------------------------------------
    # UI actions
    # ---------------------------------------------------------------
    centreMap: (repeatedlyFor)->
        repeatedlyFor = 500 unless repeatedlyFor
        setTimeout(
            ()=> @map.invalidateSize(false)
            later
        ) for later in [0..repeatedlyFor] by 25

    # ---------------------------------------------------------------
    toggleForms: ()->
        @$el.toggleClass 'showforms'
        @centreMap()
    # ---------------------------------------------------------------
    toggleSplitter: ()->
        @$el.toggleClass 'split'
        if @$el.hasClass 'split'
            @activateSplitter()
        else
            @deactivateSplitter()
        @centreMap()

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
    buildLeftForm: ()->
        @speciesInfoFetchProcess.done =>
            @$el.find('#leftmapthing').autocomplete {
                source: @speciesLookupList
            }

    # ---------------------------------------------------------------
    # splitter handling
    # ---------------------------------------------------------------
    startSplitterTracking: ()->
        @trackSplitter = true
        @splitLine.addClass 'dragging'

        @locateSplitter()
    # ---------------------------------------------------------------
    locateSplitter: ()->
        if @trackSplitter
            @resizeThings()
            # decrement remaining track count, unless it's true
            if @trackSplitter == 0
                @trackSplitter = false
            else if @trackSplitter != true
                @trackSplitter -= 1
            setTimeout @locateSplitter, @trackPeriod
    # ---------------------------------------------------------------
    stopSplitterTracking: ()->
        @splitLine.removeClass 'dragging'
        @trackSplitter = 5 # five more resizings, then stop
    # ---------------------------------------------------------------
    activateSplitter: ()->
        @splitThumb.draggable {
            containment: $ '#mapwrapper'
            scroll: false
            start: @startSplitterTracking
            drag: @resizeThings
            stop: @stopSplitterTracking
        }
        @resizeThings()
    # ---------------------------------------------------------------
    deactivateSplitter: ()->
        @splitThumb.draggable 'destroy'
        @resizeThings()
    # ---------------------------------------------------------------
    resizeThings: ()->
        if @$el.hasClass 'split'
            # we're still in split mode
            newWidth = @splitThumb.position().left + (@splitThumb.width() / 2.0)
            @splitLine.css 'left', newWidth
            @leftTag.css 'clip', 'rect(0 ' + newWidth + 'px auto 0)'
        else
            # we're not in split mode, so go full left side only.
            @leftTag.css 'clip', 'rect(auto auto auto auto)'

    # ---------------------------------------------------------------
},{ templates: { # ==================================================
    # templates here
    # ---------------------------------------------------------------
    layout: _.template """
        <div class="splitline"></div>
        <div class="splitthumb"><span>&#x276e; &#x276f;</span></div>
        <div class="left tag"><%= leftTag %></div>
        <div class="right tag"><%= rightTag %></div>
        <div class="left form"></div>
        <div class="right form"></div>
        <div id="mapwrapper"><div id="map"></div></div>
    """
    # ---------------------------------------------------------------
    leftTag: _.template """
        <div>
            <input id="leftmapthing" name="leftmapthing" placeholder="&hellip; start typing species or group name &hellip;" />
            <button id="btn-change">change</button>
            <button id="btn-compare">compare</button>
        </div>
    """
    # ---------------------------------------------------------------
    rightTag: _.template """
        <div>
            <input id="rightmapthing" name="rightmapthing" placeholder="&hellip; start typing species or group name &hellip;" />
        </div>
    """
    # ---------------------------------------------------------------
    leftForm: _.template """
    """
    # ---------------------------------------------------------------
}}

module.exports = AppView