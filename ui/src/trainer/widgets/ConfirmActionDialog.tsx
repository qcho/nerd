import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

const ConfirmActionDialog = ({
  title,
  content,
  onAccept,
  open,
  onClose,
  acceptText,
  rejectText,
}: {
  title: string;
  content: React.ReactChild;
  onAccept: () => void;
  open: boolean;
  onClose: () => void;
  acceptText?: string;
  rejectText?: string;
}) => {
  const [t] = useTranslation();
  const positiveText = acceptText || t('Ok');
  const negativeText = rejectText || t('Cancel');
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="secondary" onClick={onClose}>
          {negativeText}
        </Button>
        <Button color="primary" onClick={onAccept}>
          {positiveText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { ConfirmActionDialog };
