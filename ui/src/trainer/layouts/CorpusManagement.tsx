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
import CreateModelDialog from "../widgets/CreateModelDialog";
import { apiConfig } from "../helpers/api-config";
import CorpusDetails from "../widgets/CorpusDetails";

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

type CorpusItemProps = {
  corpus: NERdCorpus;
  onDelete: any;
};

const CorpusItem = ({ corpus, onDelete }: CorpusItemProps) => {
  const [t] = useTranslation(nsps.modelManagement);
  return (
    <ExpansionPanel key={corpus.id} expanded>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">{corpus.name}</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Grid container direction="column">
          <Grid item>
            <CorpusDetails model={corpus} />
          </Grid>
        </Grid>
      </ExpansionPanelDetails>
      <Divider />
      <ExpansionPanelActions>
        <Button color="secondary" onClick={() => onDelete(corpus)}>
          {t("Delete")}
        </Button>
      </ExpansionPanelActions>
    </ExpansionPanel>
  );
};

const CorpusManagement = ({ classes }: { classes: any }) => {
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
              <CorpusItem
                key={model.id}
                corpus={model}
                onDelete={deleteModel}
              />
            );
          })}
        </div>
      </Grid>
    </div>
  );
};

export default withStyles(styles)(CorpusManagement);
