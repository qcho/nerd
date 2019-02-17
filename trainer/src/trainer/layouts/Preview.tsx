import React, { useState } from "react";
import {
  withStyles,
  Theme,
  createStyles,
  Grid,
  TextField,
  Button,
  Divider
} from "@material-ui/core";
import NerEditor from "../widgets/NerEditor";
import { dummyNodeProvider } from "../helpers/nodeproviders";
import { MaybeNerDocument, NerDocument } from "../types/NerDocument";

const styles = (theme: Theme) => createStyles({
    root: {
        flexGrow: 1
    }
});

type Props = {
  classes: any;
};

const PreviewLayout = (props: Props) => {
  let { classes } = props;
  const [text, setText] = useState<string>("");
  const [document, setDocument] = useState<MaybeNerDocument>(null);

  function onParseClick() {
    fetch(`http://localhost:5000/models/noticias/ner?text=${text}`)
      .then((response: Response) => {
        response.json().then((data: any) => {
          setDocument(data);
        });
      })
      .catch((err: any) => {
        console.log("Fuuu", err);
      });
  }

  function onDocumentUpdate(document: NerDocument) {
    setDocument(document);
  }

  return (
    <Grid
      container
      className={classes.root}
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
        {document == null ? (
          <div />
        ) : (
          <Grid container direction="row" spacing={24} justify="space-between">
            <Grid item xs={10}>
              <NerEditor
                document={document!}
                onUpdate={onDocumentUpdate}
                nodeProvider={dummyNodeProvider}
              />
            </Grid>
            <Grid
              item
              xs={2}
              style={{
                marginTop: 2,
                borderLeft: "1px solid rgba(0, 0, 0, 0.12)",
                padding: "0.5em"
              }}
            >
              <Button variant="contained" fullWidth color="primary">
                Save
              </Button>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default withStyles(styles)(PreviewLayout);
