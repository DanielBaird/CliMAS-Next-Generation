import os
import os

from pyramid.response import Response
from pyramid.view import view_config
import pyramid.httpexceptions as httpexceptions

# ------------------------------------------------------------------------

class ReflectorView(object):

    def __init__(self, request):
        self.request = request

    @view_config(route_name='reflector')
    def __call__(self):

        filename = self.request.params.get('filename', 'RegionReport')

        print(filename)

        return Response(body='report downloading coming soon!', content_type='text/plain')



        # # find the filename, css files, and format they wanted
        # filename = params['filename'] || 'RegionReport'
        # format = params['format'] || 'html'
        # css_to_include = (params['css'] && params['css'].split(',')) || []

        # # set up the headers
        # response['Expires'] = '0'   # don't cache
        # response['Cache-Control'] = 'must-revalidate, post-check=0, pre-check=0' # really don't cache
        # response['Content-Description'] = 'File Transfer' # download, don't open

        # if params['format'] == 'msword-html'

        #     response['Content-Type'] = 'application/msword' # pretend this is a word doc
        #     response['Content-Disposition'] = 'attachment; filename="' + filename + '.doc"' # pretend it's a word doc

        #     # start the doc
        #     content = ['<html><head>']

        #     # add some MS-trickery to make Word display this properly
        #     # AFAICT this doesn't work, but maybe it will in older office versions
        #     content << "<!--[if gte mso 9]>"
        #     content << "<xml>"
        #     content << "<w:WordDocument>"
        #     content << "<w:View>Print</w:View>"
        #     content << "<w:Zoom>90</w:Zoom>"
        #     content << "<w:DoNotOptimizeForBrowser/>"
        #     content << "</w:WordDocument>"
        #     content << "</xml>"
        #     content << "<![endif]-->"

        #     # add in the css files specified by the url call
        #     css_to_include.each do |cssfile|
        #         cssfile = cssfile.split('/')[0] # avoid directory trickery
        #         content << '<style>'
        #         content << File.read('public/css/' + cssfile + '.css')
        #         content << '</style>'
        #     end

        #     # finish the head and start on the actual report body
        #     content << '</head><body><div id="report">'

        #     content << fix_image_sizes( prettify_table_cells(params['content']) )

        #     content << '</div></body></html>'

        # else # default to a html report

        #     response['Content-Type'] = 'application/octet-stream'
        #     response['Content-Disposition'] = 'attachment; filename="' + filename + '.html"'

        #     # start the doc
        #     content = ['<html><head>']

        #     # add in the css files specified by the url call
        #     css_to_include.each do |cssfile|
        #         cssfile = cssfile.split('/')[0] # avoid directory trickery
        #         content << '<style>'
        #         content << File.read('public/css/' + cssfile + '.css')
        #         content << '</style>'
        #     end

        #     # finish the head and start on the actual report body
        #     content << '</head><body><div id="report">'
        #     content << params['content']
        #     content << '</div></body></html>'

        # end

        # # return the content
        # content.join "\n"

# ------------------------------------------------------------------------

