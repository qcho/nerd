import React, { Component } from "react";
import { NerDocument } from "../types/NerDocument";
import { Entity, MaybeEntity } from "../types/Entity";
import { Popover, Theme, withStyles, Snackbar } from "@material-ui/core";
import EntityDialog from "./EntityDialog";
import EntityTypeApi from "../api/EntityTypeApi";

type Props = {
  classes: any;
  document: NerDocument;
  onUpdate: any;
  nodeProvider: any;
};

type MaybeCurrentEntity = {
  entity: Entity;
  element: any;
} | null;

type State = {
  currentEntity?: MaybeCurrentEntity;
  error?: string | null;
};

const styles = (theme: Theme) => ({
  paper: {
    margin: theme.spacing.unit * 2
  }
});

class UntokenizedEditor extends Component<Props, State> {
  entityTypeApi: EntityTypeApi;

  constructor(props: Props) {
    super(props);
    this.state = {};
    this.entityTypeApi = new EntityTypeApi();
  }

  render() {
    let { classes } = this.props;
    let popoverOpen = this.state.currentEntity != null;
    let anchorElement = popoverOpen ? this.state.currentEntity!.element : null;
    let currentEntity = this.state.currentEntity;
    let popoverContents = popoverOpen ? (
      <EntityDialog
        value={currentEntity!.entity.label}
        onTypeChange={(event: any) =>
          this._onEntityTypeChange(event.target.value)
        }
        options={this.entityTypeApi.availableTypes()}
      />
    ) : (
      <div />
    );
    return (
      <div>
        <div
          style={{ verticalAlign: "top" }}
          onMouseUp={() => this._onMouseUp()}
        >
          {this._mapTextToNodes()}
        </div>
        <Popover
          id="entity-popover"
          open={popoverOpen}
          onClose={() => this._onPopoverClose()}
          anchorEl={anchorElement}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center"
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center"
          }}
        >
          {popoverContents}
        </Popover>
        <Snackbar
          anchorOrigin={{
            vertical: "top",
            horizontal: "left"
          }}
          open={this.state.error != null}
          autoHideDuration={1000}
          onClose={this._snackbarClose.bind(this)}
          message={<span>{this.state.error}</span>}
        />
      </div>
    );
  }

  _snackbarClose() {
    this.setState({
      error: null
    });
  }

  _onMouseUp() {
    var selection = window.getSelection();
    let text = selection.toString();
    if (!text || !text.length) {
      return;
    }

    let document: NerDocument = this.props.document!;
    let startPosition = document.text.indexOf(text);
    let endPosition = startPosition + text.length;

    function contains(entity: Entity, index: number) {
      return index >= entity.start && index <= entity.end;
    }

    if (document.ents.length > 0) {
      let isContainedInEntity = document.ents
        .map(
          entity =>
            contains(entity, startPosition) || contains(entity, endPosition)
        )
        .reduce((previous: boolean, current: boolean) => previous || current);

      let containsAnyEntity = false;

      document.ents.forEach((entity: Entity) => {
        containsAnyEntity =
          containsAnyEntity ||
          (startPosition <= entity.start && endPosition >= entity.end);
      });

      if (containsAnyEntity || isContainedInEntity) {
        window.getSelection().removeAllRanges();
        this.setState({
          error: "Selection can't contain other entities"
        });
        return;
      }
    }

    document.ents.push({
      start: startPosition,
      end: endPosition,
      label: "MISC"
    });
    window.getSelection().removeAllRanges();
    this.props.onUpdate(document);
  }

  _onEntityTypeChange(value: string) {
    this.state.currentEntity!.entity.label = value;
    this.setState({
      currentEntity: null
    });
  }

  _deleteEntity(entity: Entity) {
    let index = this._entities().findIndex(
      search => search.start == entity.start && search.end == entity.end
    );
    if (index < 0) {
      return; // Shouldn't happen
    }
    this._entities().splice(index, 1);
    this.setState({
      currentEntity: null
    });
  }

  _onEntityClick(element: any, entity: Entity) {
    this.setState({
      currentEntity: {
        element: element,
        entity: entity
      }
    });
  }

  _onPopoverClose() {
    this.setState({
      currentEntity: null
    });
  }

  _entities() {
    return this.props.document.ents;
  }

  _entityFor(index: number): MaybeEntity {
    let entities = this._entities();
    for (let idx = 0; idx < entities.length; ++idx) {
      let entity = entities[idx];
      if (entity.start <= index && entity.end >= index) {
        return entity;
      }
    }
    return null;
  }

  _mapTextToNodes() {

    return this.props.nodeProvider(this.props.document,
      this.entityTypeApi.availableTypes(),
      this._onEntityClick.bind(this),
      this._deleteEntity.bind(this))
  }
}

export default withStyles(styles)(UntokenizedEditor);
