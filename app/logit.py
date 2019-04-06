import logging

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



def __set_log_level(logger, verbosity=DEFAULT_VERBOSITY) -> None:
    choices = ['ERROR', 'WARNING', 'INFO', 'DEBUG']
    log_level = choices[verbosity] if verbosity in range(
        0, len(choices)) else choices[DEFAULT_VERBOSITY]
    logger.setLevel(log_level)
    logger.debug('Set log level to %s', log_level)
