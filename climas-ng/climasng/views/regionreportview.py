import os

from pyramid.response import Response
from pyramid.view import view_config

from climasng.parsing.docparser import DocParser

# -------------------------------------------------------------------
# -------------------------------------------------------------------

class RegionReportView(object):

    def __init__(self, request):
        self.request = request

    @view_config(route_name='regionreport', renderer='../templates/regionreport.html.pt')
    def __call__(self):
        params = self.request.params
        report_content = ''
        # report_content = DocParser().test()
        report_content += '<p>A report for the <b>' + params['regiontype']
        report_content += '</b> region <b>' + params['region']
        report_content += '</b> containing these sections:</p><ul><li>'
        report_content += params['sections'].replace(' ', '</li><li>')
        report_content += '</li></ul>'
        report_content += '<p>&hellip;will eventually be available from here.</p>'
        return { 'report_content': report_content }

# -------------------------------------------------------------------
