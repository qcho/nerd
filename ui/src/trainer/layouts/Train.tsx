import React, { useState, useEffect } from "react";
import {
  LinearProgress,
  Paper,
  Theme,
  Toolbar,
  Typography,
  AppBar,
  Button
} from "@material-ui/core";
import NavigationBar from "../NavigationBar";
import { makeStyles } from "@material-ui/styles";
import { UntokenizedEditor } from "../widgets/UntokenizedEditor";
import { NerDocument, MaybeNerDocument } from "../types/NerDocument";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(
  (theme: Theme) => ({
    container: {
      display: "flex",
      flex: 1,
      flexDirection: "column",
      alignItems: "center",
      height: "100vh"
    },
    paper: {
      display: "flex",
      flex: 1,
      flexDirection: "column",
      width: "60vw",
      marginTop: theme.spacing.unit * 8,
      marginBottom: theme.spacing.unit * 8,
      padding: theme.spacing.unit * 2
    },
    spacer: {
      flex: "1 1 100%"
    },
    actionBar: {
      marginBottom: theme.spacing.unit
    },
    actions: {
      display: "flex",
      flex: 1,
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-around"
    }
  }),
  { withTheme: true }
);

const mockDocument: NerDocument = {
  ents: [
    {
      end: 32,
      label: "LOC",
      start: 10
    },
    {
      end: 61,
      label: "PER",
      start: 47
    }
  ],
  sents: [
    {
      end: 78,
      start: 0
    }
  ],
  text:
    "Hoy en la Ciudad de Buenos Aires el Presidente Mauricio Macri dijo ser un gato",
  tokens: [
    {
      end: 3,
      id: 0,
      start: 0
    },
    {
      end: 6,
      id: 1,
      start: 4
    },
    {
      end: 9,
      id: 2,
      start: 7
    },
    {
      end: 16,
      id: 3,
      start: 10
    },
    {
      end: 19,
      id: 4,
      start: 17
    },
    {
      end: 26,
      id: 5,
      start: 20
    },
    {
      end: 32,
      id: 6,
      start: 27
    },
    {
      end: 35,
      id: 7,
      start: 33
    },
    {
      end: 46,
      id: 8,
      start: 36
    },
    {
      end: 55,
      id: 9,
      start: 47
    },
    {
      end: 61,
      id: 10,
      start: 56
    },
    {
      end: 66,
      id: 11,
      start: 62
    },
    {
      end: 70,
      id: 12,
      start: 67
    },
    {
      end: 73,
      id: 13,
      start: 71
    },
    {
      end: 78,
      id: 14,
      start: 74
    }
  ]
};

const entityTypes = [
  {
    code: "PER",
    name: "Person",
    color: "#903d3d"
  },
  {
    code: "LOC",
    name: "Location",
    color: "#b83ca6"
  },
  {
    code: "ORG",
    name: "Organization",
    color: "#e1d458"
  },
  {
    code: "MISC",
    name: "Miscellaneous",
    color: "#38dd9e"
  }
];

const Train = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [document, setDocument] = useState<MaybeNerDocument>(mockDocument);

  const classes = useStyles();
  const [t] = useTranslation();

  useEffect(() => {
    loadNewDocument();
  }, []);

  const loadNewDocument = async () => {
    setLoading(true);
    setDocument(null);
    // TODO: Load document
    setHasChanges(false);
    setLoading(false);
  };

  const onDocumentUpdate = (document: NerDocument) => {
    setHasChanges(true);
    // TODO:
  };

  const onReset = () => {
    setHasChanges(false);
    // TODO: Reset text
  };

  const onSkip = () => {
    // TODO: Load next text
  };

  const onSave = () => {
    // TODO: Save and load next
  };

  return (
    <div className={classes.container}>
      <NavigationBar />
      {loading && <LinearProgress />}
      {document != null && (
        <Paper className={classes.paper}>
          <AppBar
            color="default"
            position="relative"
            className={classes.actionBar}
          >
            <Toolbar>
              <div className={classes.actions}>
                <Button
                  color="secondary"
                  variant="contained"
                  disabled={!hasChanges}
                  onClick={onReset}
                >
                  <Typography
                    style={{ paddingLeft: 80, paddingRight: 80 }}
                    color="inherit"
                    variant="h6"
                    id="tableTitle"
                  >
                    {t("RESET")}
                  </Typography>
                </Button>
                <Button color="inherit" onClick={onSkip}>
                  <Typography
                    style={{ paddingLeft: 80, paddingRight: 80 }}
                    color="inherit"
                    variant="h6"
                    id="tableTitle"
                  >
                    {t("SKIP")}
                  </Typography>
                </Button>
                <Button
                  color="primary"
                  variant="contained"
                  disabled={!hasChanges}
                  onClick={onSave}
                >
                  <Typography
                    style={{ paddingLeft: 80, paddingRight: 80 }}
                    color="inherit"
                    variant="h6"
                    id="tableTitle"
                  >
                    {t("SAVE")}
                  </Typography>
                </Button>
              </div>
            </Toolbar>
          </AppBar>
          <UntokenizedEditor
            document={document}
            entityTypes={entityTypes}
            onUpdate={onDocumentUpdate}
          />
        </Paper>
      )}
    </div>
  );
};

export default Train;
