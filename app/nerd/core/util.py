import logging
import random
import time
from contextlib import contextmanager
from functools import wraps
from itertools import islice
from typing import Generator

DEFAULT_VERBOSITY = 0


def get_logger(name: str) -> logging.Logger:
    logger = logging.Logger(name or __name__)
    # create console handler and set level to debug
    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG)
    # create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    # add formatter to ch
    ch.setFormatter(formatter)
    # add ch to logger
    logger.addHandler(ch)
    return logger


logger = get_logger(__name__)


@contextmanager
def log_perf(prefix: str):
    logger.debug(f'{prefix} STARTED')
    start = time.perf_counter()
    try:
        yield
    finally:
        logger.debug(f'{prefix} FINISHED in {time.perf_counter() - start:10.4f}s')


def add_method(cls):
    def decorator(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            return func(*args, **kwargs)

        setattr(cls, func.__name__, wrapper)
        # Note we are not binding func, but wrapper which accepts self but does exactly the same as func
        return func  # returning func means func can still be used normally

    return decorator


def __set_log_level(logger, verbosity=DEFAULT_VERBOSITY) -> None:
    choices = ['ERROR', 'WARNING', 'INFO', 'DEBUG']
    log_level = choices[verbosity] if verbosity in range(
        0, len(choices)) else choices[DEFAULT_VERBOSITY]
    logger.setLevel(log_level)
    logger.debug('Set log level to %s', log_level)


def shuffle(generator: Generator, buffer_size: int):
    while True:
        buffer = list(islice(generator, buffer_size))
        if len(buffer) == 0:
            break
        random.shuffle(buffer)
        for item in buffer:
            yield item
