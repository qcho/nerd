import React, { useState, useEffect } from "react";
import NavigationBar from "../NavigationBar";
import { CorporaApi, SystemCorpus, NERdCorpus } from "../apigen";
import {
  Theme,
  Grid,
  LinearProgress,
  Button,
  TableRow,
  Checkbox,
  TableCell,
  Table,
  TableBody,
  TableFooter,
  TablePagination,
  Paper
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import nsps from "../helpers/i18n-namespaces";
import Http from "../helpers/http";
import CreateCorpusDialog from "../widgets/CreateCorpusDialog";
import { apiConfig } from "../helpers/api-config";
import moment from "moment";
import usePagination from "../hooks/usePagination";
import RichTableHead from "../widgets/RichTableHead";
import TableToolbar from "../widgets/TableToolbar";
import { makeStyles } from "@material-ui/styles";
import xorSelected from "../helpers/xorSelected";

const useStyles = makeStyles(
  (theme: Theme) => ({
    grow: {
      flexGrow: 1,
      height: "100vh"
    },
    content: {
      marginTop: theme.spacing.unit * 4,
      marginLeft: theme.spacing.unit * 10,
      marginRight: theme.spacing.unit * 10
    },
    tableContainer: {
      display: "flex",
      flexDirection: "column"
    },
    modelList: {
      marginTop: theme.spacing.unit * 2
    }
  }),
  { withTheme: true }
);

const CorpusManagement = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [corpora, setCorpora] = useState<NERdCorpus[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]);
  const classes = useStyles();
  const [loadingErrorMessage, setLoadingErrorMessage] = useState<string>("");
  const [systemCorpora, setSystemCorpora] = useState<SystemCorpus[]>([]);
  const [t] = useTranslation(nsps.modelManagement);
  const api = new CorporaApi(apiConfig());
  const {
    page,
    total,
    pageSize,
    setPage,
    setPageSize,
    setFromHeaders,
    shouldPaginate
  } = usePagination();

  const headers = [
    { id: "name", label: t("Name") },
    { id: "status", label: t("Status") },
    { id: "lastTrained", label: t("Last Trained") },
    { id: "pendingDocuments", label: t("Pending documents") }
  ];

  async function reloadCorpora(updatePagination: boolean = false) {
    setLoading(true);
    try {
      const [corpora, systemCorpora] = await Promise.all([
        api.listCorpora(page, pageSize),
        api.listSystemCorpora()
      ]);
      setCorpora(corpora.data);
      if (updatePagination) {
        setFromHeaders(corpora.headers);
      }
      setSystemCorpora(systemCorpora.data);
    } catch (e) {
      const errorMessage = Http.handleRequestError(e, (status, data) => {
        return "Error loading corpora.";
      });
      setLoadingErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function handleChangePage(event: any, page: number) {
    setPage(page + 1);
  }

  function handleChangeUsersPerPage(
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
    setPageSize(+event.target.value);
  }

  useEffect(() => {
    reloadCorpora(true);
  }, [page, pageSize]);

  async function onCorpusCreated() {
    setDialogOpen(false);
    reloadCorpora();
  }

  async function onDeleteClick() {
    const toDelete = corpora.filter(
      value => selected.indexOf(value.id!) !== -1
    );
    try {
      setLoading(true);
      await Promise.all(toDelete.map(corpus => api.removeCorpus(corpus.name!)));
    } catch (e) {
      // TODO: Handle errors
    } finally {
      setLoading(false);
      setSelected([]);
      reloadCorpora(true);
    }
  }

  function handleSelectAll(event: any) {
    if (event.target.checked) {
      setSelected(corpora.map(corpus => corpus.id!));
    } else {
      setSelected([]);
    }
  }

  const isSelected = (id: string) => selected.indexOf(id) !== -1;
  const handleRowClick = (corpus: NERdCorpus) =>
    setSelected(xorSelected(selected, corpus.id!));

  return (
    <div className={classes.grow}>
      <NavigationBar />
      {loading && <LinearProgress />}
      <Paper className={classes.content}>
        <Grid container className={classes.tableContainer}>
          <div className={classes.modelList}>
            <CreateCorpusDialog
              open={dialogOpen}
              systemCorpora={systemCorpora}
              onClose={() => setDialogOpen(false)}
              onCorpusCreated={onCorpusCreated}
            />

            <TableToolbar
              title={t("Corpus")}
              numSelected={selected.length}
              onDelete={onDeleteClick}
              onCreate={() => setDialogOpen(true)}
            />
            {!loading && (
              <Table>
                <RichTableHead
                  onSelectAll={handleSelectAll}
                  headers={headers}
                  numSelected={selected.length}
                  rowCount={corpora.length}
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
                        <TableCell>
                          {"creating" /* TODO: Un-hardcode this */}
                        </TableCell>
                        <TableCell>
                          {moment()
                            .subtract(1, "days") /* TODO: Un-hardcode this */
                            .fromNow()}
                        </TableCell>
                        <TableCell>
                          {Math.floor(
                            Math.random() * 100
                          ) /* TODO: Un-hardcode this */}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                {shouldPaginate && (
                  <TableFooter>
                    <TableRow>
                      <TablePagination
                        count={total}
                        page={page - 1}
                        rowsPerPageOptions={[10, 20, 50]}
                        rowsPerPage={pageSize}
                        onChangePage={handleChangePage}
                        onChangeRowsPerPage={handleChangeUsersPerPage}
                      />
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            )}
          </div>
        </Grid>
      </Paper>
    </div>
  );
};

export default CorpusManagement;
