
from parsimonious.grammar import Grammar
from parsimonious.nodes import *

# ===================================================================
class ReplacementVisitor(NodeVisitor):

    # throwaway node handler ----------------------------------------
    def generic_visit(self, node, children):
        return node.text.strip()

    # proper node handlers ------------------------------------------
    def visit_replacement(self, node, (ws1, varname, translist, ws2)):
        return [varname, translist]

    def visit_transformationlist(self, node, translist):
        return translist

    def visit_transformation(self, node, (ws1, comma, ws2, transname, transarglist)):
        return [transname, transarglist]

    def visit_transarglist(self, node, args):
        return args

    def visit_transarg(self, node, arg):
        return arg[0]

    def visit_doublequotedarg(self, node, (ws, q1, arg, q2)):
        return arg

    def visit_singlequotedarg(self, node, (ws, q1, arg, q2)):
        return arg

    def visit_unquotedarg(self, node, (ws, arg)):
        return arg

# ===================================================================
class ReplacementParser(object):

    def __init__(self, replacement):
        self._replacement = replacement

    ## replacement ----------------------------------------------------
    @property
    def replacement(self):
        """ The 'replacement' property """
        return self._replacement

    @replacement.setter
    def replacement(self, value):
        self._replacement = value
        return self._replacement

    @replacement.deleter
    def replacement(self):
        del self._replacement

    ## result -------------------------------------------------------
    @property
    def result(self):
        """ The 'result' property """

        g = Grammar("""
            replacement = ws varname transformationlist ws

            transformationlist = transformation*
            transformation = ws comma ws transname transarglist

            transarglist = transarg*

            transarg = singlequotedarg / doublequotedarg / unquotedarg

            doublequotedarg = ws dblq notdblq dblq
            singlequotedarg = ws sngq notsngq sngq
            unquotedarg = ws notwsorcomma

            transname = varname
            varname = ~"[a-z_][a-z0-9_]*"i

            comma = ","
            ws = ~"\s*"
            notwsorcomma = ~"[^\s,]+"

            dblq = "\\""
            notdblq = ~"[^\\"]*"

            sngq = "'"
            notsngq = ~"[^']*"
        """)

        tree = g.parse(self._replacement)
        return ReplacementVisitor().visit(tree)
