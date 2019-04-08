import React from "react";
import {
  TableHead,
  TableRow,
  TableCell,
  Checkbox,
  Typography,
  Tooltip,
  IconButton,
  Theme,
  Toolbar
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import DeleteIcon from "@material-ui/icons/Delete";
import classNames from "classnames";
import { lighten } from "@material-ui/core/styles/colorManipulator";
import { makeStyles } from "@material-ui/styles";

const useToolbarStyles = makeStyles(
  (theme: Theme) => ({
    root: {
      paddingRight: theme.spacing.unit
    },
    highlight:
      theme.palette.type === "light"
        ? {
            color: theme.palette.secondary.main,
            backgroundColor: lighten(theme.palette.secondary.light, 0.85)
          }
        : {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.secondary.dark
          },
    spacer: {
      flex: "1 1 100%"
    },
    actions: {
      color: theme.palette.text.secondary
    },
    title: {
      flex: "0 0 auto"
    }
  }),
  { withTheme: true }
);

var TableToolbar = ({
  numSelected,
  onDelete
}: {
  numSelected: number;
  onDelete: any;
}) => {
  const classes = useToolbarStyles();
  return (
    <Toolbar
      className={classNames(classes.root, {
        [classes.highlight]: numSelected > 0
      })}
    >
      <div className={classes.title}>
        {numSelected > 0 && (
          <Typography color="inherit" variant="subtitle1">
            {numSelected} selected
          </Typography>
        )}
      </div>
      <div className={classes.spacer} />
      <div className={classes.actions}>
        {numSelected > 0 && (
          <Tooltip title="Delete">
            <IconButton aria-label="Delete" onClick={onDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </Toolbar>
  );
};

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
          <TableCell key={col.id} align="left">
            {col.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

const EditableTable = () => {
  return (
    <div>
      <span>Hello</span>
    </div>
  );
};

export default EditableTable;
