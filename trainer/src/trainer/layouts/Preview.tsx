import React, { useState, useEffect } from "react";
import {
  withStyles,
  Theme,
  createStyles,
  Grid,
  TextField,
  Button,
  Divider,
  Typography
} from "@material-ui/core";
import NerEditor from "../widgets/NerEditor";
import { dummyNodeProvider } from "../helpers/nodeproviders";
import { MaybeNerDocument, NerDocument } from "../types/NerDocument";
import NavigationBar from "../NavigationBar";
import classNames from "classnames";
import useAuthentication from "../hooks/useAuthentication";
import EntityTypeApi from "../api/EntityTypeApi";
import { EntityType } from "../types/EntityType";
import NerApi from "../api/NerApi";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
    },
    content: {
      padding: theme.spacing.unit * 3
    }
  });

type Props = {
  classes: any;
};

const PreviewLayout = (props: Props) => {
  let { classes } = props;
  const [text, setText] = useState<string>("");
  const [nerModel, setNerModel] = useState<string>("noticias");
  const [entityTypes, setEntityTypes] = useState<EntityType[]>([]);
  const [document, setDocument] = useState<MaybeNerDocument>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { loggedIn } = useAuthentication();
  const nerApi = new NerApi(nerModel);

  async function onParseClick() {
    setLoading(true);
    try {
      const doc = await nerApi.parseText(text);
      setDocument(doc as NerDocument);
    } catch (e) {
      console.log("Fuuu", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchTypes = async () => {
      const entityTypeApi = new EntityTypeApi();
      const availableTypes = await entityTypeApi.availableTypes(nerModel);
      setEntityTypes(availableTypes);
    };
    fetchTypes();
  }, [nerModel]);

  function onDocumentUpdate(document: NerDocument) {
    setDocument(prevState => {
      return { ...prevState, ...document };
    });
  }

  function onSaveClick() {
    // TODO: save document
  }

  return (
    <div>
      <NavigationBar />
      <Grid
        container
        className={classNames(classes.content, classes.root)}
        direction="column"
        justify="space-around"
      >
        <Grid item>
          <Grid container direction="row" spacing={24} alignItems="center">
            <Grid item xs={10}>
              <TextField
                label="Text"
                type="search"
                margin="normal"
                variant="outlined"
                multiline
                fullWidth
                value={text}
                onChange={event => {
                  let text = event.target.value;
                  if (!text || !text.length) {
                    return;
                  }
                  setText(text);
                }}
              />
            </Grid>
            <Grid item xs={2}>
              <Button fullWidth color="primary" onClick={onParseClick}>
                Parse
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Divider style={{ marginTop: 10, marginBottom: 10 }} />
        <Grid item>
          {document == null || loading ? (
            loading ? (
              // TODO: Style the loading indicator
              <Typography align="center">Loading...</Typography>
            ) : null
          ) : (
            <Grid
              container
              direction="row"
              spacing={24}
              justify="space-between"
            >
              <Grid item xs={10}>
                <NerEditor
                  document={document!}
                  onUpdate={onDocumentUpdate}
                  nodeProvider={dummyNodeProvider}
                  entityTypes={entityTypes}
                />
              </Grid>
              <div>
                {loggedIn ? (
                  <Grid
                    item
                    xs={2}
                    style={{
                      marginTop: 2,
                      borderLeft: "1px solid rgba(0, 0, 0, 0.12)",
                      padding: "0.5em"
                    }}
                  >
                    <Button
                      variant="contained"
                      fullWidth
                      color="primary"
                      onClick={onSaveClick}
                    >
                      Save
                    </Button>
                  </Grid>
                ) : null}
              </div>
            </Grid>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default withStyles(styles)(PreviewLayout);
