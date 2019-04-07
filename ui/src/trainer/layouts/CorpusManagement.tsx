import React, { useState, useEffect } from "react";
import NavigationBar from "../NavigationBar";
import { CorporaApi, SystemCorpus, NERdCorpus } from "../apigen";
import {
  Theme,
  createStyles,
  withStyles,
  Grid,
  LinearProgress,
  Button,
  TableHead,
  TableRow,
  Checkbox,
  TableCell,
  Table,
  TableBody
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import nsps from "../helpers/i18n-namespaces";
import Http from "../helpers/http";
import CreateCorpusDialog from "../widgets/CreateCorpusDialog";
import { apiConfig } from "../helpers/api-config";
import moment from "moment";

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

type RichTableHeadProps = {
  onSelectAll: any;
  numSelected: number;
  rowCount: number;
  headers: any[];
};

const RichTableHead = ({
  onSelectAll,
  numSelected,
  rowCount,
  headers
}: RichTableHeadProps) => {
  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={numSelected === rowCount}
            onChange={onSelectAll}
          />
        </TableCell>
        {headers.map(col => (
          <TableCell key={col.id} align={col.numeric ? "right" : "left"}>
            {col.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

const CorpusManagement = ({ classes }: { classes: any }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [corpora, setCorpora] = useState<NERdCorpus[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [loadingErrorMessage, setLoadingErrorMessage] = useState<string>("");
  const [systemCorpora, setSystemCorpora] = useState<SystemCorpus[]>([]);
  const [t] = useTranslation(nsps.modelManagement);
  const api = new CorporaApi(apiConfig());

  const headers = [
    { id: "name", numeric: false, label: t("Name") },
    { id: "status", numeric: false, label: t("Status") },
    { id: "lastTrained", numeric: false, label: t("Last Trained") },
    { id: "pendingDocuments", numeric: true, label: t("Pending documents") }
  ];

  function reloadCorpora() {
    const fetchCorpora = async () => {
      setLoading(true);
      try {
        const [corpora, systemCorpora] = await Promise.all([
          api.listCorpora(),
          api.listSystemCorpora()
        ]);
        setCorpora(corpora.data);
        setSystemCorpora(systemCorpora.data);
      } catch (e) {
        const errorMessage = Http.handleRequestError(e, (status, data) => {
          return "Error loading corpora.";
        });
        setLoadingErrorMessage(errorMessage);
      }
    };
    fetchCorpora().finally(() => setLoading(false));
  }

  useEffect(() => {
    reloadCorpora();
  }, []);

  async function deleteCorpus(model: NERdCorpus) {
    try {
      // TODO(jpo): Use new API
      // await ModelApi.delete(modelName);
      reloadCorpora();
    } catch (error) {
      console.log("Couldn't delete model", [error]);
    }
  }

  async function onCorpusCreated() {
    setDialogOpen(false);
    reloadCorpora();
  }

  function handleRowClick(corpus: NERdCorpus) {}

  function handleSelectAll() {}

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

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
          <CreateCorpusDialog
            open={dialogOpen}
            systemCorpora={systemCorpora}
            onClose={() => setDialogOpen(false)}
            onCorpusCreated={onCorpusCreated}
          />
          <Table>
            <RichTableHead
              onSelectAll={handleSelectAll}
              headers={headers}
              numSelected={0} // TODO
              rowCount={10} // TODO
            />
            <TableBody>
              {corpora.map(corpus => {
                const rowSelected = isSelected(corpus.id!);
                return (
                  <TableRow
                    hover
                    onClick={event => handleRowClick(corpus)}
                    role="checkbox"
                    selected={rowSelected}
                    key={corpus.id}
                    tabIndex={-1}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox checked={rowSelected} />
                    </TableCell>
                    <TableCell component="th" scope="row" padding="none">
                      {corpus.name}
                    </TableCell>
                    <TableCell>{"creating"}</TableCell>
                    <TableCell>
                      {moment()
                        .subtract(Math.floor(Math.random() * 11), "days")
                        .fromNow()}
                    </TableCell>
                    <TableCell align="right">{Math.floor(Math.random() * 100)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Grid>
    </div>
  );
};

export default withStyles(styles)(CorpusManagement);