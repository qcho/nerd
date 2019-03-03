from flask_restplus import reqparse

ner_request_fields = reqparse.RequestParser()
ner_request_fields.add_argument('text', type=str, required=True, help="Text to process")
