import React, { useState, useEffect } from "react";
import { MaybeSystemCorpus } from "../types/optionals";
import { SystemCorpus, CorporaApi } from "../apigen";
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
import { apiConfig } from "../helpers/api-config";

type CreateModelDialogProps = {
  open: boolean;
  onClose: any;
  onModelCreated: any;
  systemCorpora: SystemCorpus[]
};

const useStyles = makeStyles(
  (theme: Theme) => {
    return {
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
    };
  },
  { withTheme: true }
);

const CreateModelDialog = ({
  open,
  onClose,
  onModelCreated
}: CreateModelDialogProps) => {
  const [creatingModel, setCreatingModel] = useState<boolean>(false);
  const [modelName, setModelName] = useState<string>("");
  const [baseModel, setBaseModel] = useState<MaybeSystemCorpus>(null);
  const [baseModels, setBaseModels] = useState<SystemCorpus[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const api = new CorporaApi(apiConfig());
  const classes = useStyles();
  const [t] = useTranslation(nsps.modelManagement);

  function resetBaseModel(models: SystemCorpus[]) {
    if (models.length > 0) {
      setBaseModel(models[0]);
    }
  }

  async function createModel() {
    setErrorMessage("");
    if ((baseModel != undefined && baseModel!.name!.length == 0) || modelName.length == 0) {
      setErrorMessage(t("Please fill the required fields"));
      return;
    }
    setCreatingModel(true);
    try {
      // TODO(jpo): Use new API
      // await ModelApi.create(modelName, baseModel);
      setModelName("");
      resetBaseModel(baseModels);
      onModelCreated();
    } catch (e) {
      setErrorMessage(e.message);
    } finally {
      setCreatingModel(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>New Model</DialogTitle>
      {creatingModel && <LinearProgress />}
      <DialogContent>
        <form>
          <TextField
            required
            autoFocus
            margin="dense"
            id="name"
            label="Model name"
            fullWidth
            onChange={event => {
              let text = event.target.value;
              if (!text || !text.length) {
                return;
              }
              setModelName(text);
            }}
          />
          <FormControl className={classes.formControl}>
            <InputLabel required htmlFor="baseModel">
              Base model
            </InputLabel>
            <Select
              fullWidth
              inputProps={{
                name: "baseModel",
                id: "baseModel"
              }}
              value={(baseModel && baseModel!.id) || 0}
              onChange={event => setBaseModel({ name: event.target.value })}
            >
              {baseModels.map(model => {
                return (
                  <MenuItem key={model.id} value={model.name}>
                    {model}
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
        <Button onClick={() => createModel()} color="primary">
          {t("Create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateModelDialog;
