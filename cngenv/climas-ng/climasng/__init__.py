
from pyramid.config import Configurator
from pyramid.httpexceptions import HTTPNotFound

from sqlalchemy import engine_from_config

from .models import (
    DBSession,
    Base,
    )


def notfound(request):
    # set the 404 page up here
    return HTTPNotFound()

def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession.configure(bind=engine)
    Base.metadata.bind = engine
    config = Configurator(settings=settings)
    config.include('pyramid_chameleon')

    config.add_static_view('static', 'static', cache_max_age=3600)

    config.add_route('home',   '/')
    config.add_route('map',    '/map/')
    config.add_route('form',   '/request/')
    config.add_route('report', '/report/')
    config.add_route('doc',    '/info/{doc_name}/')

    # add a 404 view that will retry with an appended slash first
    config.add_notfound_view(notfound, append_slash=True)

    config.scan()

    return config.make_wsgi_app()
