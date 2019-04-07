import React, { useState } from "react";
import { MaybeSystemCorpus } from "../types/optionals";
import { SystemCorpus } from "../apigen";
import {
  Dialog,
  DialogTitle,
  LinearProgress,
  DialogContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  DialogActions,
  Button,
  Theme
} from "@material-ui/core";
import nsps from "../helpers/i18n-namespaces";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";

type Props = {
  open: boolean;
  onClose: any;
  onCorpusCreated: any;
  systemCorpora: SystemCorpus[];
};

const useStyles = makeStyles(
  (theme: Theme) => ({
    errorMessageContainer: {
      width: "100%",
      marginTop: theme.spacing.unit * 2
    },
    errorMessage: {
      color: theme.palette.error.main,
      textAlign: "center"
    },
    formControl: {
      marginTop: theme.spacing.unit,
      width: "100%"
    }
  }),
  { withTheme: true }
);

const CreateCorpusDialog = ({
  open,
  onClose,
  onCorpusCreated,
  systemCorpora
}: Props) => {
  const [creating, setCreating] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [baseCorpus, setBaseCorpus] = useState<MaybeSystemCorpus>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const classes = useStyles();
  const [t] = useTranslation(nsps.modelManagement);

  function resetBaseCorpus(corpora: SystemCorpus[]) {
    if (corpora.length > 0) {
      setBaseCorpus(corpora[0]);
    }
  }

  async function createCorpus() {
    setErrorMessage("");
    if (
      (baseCorpus != undefined && baseCorpus!.name!.length == 0) ||
      name.length == 0
    ) {
      setErrorMessage(t("Please fill the required fields"));
      return;
    }
    setCreating(true);
    try {
      // TODO(jpo): Use new API
      // await ModelApi.create(modelName, baseModel);
      setName("");
      resetBaseCorpus(systemCorpora);
      onCorpusCreated();
    } catch (e) {
      setErrorMessage(e.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t("Create Corpus")}</DialogTitle>
      {creating && <LinearProgress />}
      <DialogContent>
        <form>
          <TextField
            required
            autoFocus
            margin="dense"
            id="name"
            label={t("Name")}
            fullWidth
            onChange={event => {
              let text = event.target.value;
              if (!text || !text.length) {
                return;
              }
              setName(text);
            }}
          />
          <FormControl className={classes.formControl}>
            <InputLabel required htmlFor="baseCorpus">
              {t("Base corpus")}
            </InputLabel>
            <Select
              fullWidth
              inputProps={{
                name: "baseCorpus",
                id: "baseCorpus"
              }}
              value={(baseCorpus && baseCorpus!.id) || 0}
              onChange={event => setBaseCorpus({ id: event.target.value })}
            >
              {systemCorpora.map(corpus => {
                return (
                  <MenuItem key={corpus.id} value={corpus.id}>
                    {corpus.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </form>
        {errorMessage && errorMessage.length > 0 && (
          <div className={classes.errorMessageContainer}>
            <Typography variant="subtitle2" className={classes.errorMessage}>
              {errorMessage}
            </Typography>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {t("Cancel")}
        </Button>
        <Button onClick={() => createCorpus()} color="primary">
          {t("Create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateCorpusDialog;
