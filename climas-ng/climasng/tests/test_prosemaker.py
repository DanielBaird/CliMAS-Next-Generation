import unittest
import transaction

from pyramid import testing

from climasng.tests import ClimasTestCase
from climasng.parsing.prosemaker import ProseMaker

# ===================================================================
class TestProseMaker(ClimasTestCase):

    def setUp(self):
        self.pm = ProseMaker()
        super(TestProseMaker, self).setUp()

    def tearDown(self):
        super(TestProseMaker, self).tearDown()

    def assertParses(self, parser, source, expected):
        parser.source = source
        self.assertEqual(
            parser.doc,
            expected,
            "'%s' gave '%s'; expected '%s'" % (source, parser.doc, expected)
        )

    # ------------------------------------------------------- test --
    def test_pm_properties(self):
        some_data = {'a': 'Aaa', 'b': 'Bbb'}
        a_string = 'test source string'

        self.pm.data = some_data
        self.pm.source = a_string

        self.assertEqual(self.pm.data, some_data)
        self.assertEqual(self.pm.source, a_string)
        self.assertEqual(self.pm.doc, a_string)

    # ------------------------------------------------------- test --
    def test_pm_condition_always(self):
        samples = {
            # these sources should result in 'showing'
            'showing':  [   'showing',
                            '[[always]]showing',
                            '[[ always ]]showing',
                            '[[  always]]showing',
                            '[[AlWaYs]]showing',
            ],
            '':         [   '[[always]]',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(self.pm, sample_doc, sample_result)
    # ------------------------------------------------------- test --
    def test_pm_condition_never(self):
        samples = {
                # all these docs should result in ''
            '':         [   '[[never]]',
                            '[[never]] ',
                            '[[never]]hiding',
                            '[[ never]]hiding',
                            '[[ never ]]hiding',
                            '[[  never]]hiding',
                            '[[  NeVeR]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(self.pm, sample_doc, sample_result)
    # ------------------------------------------------------- test --
    def test_pm_condition_always_and_never(self):
        samples = {
            # these sources should result in 'showing'
            'showing':  [   'showing[[never]]hiding',
                            '[[never]]hiding[[always]]showing[[never]]hiding',
                            '[[never]][[always]]showing',
            ],
            # all these docs should result in ''
            '':         [   '[[never]]hiding[[always]]',
                            '[[always]][[never]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(self.pm, sample_doc, sample_result)
    # ------------------------------------------------------- test --
    def test_pm_condition_equality_litnum_comparison(self):
        samples = {
            # these sources should result in 'showing'
            'showing':  [   '[[1 == 1]]showing',
                            '[[1.0 == 1]]showing',
                            '[[1.2 == 1.2]]showing',
                            '[[1.20 == 1.2]]showing',
                            '[[3 == 3]]showing',
                            '[[  3==3]]showing',
            ],
            # all these docs should result in ''
            '':         [   '[[1 == 3]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(self.pm, sample_doc, sample_result)
    # ------------------------------------------------------- test --
    def test_pm_condition_inequality_litnum_comparison(self):
        samples = {
            # these sources should result in 'showing'
            'showing':  [   '[[1 != 3]]showing'
            ],
            # all these docs should result in ''
            '':         [   '[[1 != 1]]hiding',
                            '[[1.0 != 1]]hiding',
                            '[[1.2 != 1.2]]hiding',
                            '[[1.20 != 1.2]]hiding',
                            '[[3 != 3]]hiding',
                            '[[  3!=3]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(self.pm, sample_doc, sample_result)
    # ------------------------------------------------------- test --
    def test_pm_condition_greaterthan_litnum_comparison(self):
        samples = {
            # these sources should result in 'showing'
            'showing':  [   '[[2 > 1]]showing',
                            '[[1 > 0.9]]showing',
                            '[[1.1 > 1]]showing',
                            '[[10 > 2]]showing',
            ],
            # all these docs should result in ''
            '':         [   '[[1 > 2]]hiding',
                            '[[0.9 > 1]]hiding',
                            '[[2 > 10]]hiding',
                            '[[1 > 1]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(self.pm, sample_doc, sample_result)
    # ------------------------------------------------------- test --
    def test_pm_condition_greaterthaneq_litnum_comparison(self):
        samples = {
            # these sources should result in 'showing'
            'showing':  [   '[[2 >= 1]]showing',
                            '[[1 >= 0.9]]showing',
                            '[[1.1 >= 1]]showing',
                            '[[10 >= 2]]showing',
                            '[[1 >= 1]]showing',
                            '[[1.0 >= 1]]showing',
                            '[[1.2 >= 1.2]]showing',
                            '[[1.20 >= 1.2]]showing'
            ],
            # all these docs should result in ''
            '':         [   '[[1 >= 2]]hiding',
                            '[[0.9 >= 1]]hiding',
                            '[[2 >= 10]]hiding',
                            '[[1 >= 3]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(self.pm, sample_doc, sample_result)
    # ------------------------------------------------------- test --
    def test_pm_condition_lessthan_litnum_comparison(self):
        samples = {
            # these sources should result in 'showing'
            'showing':  [   '[[1 < 2]]showing',
                            '[[0.9 < 1]]showing',
                            '[[1 < 1.1]]showing',
                            '[[2 < 10]]showing',
            ],
            # all these docs should result in ''
            '':         [   '[[2 < 1]]hiding',
                            '[[1 < 0.9]]hiding',
                            '[[1 < 1]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(self.pm, sample_doc, sample_result)
    # ------------------------------------------------------- test --
    def test_pm_condition_lessthaneq_litnum_comparison(self):
        samples = {
            # these sources should result in 'showing'
            'showing':  [   '[[1 <= 2]]showing',
                            '[[0.9 <= 1]]showing',
                            '[[1 <= 1.1]]showing',
                            '[[2 <= 10]]showing',
                            '[[1 <= 1]]showing',
                            '[[1 <= 1.0]]showing',
                            '[[1.2 <= 1.2]]showing',
                            '[[1.20 <= 1.2]]showing'
            ],
            # all these docs should result in ''
            '':         [   '[[2 <= 1]]hiding',
                            '[[1 <= 0.9]]hiding',
                            '[[10 <= 2]]hiding',
                            '[[3 <= 1]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(self.pm, sample_doc, sample_result)
    # ------------------------------------------------------- test --
    def test_pm_condition_eq_and_neq_litnum_var_comparison(self):
        self.pm.data = { 'one': 1, 'two': 2, 'aten': 10 }
        samples = {
            # these sources should result in 'showing'
            'showing':  [   '[[one == 1]]showing',
                            '[[1.0 == one]]showing',
                            '[[two == 2]]showing',
                            '[[two == two]]showing',

                            '[[one != two]]showing',
                            '[[one != 2]]showing',
                            '[[1 != two]]showing',
            ],
            # all these docs should result in ''
            '':         [   '[[one == 3]]hiding',
                            '[[one == two]]hiding',

                            '[[one != 1]]hiding',
                            '[[1.0 != one]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(self.pm, sample_doc, sample_result)
    # ------------------------------------------------------- test --
    def test_pm_condition_gt_and_lt_litnum_var_comparison(self):
        self.pm.data = { 'one': 1, 'two': 2, 'aten': 10 }
        samples = {
            # these sources should result in 'showing'
            'showing':  [   '[[two > 1]]showing',
                            '[[2 > one]]showing',
                            '[[two > one]]showing',
                            '[[aten > one]]showing',

                            '[[1 < two]]showing',
                            '[[one < 2]]showing',
                            '[[one < two]]showing',
                            '[[one < aten]]showing',
            ],
            # all these docs should result in ''
            '':         [   '[[1 > two]]hiding',
                            '[[one > 2]]hiding',
                            '[[one > two]]hiding',
                            '[[one > aten]]hiding',

                            '[[two < 1]]hiding',
                            '[[2 < one]]hiding',
                            '[[two < one]]hiding',
                            '[[aten < one]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(self.pm, sample_doc, sample_result)
    # ------------------------------------------------------- test --
    def test_pm_condition_rangeequality_litnum_comparison(self):
        samples = {
            # these sources should result in 'showing'
            'showing':  [   '[[10 =2= 11]]showing',
                            '[[11 =2= 10]]showing',
                            '[[10 =5= 6]]showing',
                            '[[1.0 =0.1= 1.1]]showing',
                            '[[1 =0= 1]]showing',
            ],
            # all these docs should result in ''
            '':         [   '[[10 =3= 6]]hiding',
                            '[[6 =3= 10]]hiding',
                            '[[1 =0= 1.01]]hiding',
                            '[[1 =0.1= 1.2]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(self.pm, sample_doc, sample_result)
    # ------------------------------------------------------- test --
    def test_pm_condition_rangeleftrocket_litnum_comparison(self):
        samples = {
            # these sources should result in 'showing'
            'showing':  [   '[[10 <2= 11]]showing',
                            '[[6 <5= 10]]showing',
                            '[[1.0 <0.1= 1.1]]showing',
            ],
            # all these docs should result in ''
            '':         [   '[[10 <3= 6]]hiding',
                            '[[1 <0= 1]]hiding',
                            '[[10 <5= 6]]hiding',
                            '[[11 <2= 10]]hiding',
                            '[[6 <3= 10]]hiding',
                            '[[1 <0= 1.01]]hiding',
                            '[[1 <0.1= 1.2]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(self.pm, sample_doc, sample_result)
    # ------------------------------------------------------- test --
    def test_pm_condition_rangerightrocket_litnum_comparison(self):
        samples = {
            # these sources should result in 'showing'
            'showing':  [   '[[11 =2> 10]]showing',
                            '[[10 =5> 6]]showing',
                            '[[1.1 =0.1> 1.0]]showing',
            ],
            # all these docs should result in ''
            '':         [   '[[6 =3> 10]]hiding',
                            '[[1 =0> 1]]hiding',
                            '[[6 =5> 10]]hiding',
                            '[[10 =2> 11]]hiding',
                            '[[10 =3> 6]]hiding',
                            '[[1.01 =0> 1]]hiding',
                            '[[1.2 =0.1> 1]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(self.pm, sample_doc, sample_result)

    # ------------------------------------------------------- test --
    def test_pm_condition_rangemuchlessthan_litnum_comparison(self):
        samples = {
            # these sources should result in 'showing'
            'showing':  [   '[[6 <3< 10]]showing',
                            '[[1.0 <0.1< 1.101]]showing',
                            '[[1.0 <0.1< 1.2]]showing',
                            '[[0.99 <0< 1]]showing',
            ],
            # all these docs should result in ''
            '':         [   '[[1.01 <0.1< 1.1]]hiding',
                            '[[1 <0.1< 1.1]]hiding',
                            '[[6 <5< 10]]hiding',
                            '[[1 <0< 1]]hiding',
                            '[[1 <1< 0.99]]hiding',
                            '[[10 <2< 11]]hiding',
                            '[[1.01 <0< 1]]hiding',
                            '[[1.2 <0.1< 1]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(self.pm, sample_doc, sample_result)

    # ------------------------------------------------------- test --
    def test_pm_condition_rangemuchgreaterthan_litnum_comparison(self):
        samples = {
            # these sources should result in 'showing'
            'showing':  [   '[[10 >3> 6]]showing',
                            '[[1.101 >0.1> 1.0]]showing',
                            '[[1.2 >0.1> 1.0]]showing',
                            '[[1 >0> 0.99]]showing',
            ],
            # all these docs should result in ''
            '':         [   '[[1.1 >0.1> 1.01]]hiding',
                            '[[1.1 >0.1> 1]]hiding',
                            '[[10 >5> 6]]hiding',
                            '[[1 >0> 1]]hiding',
                            '[[0.99 >1> 1]]hiding',
                            '[[11 >2> 10]]hiding',
                            '[[1 >0> 1.01]]hiding',
                            '[[1 >0.1> 1.2]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(self.pm, sample_doc, sample_result)

# ===================================================================




