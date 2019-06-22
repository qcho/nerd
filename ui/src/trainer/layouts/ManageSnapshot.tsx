import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Title } from '../widgets/Title';
import { MaterialPicker } from 'react-color';
import {
  Paper,
  Chip,
  Button,
  Typography,
  DialogContent,
  Dialog,
  DialogTitle,
  DialogActions,
  Grid,
} from '@material-ui/core';
import useCurrentSnapshot from '../hooks/useCurrentSnapshot';
import { SnapshotInfo, Type } from '../apigen';
import { MaybeType } from '../types/optionals';

const TypeAvatar = ({ code, color }: { code: string; color: string }) => {
  return (
    <div
      style={{
        height: '100%',
        // borderRight: `1px solid ${color}`,
        borderTopRightRadius: '16px',
        borderBottomRightRadius: '16px',
        borderTopLeftRadius: '16px',
        borderBottomLeftRadius: '16px',
        display: 'flex',
        // backgroundColor: grey[400],
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          color: color,
          fontWeight: 'bold',
          paddingLeft: '0.7em',
          textAlign: 'center',
          width: '100%',
        }}
      >
        {code}
      </span>
    </div>
  );
};

const TypeUpsertDialog = ({
  startingType,
  startingTypeCode,
  open,
  onSave,
  onClose,
}: {
  startingType: Type;
  startingTypeCode: string;
  open: boolean;
  onSave: (type: Type, code: string) => void;
  onClose: () => void;
}) => {
  const [t] = useTranslation();
  const [type, setType] = useState<Type>(startingType);
  const [typeCode, setTypeCode] = useState<string>(startingTypeCode);
  return (
    <Dialog open={open} onClose={onClose} style={{ height: '1000px' }}>
      <DialogTitle>{(startingTypeCode != '' && t('Update type')) || t('Create type')}</DialogTitle>
      <DialogContent>
        <Grid container>
          <Grid item>
            <MaterialPicker />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('Close')}</Button>
        <Button onClick={() => onSave(type, typeCode)} color="primary">
          {t('Save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ManageSnapshot = () => {
  const [t] = useTranslation();
  const { currentSnapshot, loading, error } = useCurrentSnapshot();
  const [currentType, setCurrentType] = useState<MaybeType>(null);
  const [currentTypeCode, setCurrentTypeCode] = useState<string>('');

  function mapSnapshotTypes(
    snapshotInfo: SnapshotInfo,
    onDelete: (type: Type, code: string) => void,
    onClick: (type: Type, code: string) => void,
  ) {
    const types = snapshotInfo.snapshot.types || {};
    return Object.keys(types).map(code => {
      const type = types[code];
      return (
        <Chip
          onClick={() => onClick(type, code)}
          style={{ marginRight: '1em', marginTop: '0.3em', marginBottom: '0.2em' }}
          key={code}
          avatar={<TypeAvatar code={code} color={type.color} />}
          label={<Typography>{type.label}</Typography>}
          variant="outlined"
          onDelete={() => onDelete(type, code)}
        />
      );
    });
  }

  function onTypeDelete(type: Type, code: string) {
    return;
  }

  function onTypeClick(type: Type, code: string) {
    setCurrentType(type);
    setCurrentTypeCode(code);
  }

  function onTypeSave(type: Type, code: string) {}

  function onTypeCreateClick() {
    setCurrentType({ label: '', color: '' });
    setCurrentTypeCode('');
  }

  return (
    <div>
      <Grid container spacing={8}>
        <Grid item>
          <Title>{t('Types')}</Title>
        </Grid>
        <Grid item>
          <Button size="small" color="primary" style={{ paddingTop: '5px' }} onClick={onTypeCreateClick}>
            {t('New')}
          </Button>
        </Grid>
      </Grid>
      {!loading && !error && currentSnapshot && (
        <Paper style={{ padding: '1em' }}>{mapSnapshotTypes(currentSnapshot, onTypeDelete, onTypeClick)}</Paper>
      )}
      {currentType && (
        <TypeUpsertDialog
          open={currentType != null}
          startingType={currentType}
          startingTypeCode={currentTypeCode}
          onSave={onTypeSave}
          onClose={() => setCurrentType(null)}
        />
      )}
    </div>
  );
};

export { ManageSnapshot };
