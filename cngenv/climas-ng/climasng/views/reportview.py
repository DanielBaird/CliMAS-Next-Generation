import os

from pyramid.response import Response
from pyramid.view import view_config
import pyramid.httpexceptions as httpexceptions

from sqlalchemy.exc import DBAPIError

from climasng.models import (DBSession, MyModel)

from climasng.parsing.docparser import DocParser

# ------------------------------------------------------------------------

@view_config(route_name='report', renderer='../templates/report.html.pt')
def report_page(request):
    report_content = DocParser().test()
    return { 'report_content': report_content }

# ------------------------------------------------------------------------
