import React from 'react';
import { makeStyles } from "@material-ui/styles";
import {
  Typography,
  Tooltip,
  IconButton,
  Theme,
  Toolbar
} from "@material-ui/core";
import { lighten } from "@material-ui/core/styles/colorManipulator";
import classNames from "classnames";
import DeleteIcon from "@material-ui/icons/Delete";

const useStyles = makeStyles(
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

const TableToolbar = ({
  numSelected,
  onDelete
}: {
  numSelected: number;
  onDelete: any;
}) => {
  const classes = useStyles();
  return (
    <Toolbar
      className={classNames(classes.root, {
        [classes.highlight]: numSelected > 0
      })}
    >
      <div className={classes.title}>
        {numSelected > 0 && (
          <Typography color="inherit" variant="subtitle1">
            {numSelected} selected {/* TODO: Translate this */}
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

export default TableToolbar;