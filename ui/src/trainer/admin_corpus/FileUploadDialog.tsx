import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import { Theme, createStyles, WithStyles, withStyles, Typography, IconButton, Button } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { DropzoneArea } from 'material-ui-dropzone';
import { makeStyles } from '@material-ui/styles';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      padding: theme.spacing.unit * 2,
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing.unit,
      top: theme.spacing.unit,
      color: theme.palette.grey[500],
    },
    dialogContent: {
      [theme.breakpoints.down('md')]: {
        width: '90vw',
      },
      [theme.breakpoints.up('md')]: {
        widht: '600px',
      },
    },
  });

export interface DialogTitleProps extends WithStyles<typeof styles> {
  id: string;
  children: React.ReactNode;
  onClose: () => void;
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
  const { children, classes, onClose } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="Close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogActions = withStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing.unit,
  },
}))(MuiDialogActions);

interface Props {
  open: boolean;
  onSave: (files: any[]) => void;
  onClose: () => void;
}

const useStyles = makeStyles(
  (theme: Theme) => ({
    dropzoneText: {
      fontFamily: 'Roboto',
    },
  }),
  { withTheme: true },
);

const FileUploadDialog = ({ open, onSave, onClose }: Props) => {
  const [t] = useTranslation();
  const [files, setFiles] = useState<any[]>([]);
  const classes = useStyles();

  function onDropzoneChange(files: any[]) {
    setFiles(files);
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle id="file-upload-dialog" onClose={onClose}>
        {t('Upload')}
      </DialogTitle>
      <MuiDialogContent style={{ width: '600px' }}>
        <DropzoneArea
          acceptedFiles={['text/plain']}
          dropzoneText={t('Select a .txt file')}
          filesLimit={20}
          onChange={onDropzoneChange}
          dropzoneClass={classes.dropzoneText}
        />
      </MuiDialogContent>
      <DialogActions>
        <Button color="primary" onClick={() => onSave(files)}>
          {t('Upload')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { FileUploadDialog };
