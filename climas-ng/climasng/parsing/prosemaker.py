
from docpart import DocPart
from conditionparser import ConditionParser

class ProseMaker(object):

    def __init__(self):
        self._data   = {}
        self._source = ''

    ## data property ------------------------------------------------
    @property
    def data(self):
        """ The 'data' property """
        return self._data

    @data.setter
    def data(self, value):
        self._data = value
        return self._data

    @data.deleter
    def data(self):
        del self._data

    ## source property ----------------------------------------------
    @property
    def source(self):
        """ The 'source' property """
        return self._source

    @source.setter
    def source(self, value):
        self._source = value

        raw_parts = self._source.split(r"[[")                                   ###]]" ### stupid Sublime syntax highlighter
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

            # add a trailing space so the split doesn't fail if the last thing is a var.
            content = content + ' '

            # sort varnames by length, so we get a chance to replace $longname before we replace $long
            sorted_varnames = self.data.keys()
            sorted_varnames.sort(key=len, reverse=True) # reverse => longest first

            replacements = 1
            # keep repeatedly replacing the whole varialbe set until we didn't
            # do any more replacements.  That means you can have a replacement
            # inside another varname.  For example, if you have this source:
            #
            #     "Today you have to wake up at $$alarm_$$daytype_time sharp!"
            #
            # And this data:
            # {   daytype:            'weekday',
            #     alarm_weekday_time: '6am',
            #     alarm_weekend_time: '9am'    }
            #
            #
            # Your result will be:
            #     "Today you have to wake up at 6am sharp!"
            #
            # But if you change the daytype to "weekend", you'll get 9am in the
            # result.  Cool hey.
            #
            while (replacements > 0):
                replacements = 0
                for varname in sorted_varnames:
                    if ('$$' + varname) in content:
                        content = content.replace('$$' + varname, str(self.data[varname]))
                        replacements += 1

            # remember the trailing space we added at the start of this method, remove it here
            content = content[:-1]

        return content













