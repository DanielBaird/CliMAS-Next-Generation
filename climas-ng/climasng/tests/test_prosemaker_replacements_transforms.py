import unittest
import transaction

from pyramid import testing

from climasng.tests import ProseMakerTestCase
from climasng.parsing.prosemaker import ProseMaker

# ===================================================================
class TestProseMakerReplacements(ProseMakerTestCase):

    def setUp(self):
        super(TestProseMakerReplacements, self).setUp()
        self.pm.dataJSON = '''{
            "a":             "Aaa",
            "b":             "Bbb",
            "one":            1,
            "onePone":        1.1,
            "onePsix":        1.6,
            "negone":        -1,
            "negonePone":    -1.1,
            "negonePsix":    -1.6,
            "two":            2,
            "ten":           10,
            "twelve":        12,
            "sixteen":       16,
            "hasinnerword":  "has inner word",
            "strInner":      "inner"
        }'''

    # ------------------------------------------------------- test --
    def test_pm_transform_bad(self):
        self.pm.source = '{{onePone, notatransform}}'
        # has to be a lambda coz otherwise the doc property is invoked
        # right here and the exception arrives before the assertRaises
        # method gets called.
        self.assertRaises(Exception, lambda: self.pm.doc)

    # ------------------------------------------------------- test --
    def test_pm_transform_absolute(self):
        self.assertParses('{{onePone, absolute}}', '1.1')
        self.assertParses('{{negonePone}}', '-1.1')
        self.assertParses('{{negonePone, absolute}}', '1.1')

    # ------------------------------------------------------- test --
    def test_pm_transform_round(self):
        self.assertParses('{{onePone, round}}', '1')
        self.assertParses('{{negonePone, round}}', '-1')
        self.assertParses('{{negonePsix, round}}', '-2')

    # ------------------------------------------------------- test --
    def test_pm_transform_roundup(self):
        self.assertParses('{{onePone, roundup}}', '2')
        self.assertParses('{{onePsix, roundup}}', '2')
        self.assertParses('{{negonePone, roundup}}', '-2')
        self.assertParses('{{negonePsix, roundup}}', '-2')

    # ------------------------------------------------------- test --
    def test_pm_transform_rounddown(self):
        self.assertParses('{{onePone, rounddown}}', '1')
        self.assertParses('{{onePsix, rounddown}}', '1')
        self.assertParses('{{negonePone, rounddown}}', '-1')
        self.assertParses('{{negonePsix, rounddown}}', '-1')

# ===================================================================
