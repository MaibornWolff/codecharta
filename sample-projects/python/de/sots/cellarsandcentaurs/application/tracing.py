import functools
import logging

logger = logging.getLogger(__name__)


def traced(function):
    @functools.wraps(function)
    def wrapper(*args, **kwargs):
        logger.debug("entering %s", function.__name__)
        return function(*args, **kwargs)

    return wrapper
