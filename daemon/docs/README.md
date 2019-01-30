# Daemon

The NERd is in charge of all NER related tasks.

## Parts

### Models

Since SpaCy can handle multiple models in parallel, each trained for a specific corpus and any given language, the daemon is capable of handling different models for any given task. The daemon has full CRUD capabilities.

### Querying

NERd exposes a list of all of the available models and for any given model it can return named entities for a given text.

### Updating

For any specific model, a user can request an update for given a text providing a corrected set of annotations.

### Re-training

Given that SpaCy has asked its users to re-train the whole model after an update, NERd is capable of re-training a model with all of the user corrected texts.

## API

### /

#### GET

Returns a list of all available endpoints

### /base_models

#### GET

Returns a list of all available base models, used to create new NER models.

### /models

#### GET

Returns a list of available NER models

#### POST

Create new models. Payload should be JSON with the following format:

```json
{
    base_model_name: string,
    model_name: string
}
```

### /models/\<string:model_name>

#### GET

Returns information about a given model

#### DELETE

Deletes a specific model

### /models/\<string:model_name>/ner

#### GET

Performs NER on the text provided by the GET variable named `text`:

```
/models/news/ner?text=The%20City%20of%20Buenos%20Aires%20was%20host%20to%20an%20important%20event
```

#### POST

Provide the specified model with training information. Payload should be a JSON with the same format as returned by the GET endpoint. Example:

```json
{
  "ents": [
    {
      "end": 32,
      "label": "LOC",
      "start": 10
    },
    {
      "end": 61,
      "label": "PER",
      "start": 47
    }
  ],
  "sents": [
    {
      "end": 82,
      "start": 0
    }
  ],
  "text": "Hoy en la Ciudad de Buenos Aires el Presidente Mauricio Macri dijo algo importante",
  "tokens": [
    {
      "dep": "advmod",
      "end": 3,
      "head": 11,
      "id": 0,
      "pos": "ADV",
      "start": 0,
      "tag": "ADV___"
    },
    {
      "dep": "fixed",
      "end": 6,
      "head": 0,
      "id": 1,
      "pos": "ADP",
      "start": 4,
      "tag": "ADP__AdpType=Prep"
    },
    {
      "dep": "det",
      "end": 9,
      "head": 3,
      "id": 2,
      "pos": "DET",
      "start": 7,
      "tag": "DET__Definite=Def|Gender=Fem|Number=Sing|PronType=Art"
    },
    {
      "dep": "nmod",
      "end": 16,
      "head": 0,
      "id": 3,
      "pos": "PROPN",
      "start": 10,
      "tag": "PROPN___"
    },
    {
      "dep": "case",
      "end": 19,
      "head": 5,
      "id": 4,
      "pos": "ADP",
      "start": 17,
      "tag": "ADP__AdpType=Prep"
    },
    {
      "dep": "flat",
      "end": 26,
      "head": 3,
      "id": 5,
      "pos": "PROPN",
      "start": 20,
      "tag": "PROPN___"
    },
    {
      "dep": "flat",
      "end": 32,
      "head": 5,
      "id": 6,
      "pos": "PROPN",
      "start": 27,
      "tag": "PROPN___"
    },
    {
      "dep": "det",
      "end": 35,
      "head": 8,
      "id": 7,
      "pos": "DET",
      "start": 33,
      "tag": "DET__Definite=Def|Gender=Masc|Number=Sing|PronType=Art"
    },
    {
      "dep": "nsubj",
      "end": 46,
      "head": 11,
      "id": 8,
      "pos": "PROPN",
      "start": 36,
      "tag": "PROPN___"
    },
    {
      "dep": "flat",
      "end": 55,
      "head": 8,
      "id": 9,
      "pos": "PROPN",
      "start": 47,
      "tag": "PROPN___"
    },
    {
      "dep": "flat",
      "end": 61,
      "head": 9,
      "id": 10,
      "pos": "PROPN",
      "start": 56,
      "tag": "PROPN___"
    },
    {
      "dep": "ROOT",
      "end": 66,
      "head": 11,
      "id": 11,
      "pos": "VERB",
      "start": 62,
      "tag": "VERB__Mood=Ind|Number=Sing|Person=3|Tense=Past|VerbForm=Fin"
    },
    {
      "dep": "obj",
      "end": 71,
      "head": 11,
      "id": 12,
      "pos": "ADV",
      "start": 67,
      "tag": "ADV___"
    },
    {
      "dep": "amod",
      "end": 82,
      "head": 12,
      "id": 13,
      "pos": "ADJ",
      "start": 72,
      "tag": "ADJ__Number=Sing"
    }
  ]
}
```
