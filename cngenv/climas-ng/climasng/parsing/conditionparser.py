
from parsimonious.grammar import Grammar
from parsimonious.nodes import *
from decimal import Decimal

# ===================================================================
class Percentage(Decimal):
    pass
# ===================================================================
class ConditionVisitor(NodeVisitor):

    def __init__(self, data={}):
        self._data = data

    ## data ---------------------------------------------------------
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

    # proper node handlers ------------------------------------------
    def visit_condition(self, node, value):
        # top level condition should already have a single boolean child
        return value

    def visit_always(self, node, children):
        return True

    def visit_never(self, node, children):
        return False

    def visit_value(self, node, children):
        # should be already resolved to a real value
        return children[0]

    def visit_numeric(self, node, children):
        return Decimal(node.text)

    def visit_varname(self, node, children):
        if node.text in self._data:
            # the varname they specified is known to us..
            return self._data[node.text]
        # otherwise except out
        raise Exception("Unknown variable name: '" + node.text + "'")

    def visit_range(self, node, children):
        if children[1] == "%":
            return Percentage(node.text)
        # otherwise raise the numeric first child directly
        return children[0]

    def visit_comparison(self, node, children):
        return children[0]

    def visit_simple_comparison(self, node, (left, ws1, comp, ws2, right)):
        if comp == '==':
            return (left == right)

        if comp == '!=':
            return (left != right)

    def visit_range_eq_comparison(self, node, (left, ws1, eq1, range, eq2, ws2, right)):
        left_min = right - range
        left_max = right + range
        return (left_min <= left <= left_max)

    def visit_simple_comparator(self, node, (cmp)):
        return cmp[0]

    def visit_percent_sign(self, node, children):
        return node.text

    # throwaway node handlers ---------------------------------------
    def visit_ws(self, node, children):
        return node.text

    def visit_range_eq_prev(self, node, children):
        return node.text

    def visit_range_eq_post(self, node, children):
        return node.text

    def visit_cmp_eq(self, node, children):
        return node.text

    def visit_cmp_neq(self, node, children):
        return node.text

# ===================================================================
class ConditionParser(object):

    def __init__(self, condition="always", data={}):
        self._condition = condition
        self._data = data

    ## condition ----------------------------------------------------
    @property
    def condition(self):
        """ The 'condition' property """
        return self._condition

    @condition.setter
    def condition(self, value):
        self._condition = value
        return self._condition

    @condition.deleter
    def condition(self):
        del self._condition

    ## data ---------------------------------------------------------
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

    ## result -------------------------------------------------------
    @property
    def result(self):
        """ The 'result' property """

        g = Grammar("""
            condition = always / never / comparison

            ws = ~"\s*"

            never = ~"never"i
            always = ~"always"i

            value = numeric / varname

            numeric = ~"\d+(\.\d+)?"
            varname = ~"[a-z_][a-z0-9_]*"i

            range = numeric percent_sign
            percent_sign = ~"%?"

            comparison = range_eq_comparison / simple_comparison

            simple_comparison = value ws simple_comparator ws value

            simple_comparator = cmp_eq / cmp_neq
            cmp_eq = "=="
            cmp_neq = "!="

            range_eq_comparison = value ws range_eq_prev range range_eq_post ws value
            range_eq_prev = "="
            range_eq_post = "="
        """)

        tree = g.parse(self._condition)
        v = ConditionVisitor(self.data)

        return v.visit(tree)[0]








