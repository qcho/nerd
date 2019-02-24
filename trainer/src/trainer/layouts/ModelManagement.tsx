import React, { useState, useEffect } from "react";
import NavigationBar from "../NavigationBar";
import {
  Theme,
  createStyles,
  withStyles,
  Grid,
  LinearProgress,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  ExpansionPanelActions
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ModelApi from "../api/ModelApi";
import { useTranslation } from "react-i18next";
import nsps from "../helpers/i18n-namespaces";

const styles = (theme: Theme) =>
  createStyles({
    grow: {
      flexGrow: 1
    },
    content: {
      padding: theme.spacing.unit * 2,
      display: "flex",
      flexDirection: "column"
    },
    modelList: {
      marginTop: theme.spacing.unit * 2
    },
    formControl: {
      marginTop: theme.spacing.unit,
      width: "100%"
    },
    errorMessageContainer: {
      width: "100%",
      marginTop: theme.spacing.unit * 2
    },
    errorMessage: {
      color: theme.palette.error.main,
      textAlign: "center"
    }
  });

const ModelManagement = ({ classes }: { classes: any }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [creatingModel, setCreatingModel] = useState<boolean>(false);
  const [models, setModels] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [modelName, setModelName] = useState<string>("");
  const [baseModel, setBaseModel] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [baseModels, setBaseModels] = useState<string[]>([]);
  const [t] = useTranslation(nsps.modelManagement);

  function resetBaseModel(models: string[]) {
    if (models.length > 0) {
      setBaseModel(models[0]);
    }
  }

  function reloadModels() {
    const fetchModels = async () => {
      setLoading(true);
      const [models, baseModels] = await Promise.all([
        ModelApi.list(),
        ModelApi.listBase()
      ]);
      setModels(models);
      setBaseModels(baseModels);
      resetBaseModel(baseModels);
    };
    fetchModels().finally(() => setLoading(false));
  }

  useEffect(() => {
    reloadModels();
  }, []);

  async function deleteModel(modelName: string) {
    try {
      await ModelApi.delete(modelName);
      reloadModels();
    } catch (error) {
      console.log("Couldn't delete model", [error]);
    }
  }

  function createModel() {
    setErrorMessage("");
    if (baseModel.length == 0 || modelName.length == 0) {
      setErrorMessage(t("Please fill the required fields"));
      return;
    }
    setCreatingModel(true);
    ModelApi.create(modelName, baseModel)
      .then(() => {
        setModelName("");
        resetBaseModel(baseModels);
        setDialogOpen(false);
        reloadModels();
      })
      .catch(reason => {
        setErrorMessage(reason.message);
      })
      .finally(() => {
        setCreatingModel(false);
      });
  }

  return (
    <div className={classes.grow}>
      <NavigationBar />
      {loading && <LinearProgress />}
      <Grid container className={classes.content}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setDialogOpen(true)}
        >
          Create
        </Button>
        <div className={classes.modelList}>
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
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
                    value={baseModel}
                    onChange={event => setBaseModel(event.target.value)}
                  >
                    {baseModels.map(model => {
                      return (
                        <MenuItem key={model} value={model}>
                          {model}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </form>
              {errorMessage && errorMessage.length > 0 && (
                <div className={classes.errorMessageContainer}>
                  <Typography
                    variant="subtitle2"
                    className={classes.errorMessage}
                  >
                    {errorMessage}
                  </Typography>
                </div>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)} color="secondary">
                {t("Cancel")}
              </Button>
              <Button onClick={() => createModel()} color="primary">
                {t("Create")}
              </Button>
            </DialogActions>
          </Dialog>
          {models.map(model => {
            return (
              <ExpansionPanel key={model}>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">{model}</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <Grid container direction="column">
                    <Grid item>
                      <Typography>Model info goes here</Typography>
                    </Grid>
                  </Grid>
                </ExpansionPanelDetails>
                <Divider/>
                <ExpansionPanelActions>
                  <Button color="secondary" onClick={() => deleteModel(model)}>
                    {t("Delete")}
                  </Button>
                </ExpansionPanelActions>
              </ExpansionPanel>
            );
          })}
        </div>
      </Grid>
    </div>
  );
};

export default withStyles(styles)(ModelManagement);
