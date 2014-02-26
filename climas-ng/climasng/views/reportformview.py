import os

from pyramid.response import Response
from pyramid.view import view_config

# -------------------------------------------------------------------

@view_config(route_name='form', renderer='../templates/form.html.pt')
def form_page(request):
    return { 'project': 'CliMAS NG', 'one': 1 }

# -------------------------------------------------------------------
