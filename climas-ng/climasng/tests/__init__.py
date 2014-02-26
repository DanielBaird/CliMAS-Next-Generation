import unittest
import transaction
import os
from paste.deploy.loadwsgi import appconfig
from pyramid.config import Configurator

from pyramid import testing
from climasng.views.oldspeciesview import OldSpeciesView
from climasng.models import *

class ClimasTestCase(unittest.TestCase):
    def setUp(self):
        self.config = testing.setUp()

        # get the db ready
        root = os.path.dirname(__file__)
        settings = appconfig('config:' + os.path.join(root, '..', '..', 'test.ini'))
        config = Configurator(settings=settings)
        config.include('pyramid_chameleon')
        engine = engine_from_config(settings, 'sqlalchemy.')
        DBSession.configure(bind=engine)
        Base.metadata.bind = engine
        Base.prepare(engine)

    def tearDown(self):
        DBSession.remove()
        testing.tearDown()

