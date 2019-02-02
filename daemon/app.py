from flask import Flask, request, jsonify, url_for
from atp import parse_text, train_model
from model_management import ModelManager
from nerd_type_aliases import NEREntity
from typing import List, Tuple
import json

app = Flask('NERd', static_folder=None)
mm = ModelManager('./models/') # TODO: Extract location to config file
# TODO: Do we want to preload models? Maybe we should specify this in a config file

@app.route("/")
def index():
    """Lists all of the available endpoints"""
    # TODO: Check if this is working correctly
    import sys
    current_module = sys.modules[__name__]
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append({
            'url': rule.rule,
            'doc': getattr(current_module, rule.endpoint).__doc__
        })
    return jsonify(routes)

@app.route('/base_models', methods=['GET'])
def base_model_list():
    """API endpoint to list available spacy base models"""
    return jsonify(mm.available_base_models())

@app.route('/models', methods=['GET', 'POST'], defaults={'model_name': None})
@app.route('/models/<string:model_name>', methods=['GET', 'DELETE'])
def model_management(model_name):
    """Manage everything related to model creation/deletion/querying.

    There are various scenarios handled here:
        1. Without providing a model name:
            1.1 GET a list of all available models
            1.2 POST to create new models
        2. Providing a model name:
            2.1 GET to return statistics for the given model
            2.2 DELETE to delete the model
    """
    if request.method == 'GET':
        if model_name is None:
            return jsonify(mm.available_models())
        else:
            pass # TODO: Get model information
        return

    if request.method == 'DELETE':
        if model_name is None:
            raise InvalidUsage("Missing model to delete.")
        else:
            pass # TODO: Delete model with specified name
        return

    if request.method == 'POST':
        if model_name is None:
            json_payload = request.get_json()
            if json_payload is None:
                pass # TODO: Payload is empty or is an invalid JSON
            base_model, model_name = _parse_model_creation_json(json_payload)
            result = mm.create_model(model_name, base_model) # TODO: return result
            return
        else:
            pass # TODO: Return error since we can't post with a model name
        return

@app.route('/models/<string:model_name>/ner', methods=['GET', 'POST'])
def named_entities_recognizer(model_name):
    """Everything related to NER goes here
    TODO: Correctly document this
    """
    if not model_name:
        return # TODO: Return error
    nerd_model = mm.load_model(model_name)
    if request.method == 'POST':
        if not request.is_json():
            pass # TODO: POST wasn't a JSON, should error out
        json_payload = request.get_json()
        if json_payload is None:
            pass # TODO: Payload is empty or is an invalid JSON
        train_result = train_model(nerd_model, _parse_training_json(json_payload))
        return jsonify(train_result) # TODO: Figure out what we need to return here

    if request.method == 'GET':
        result = parse_text(nerd_model, request.args['text'])
        return jsonify(result) # TODO: Figure out what we need to return here

@app.route('/models/<string:model_name>/entity_types', methods=['GET', 'POST'])
def ner_entities(model_name):
    """NER entity type management
    TODO: Document this
    """

    model = mm.load_model(model_name)

    if request.method == 'POST':
        if not request.is_json():
            pass # TODO: POST wasn't a JSON, should error out
        json_payload = request.get_json()
        if json_payload is None:
            pass # TODO: Payload is empty or an invalid JSON
        creation_result = create_entity_type(model, json_payload['name'], json_payload['code'])
        return jsonify(creation_result) # TODO: Figure out what we need to return here

    return jsonify(types_for_model(model))

def _parse_model_creation_json(json_payload) -> Tuple[str, str]:
    """ Decodes the JSON for creating new models

    Args:
        json_payload (json): JSON payload containing model creation information

    Returns:
        - base model name
        - new model name
    """

    if not 'base_model_name' in json_payload or not 'model_name' in json_payload:
        raise InvalidUsage("Invalid API", payload={"required": {"model_name": "str", "base_model_name": "str"}})

    return json_payload['base_model_name'], json_payload['model_name']

def _parse_training_json(json_payload) -> Tuple[str, List[NEREntity]]:
    """Decodes the training JSON payload

    Args:
        json_payload (json): JSON payload containing training information

    Returns:
        - the training text
        - a list of entities present in it
    """
    text = json_payload['text']
    ents = [(it['start'], it['end'], it['label']) for it in json_payload['ents']]
    return text, ents
