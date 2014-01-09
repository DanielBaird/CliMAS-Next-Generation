import os

from pyramid.response import Response
from pyramid.view import view_config
import pyramid.httpexceptions as httpexceptions

from sqlalchemy.exc import DBAPIError

from .models import (DBSession, MyModel)

from parsing.docparser import DocParser

# ------------------------------------------------------------------------

@view_config(route_name='doc', renderer='templates/doc.html.pt')
def doc_page(request):
    try:
        page_content_file = os.path.join(os.path.dirname(__file__), 'pagecontent', request.matchdict['doc_name'] + '.html')
        with file(page_content_file) as f:
            page_content = f.read()
    except IOError:
        return httpexceptions.HTTPNotFound()

    return { 'doc': request.matchdict['doc_name'], 'page_content': page_content }

# ------------------------------------------------------------------------

@view_config(route_name='form', renderer='templates/form.html.pt')
def form_page(request):
    return { 'project': 'CliMAS NG', 'one': 1 }

# ------------------------------------------------------------------------

@view_config(route_name='report', renderer='templates/report.html.pt')
def report_page(request):
    report_content = DocParser().test()
    return { 'report_content': report_content }

# ------------------------------------------------------------------------

@view_config(route_name='home', renderer='templates/home.html.pt')
def my_view(request):
    try:
        one = DBSession.query(MyModel).filter(MyModel.name == 'one').first()
    except DBAPIError:
        return Response(conn_err_msg, content_type='text/plain', status_int=500)
    return {'one': one, 'project': 'climas-ng'}

# ------------------------------------------------------------------------

conn_err_msg = """\
Pyramid is having a problem using your SQL database.  The problem
might be caused by one of the following things:

1.  You may need to run the "initialize_climas-ng_db" script
    to initialize your database tables.  Check your virtual
    environment's "bin" directory for this script and try to run it.

2.  Your database server may not be running.  Check that the
    database server referred to by the "sqlalchemy.url" setting in
    your "development.ini" file is running.

After you fix the problem, please restart the Pyramid application to
try it again.
"""

