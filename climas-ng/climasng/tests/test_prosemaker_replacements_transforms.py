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
            'a':             'Aaa',
            'b':             'Bbb',
            'one':            1,
            'onePone':        1.1,
            'onePsix':        1.6,
            'negone':        -1,
            'negonePone':    -1.1,
            'negonePsix':    -1.6,
            'two':            2,
            'ten':           10,
            'twelve':        10,
            'hasinnerword':  'has inner word',
            'strInner':      'inner'
        }

    # ------------------------------------------------------- test --
    def test_pm_transform_absolute(self):
        self.assertParses('{{onePone, absolute}}', '1.1')
        self.assertParses('{{negonePone}}', '-1.1')
        self.assertParses('{{negonePone, absolute}}', '1.1')

# ===================================================================
