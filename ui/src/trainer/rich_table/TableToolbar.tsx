import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Typography, Tooltip, IconButton, Theme, Toolbar, InputBase, Button, Grid } from '@material-ui/core';
import { lighten, fade } from '@material-ui/core/styles/colorManipulator';
import classNames from 'classnames';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/Search';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(
  (theme: Theme) => ({
    root: {
      paddingRight: theme.spacing.unit,
    },
    highlight:
      theme.palette.type === 'light'
        ? {
            color: theme.palette.secondary.main,
            backgroundColor: lighten(theme.palette.secondary.light, 0.85),
          }
        : {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.secondary.dark,
          },
    spacer: {
      flex: '1 1 100%',
    },
    actions: {
      color: theme.palette.text.secondary,
    },
    title: {
      flex: '0 0 auto',
    },
    search: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: fade(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25),
      },
      marginLeft: 0,
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing.unit,
        width: 'auto',
      },
    },
    searchIcon: {
      width: theme.spacing.unit * 9,
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputRoot: {
      color: 'inherit',
      width: '100%',
    },
    inputInput: {
      paddingTop: theme.spacing.unit,
      paddingRight: theme.spacing.unit,
      paddingBottom: theme.spacing.unit,
      paddingLeft: theme.spacing.unit * 10,
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        width: 120,
        '&:focus': {
          width: 200,
        },
      },
    },
    addButton: {
      marginLeft: 10,
      marginRight: 10,
    },
    addButtonText: {
      color: theme.palette.common.white,
    },
  }),
  { withTheme: true },
);

const TableToolbar = ({
  title,
  numSelected,
  onDelete,
  onSearch,
  onCreate,
}: {
  numSelected: number;
  onDelete?: (() => void) | false;
  title?: string;
  onSearch?: ((text: string) => void) | false;
  onCreate?: () => void;
}) => {
  const classes = useStyles();
  var searchTimer: NodeJS.Timeout | null = null;
  const [t] = useTranslation();

  const onSearchTextChange = (text: string) => {
    if (!onSearch) {
      return;
    }
    if (searchTimer != null) {
      clearTimeout(searchTimer);
    }
    searchTimer = setTimeout(() => onSearch(text), 350);
  };

  return (
    <Toolbar
      className={classNames(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      <div className={classes.title}>
        {numSelected > 0 ? (
          <Typography color="inherit" variant="subtitle1">
            {t('{{numSelected}} selected')}
          </Typography>
        ) : (
          title && (
            <Typography variant="h6" id="tableTitle">
              {title}
            </Typography>
          )
        )}
      </div>
      <div className={classes.spacer} />
      <div className={classes.actions}>
        {onDelete && numSelected > 0 ? (
          <Tooltip title={<Typography color="inherit">{'Delete'}</Typography>}>
            <IconButton aria-label="Delete" onClick={onDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
            {onSearch && (
              <div className={classes.search}>
                <div className={classes.searchIcon}>
                  <SearchIcon />
                </div>
                <InputBase
                  placeholder="Search…"
                  onChange={(event: any) => onSearchTextChange(event.target.value)}
                  classes={{
                    root: classes.inputRoot,
                    input: classes.inputInput,
                  }}
                />
              </div>
            )}
            {onCreate && (
              <Button variant="contained" color="primary" onClick={onCreate} className={classes.addButton}>
                <Typography className={classes.addButtonText}>{t('ADD')}</Typography>
              </Button>
            )}
          </div>
        )}
      </div>
    </Toolbar>
  );
};

export default TableToolbar;
