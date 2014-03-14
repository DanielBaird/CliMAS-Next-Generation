
import re
import json
from decimal import *

from docpart import DocPart
from conditionparser import ConditionParser

class ProseMaker(object):

    def __init__(self):
        self._data = {}
        self._json = ''
        self._source = ''

    ## data property ------------------------------------------------
    @property
    def data(self):
        """ The 'data' property """
        return self._data

    @data.setter
    def data(self, value):
        self._data = value
        self._json = json.dumps(value, indent=4)
        return self._data

    @data.deleter
    def data(self):
        del self._data

    ## dataJSON property --------------------------------------------
    @property
    def dataJSON(self):
        """ 'dataJSON' property, data as a JSON string """
        return self._json

    @dataJSON.setter
    def dataJSON(self, value):
        self._json = value
        self._data = json.loads(value, parse_float=Decimal)
        return self._json

    @dataJSON.deleter
    def dataJSON(self):
        del self._json
        del self._data

    ## source property ----------------------------------------------
    @property
    def source(self):
        """ The 'source' property """
        return self._source

    @source.setter
    def source(self, value):
        self._source = value

        raw_parts = self._source.split('[[')
        self._parts = [DocPart(raw_part) for raw_part in raw_parts]

        return self._source

    @source.deleter
    def source(self):
        del self._source

    ## doc property -------------------------------------------------
    @property
    def doc(self):
        """ The 'doc' property """

        resolved_parts = [self.resolve_document_part(part) for part in self._parts]

        return(''.join(resolved_parts))

    # ---------------------------------------------------------------
    def resolve_document_part(self, doc_part):
        if self.resolve_condition(doc_part.condition):
            return self.resolve_content(doc_part.content)
        else:
            return ''

    # ---------------------------------------------------------------
    def resolve_condition(self, condition):
        # force the condition to be stringy
        condition = str(condition)
        # use a condition parser to get the answer
        cp = ConditionParser(condition, self._data)
        return cp.result

    # ---------------------------------------------------------------
    def resolve_content(self, content):

        content = str(content) # force it into a string form (probably it's already a string)

        if len(self.data) > 0: # no need to insert vars if there aren't any vars

            replacements = 1
            # repeatedly perform variable replacement until we didn't do any
            # replacements.  That means you can have a replacement inside
            # a varname.  For example, if you have this source:
            #
            #     "Today you have to wake up at {{alarm_{{daytype}}_time}} sharp!"
            #
            # And this data:
            #
            # {   daytype:            'weekday',
            #     alarm_weekday_time: '6am',
            #     alarm_weekend_time: '9am'    }
            #
            # Your result will be:
            #
            #     "Today you have to wake up at 6am sharp!"
            #
            # But if you change the daytype to "weekend", you'll get 9am in the
            # result.  Cool hey.
            #
            def var_lookup(match):
                if self.data[match.group(1)]:
                    return self.data[match.group(1)]

            while (replacements > 0):
                replacements = 0

                # this regex will catch {{placeholders}} that have no inner
                # placeholders, so the most nested {{curlies}} get resolved
                # first.
                content, replacements = re.subn(
                    r'{{\s*([^\{\}]+?)\s*}}',
                    self.resolve_replacement,
                    content
                )
        return content

    # ---------------------------------------------------------------
    def resolve_replacement(self, match):

        # match.group(1) is a comma-separated list of stuff.  the 1st
        # thing is the varname.  That's optionally followed by
        # a list of transformations.

        transforms = re.split('\s*,\s*', match.group(1))
        start_value = transforms.pop(0)

        if self.data[start_value]:
            # if it's a var we know, we can do something with it
            val = self.data[start_value]

            try:
                # Decimal(1.1) gives 1.100000000000000088817841970012523233890533447265625
                # Decimal(repr(1.1)) gives 1.1
                val = Decimal(repr(val))
            except InvalidOperation:
                # that's okay, it doesn't want to be a Decimal
                pass

            for transform in transforms:

                trans_bits = transform.split() # strips whitespace too
                trans_name = trans_bits.pop(0).lower()

                if trans_name == 'absolute':
                    val = abs(val)
                    continue

                if trans_name == 'round':
                    val = val.quantize(Decimal('1'), context=Context(rounding=ROUND_HALF_EVEN))
                    continue

                if trans_name == 'roundup':
                    val = val.quantize(Decimal('1'), context=Context(rounding=ROUND_UP))
                    continue

                if trans_name == 'rounddown':
                    val = val.quantize(Decimal('1'), context=Context(rounding=ROUND_DOWN))
                    continue

                if trans_name == 'plural':
                    if val == 1:
                        val = ''
                    else:
                        val = 's'
                    continue

                raise Exception('transformation "%s" is not implemented.' % trans_name)

            return str(val)
        else:
            # if we didn't recognise the start value, just leave the entire placeholder as is
            return str(match.group(0))














#
