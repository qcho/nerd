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

For API usage, access the root path once the daemon is running.
