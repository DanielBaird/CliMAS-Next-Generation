import os

from pyramid.response import Response
from pyramid.view import view_config
import pyramid.httpexceptions as httpexceptions

# ------------------------------------------------------------------------

class MapView(object):

    def __init__(self, request):
        self.request = request

    @view_config(route_name='map', renderer='../templates/map.html.pt')
    def __call__(self):
        page_content = "adsf"
        return { 'page_content': page_content }

# ------------------------------------------------------------------------
