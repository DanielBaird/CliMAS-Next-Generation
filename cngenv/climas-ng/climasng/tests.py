import unittest
import transaction

from pyramid import testing

from .models import DBSession

from parsing.prosemaker import ProseMaker

# ===================================================================
class TestMyViewSuccessCondition(unittest.TestCase):
    # ---------------------------------------------------------------
    def setUp(self):
        self.config = testing.setUp()
        from sqlalchemy import create_engine
        engine = create_engine('sqlite://')
        from .models import (
            Base,
            MyModel,
            )
        DBSession.configure(bind=engine)
        Base.metadata.create_all(engine)
        with transaction.manager:
            model = MyModel(name='one', value=55)
            DBSession.add(model)
    # ---------------------------------------------------------------
    def tearDown(self):
        DBSession.remove()
        testing.tearDown()
    # ---------------------------------------------------------------
    def test_passing_view(self):
        from .views import my_view
        request = testing.DummyRequest()
        info = my_view(request)
        self.assertEqual(info['one'].name, 'one')
        self.assertEqual(info['project'], 'climas-ng')
# ===================================================================
class TestMyViewFailureCondition(unittest.TestCase):
    # ---------------------------------------------------------------
    def setUp(self):
        self.config = testing.setUp()
        from sqlalchemy import create_engine
        engine = create_engine('sqlite://')
        from .models import (
            Base,
            MyModel,
            )
        DBSession.configure(bind=engine)
    # ---------------------------------------------------------------
    def tearDown(self):
        DBSession.remove()
        testing.tearDown()
    # ---------------------------------------------------------------
    def test_failing_view(self):
        from .views import my_view
        request = testing.DummyRequest()
        info = my_view(request)
        self.assertEqual(info.status_int, 500)
# ===================================================================
class TestProseMaker(unittest.TestCase):
    # ---------------------------------------------------------------
    def setUp(self):
        self.config = testing.setUp()
        self.pm = ProseMaker()
    # ---------------------------------------------------------------
    def tearDown(self):
        testing.tearDown()
    # ---------------------------------------------------------------
    def test_pm_properties(self):
        some_data = {'a': 'Aaa', 'b': 'Bbb'}
        a_string = 'test source string'

        self.pm.data = some_data
        self.pm.source = a_string

        self.assertEqual(self.pm.data, some_data)
        self.assertEqual(self.pm.source, a_string)
        self.assertEqual(self.pm.doc, a_string)
    # ---------------------------------------------------------------
    def test_pm_condition_always(self):
        samples = {
            'showing': [
                # all these docs should result in 'showing'
                'showing',
                '[[always]]showing',
                '[[ always ]]showing',
                '[[  always]]showing',
                '[[AlWaYs]]showing',
            ],
            '': [
                # all these docs should result in ''
                '[[always]]',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.pm.source = sample_doc
                self.assertEqual(self.pm.doc, sample_result)
    # ---------------------------------------------------------------
    def test_pm_condition_never(self):
        samples = {
            '': [
                # all these docs should result in ''
                '[[never]]',
                '[[never]] ',
                '[[never]]hiding',
                '[[ never]]hiding',
                '[[ never ]]hiding',
                '[[  never]]hiding',
                '[[  NeVeR]]hiding'
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.pm.source = sample_doc
                self.assertEqual(self.pm.doc, sample_result)
    # ---------------------------------------------------------------
    def test_pm_condition_always_and_never(self):
        samples = {
            'showing': [
                # all these docs should result in 'showing'
                'showing[[never]]hiding',
                '[[never]]hiding[[always]]showing[[never]]hiding',
                '[[never]][[always]]showing'
            ],
            '': [
                # all these docs should result in ''
                '[[never]]hiding[[always]]',
                '[[always]][[never]]hiding'
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.pm.source = sample_doc
                self.assertEqual(self.pm.doc, sample_result)
    # ---------------------------------------------------------------
    def test_pm_condition_equality_litnum_comparison(self):
        samples = {
            'showing': [
                # all these docs should result in 'showing'
                '[[1 == 1]]showing',
                '[[1.0 == 1]]showing',
                '[[1.2 == 1.2]]showing',
                '[[1.20 == 1.2]]showing',
                '[[3 == 3]]showing',
                '[[  3==3]]showing',
            ],
            '': [
                # all these docs should result in ''
                '[[1 == 3]]hiding'
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.pm.source = sample_doc
                self.assertEqual(self.pm.doc, sample_result)
    # ---------------------------------------------------------------
    def test_pm_condition_simplecmp_litnum_var_comparison(self):
        self.pm.data = { 'one': 1, 'two': 2 }
        samples = {
            'showing': [
                # all these docs should result in 'showing'
                '[[one == 1]]showing',
                '[[1.0 == one]]showing',
                '[[two == 2]]showing',
                '[[two == two]]showing',
                '[[one != two]]showing',
                '[[one != 2]]showing',
                '[[1 != two]]showing',
            ],
            '': [
                # all these docs should result in ''
                '[[one == 3]]hiding',
                '[[one == two]]hiding'
                '[[one != 1]]hiding',
                '[[1.0 != one]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.pm.source = sample_doc
                self.assertEqual(self.pm.doc, sample_result)
    # ---------------------------------------------------------------
    def test_pm_condition_inequality_litnum_comparison(self):
        samples = {
            'showing': [
                # all these docs should result in 'showing'
                '[[1 != 3]]showing'
            ],
            '': [
                # all these docs should result in ''
                '[[1 != 1]]hiding',
                '[[1.0 != 1]]hiding',
                '[[1.2 != 1.2]]hiding',
                '[[1.20 != 1.2]]hiding',
                '[[3 != 3]]hiding',
                '[[  3!=3]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.pm.source = sample_doc
                self.assertEqual(self.pm.doc, sample_result)
    # ---------------------------------------------------------------
    def test_pm_condition_rangeequality_litnum_comparison(self):
        samples = {
            'showing': [
                # all these docs should result in 'showing'
                '[[10 =2= 11]]showing',
               '[[11 =2= 10]]showing',
               '[[10 =5= 6]]showing',
               '[[1.0 =0.1= 1.1]]showing'
            ],
            '': [
                # all these docs should result in ''
                '[[10 =3= 6]]hiding',
                '[[6 =3= 10]]hiding',
                '[[1 =0.1= 1.2]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.pm.source = sample_doc
                self.assertEqual(self.pm.doc, sample_result)
    # ---------------------------------------------------------------

# ===================================================================




