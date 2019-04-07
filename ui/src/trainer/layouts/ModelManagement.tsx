import React, { useState, useEffect } from "react";
import NavigationBar from "../NavigationBar";
import { CorporaApi, SystemCorpus, NERdCorpus } from "../apigen";
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
  Divider,
  ExpansionPanelActions
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useTranslation } from "react-i18next";
import nsps from "../helpers/i18n-namespaces";
import Http from "../helpers/http";
import { MaybeSystemCorpus } from "../types/optionals";
import CreateModelDialog from "../widgets/CreateModelDialog";
import { apiConfig } from "../helpers/api-config";

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
    }
  });

const ModelDetails = ({ model }: { model: NERdCorpus }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [details, setDetails] = useState<any>({});
  const [t] = useTranslation(nsps.modelManagement);

  useEffect(() => {
    const fetchDetails = async () => {
      // TODO(jpo): We need this endpoint.
      // ModelApi.details(modelName)
      //   .then(data => {
      //     setDetails(data);
      //   })
      //   .catch(error => {
      //     console.log("Couldn't get model details", [error]);
      //   })
      //   .finally(() => setLoading(false));
    };
    setLoading(true);
    fetchDetails();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <Typography>{t("Queued: {{count}}", { count: details.queued })}</Typography>
      <Typography>{t("Trained: {{count}}", { count: details.trained })}</Typography>
    </div>
  );
};

const ModelManagement = ({ classes }: { classes: any }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [models, setModels] = useState<NERdCorpus[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [loadingErrorMessage, setLoadingErrorMessage] = useState<string>("");
  const [baseModels, setBaseModels] = useState<SystemCorpus[]>([]);
  const [t] = useTranslation(nsps.modelManagement);
  const api = new CorporaApi(apiConfig());

  function reloadModels() {
    const fetchModels = async () => {
      setLoading(true);
      try {
        const [models, baseModels] = await Promise.all([
          api.listCorpora(),
          api.listSystemCorpora()
        ]);
        setModels(models.data);
        setBaseModels(baseModels.data);
      } catch (e) {
        const errorMessage = Http.handleRequestError(e, (status, data) => {
          return "Error loading models.";
        });
        setLoadingErrorMessage(errorMessage);
      }
    };
    fetchModels().finally(() => setLoading(false));
  }

  useEffect(() => {
    reloadModels();
  }, []);

  async function deleteModel(model: NERdCorpus) {
    try {
      // TODO(jpo): Use new API
      // await ModelApi.delete(modelName);
      reloadModels();
    } catch (error) {
      console.log("Couldn't delete model", [error]);
    }
  }

  async function onModelCreated() {
    setDialogOpen(false);
    reloadModels();
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
          <CreateModelDialog
            open={dialogOpen}
            systemCorpora={baseModels}
            onClose={() => setDialogOpen(false)}
            onModelCreated={onModelCreated}
          />
          {models.map(model => {
            return (
              <ExpansionPanel key={model.id}>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">{model.name}</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <Grid container direction="column">
                    <Grid item>
                      <ModelDetails model={model} />
                    </Grid>
                  </Grid>
                </ExpansionPanelDetails>
                <Divider />
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
