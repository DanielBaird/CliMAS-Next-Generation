import unittest
import transaction

from pyramid import testing

from climasng.tests import ProseMakerTestCase
from climasng.parsing.prosemaker import ProseMaker

# ===================================================================
class TestProseMakerReplacements(ProseMakerTestCase):

    def setUp(self):
        super(TestProseMakerReplacements, self).setUp()
        self.pm.data = {
            'one':            1,
            'oneandabit':     1.00001,
            'onePone':        1.1,
            'onePsix':        1.6,
            'two':            2,
            'ten':           10,
            'twelve':        10,
            'hasinnerword':  'has inner word',
            'strInner':      'inner'
        }

    # ------------------------------------------------------- test --
    def test_pm_literal_addition(self):
        self.assertParses('{{1 + 1}}', '2')
        self.assertParses('{{1 + 2}}', '3')
        self.assertParses('{{ 10 + 2 }}', '12')

# ===================================================================
