import os

import mongoengine as me

db = me.connect(os.environ.get('NERD_MONGO_DB', 'nerd'))
