
import json
import os
from string import Template

from climasng.parsing.prosemaker import ProseMaker


class DocAssembler(object):

    def __init__(self, doc_data, settings={}):
        self._defaults = {
            # pattern can use region_id and region_type to make a url
            'region_url_pattern': Template('/regiondata/${region_id}'),
            'section_path': './climasng/reportcontent/sections'
        }
        # merge in the user settings
        self._settings = dict(self._defaults.items() + settings.items())

        self._doc_data = doc_data

        self._region_type = doc_data['regiontype']
        self._region_id = doc_data['regionid']
        self._sections = doc_data['sections']
        self._format = doc_data['format']

        self.getRegionData()
        self.getSource()


    def getRegionData(self, region_id=None, region_type=None):
        region_type = self._region_type if region_type is None else region_type
        region_id = self._region_id if region_id is None else region_id
        self._region = json.dumps({
            'region_type': region_type,
            'region_id': region_id
        })
        return self._region


    def getSource(self):
        sources = []
        for section in self._sections:
            sources.append(self.getSectionSource(section))
        self._source = "\n\n".join(sources)
        return self._source

    def getSectionSource(self, section):
        section_path = os.path.join(
            self._settings['section_path'],
            os.sep.join(section.split('.')),
            'source.md'
        )
        try:
            with file(section_path) as sourcefile:
                return sourcefile.read()
        except IOError as e:
            return ''


    def result(self):
        pm = ProseMaker()
        pm.data = self._region
        pm.source = self._source
        # currently returning raw Markdown.
        return pm.doc

