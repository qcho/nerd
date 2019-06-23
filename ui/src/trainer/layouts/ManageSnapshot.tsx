import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Title } from '../widgets/Title';
import { Paper, Chip, Button, Typography, Grid, Tooltip } from '@material-ui/core';
import useCurrentSnapshot from '../hooks/useCurrentSnapshot';
import { SnapshotInfo, Type } from '../apigen';
import { MaybeType } from '../types/optionals';
import { TypeAvatar } from '../widgets/TypeAvatar';
import { TypeUpsertDialog } from '../widgets/TypeUpsertDialog';
import { ConfirmActionDialog } from '../widgets/ConfirmActionDialog';

const ManageSnapshot = () => {
  const [t] = useTranslation();
  const { currentSnapshot, loading, error, createSnapshot, updateCurrentSnapshot } = useCurrentSnapshot();
  const [currentType, setCurrentType] = useState<MaybeType>(null);
  const [currentTypeCode, setCurrentTypeCode] = useState<string>('');
  const [codeToDelete, setCodeToDelete] = useState<string>('');
  const [hasChanges, setHasChanges] = useState<boolean>(false);

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

  function onTypeDeleteClick(type: Type, code: string) {
    setCodeToDelete(code);
    return;
  }

  async function doDelete(code: string) {
    if (!currentSnapshot) return;
    setCodeToDelete('');
    try {
      const types = currentSnapshot.snapshot.types || {};
      delete types[code];
      currentSnapshot.snapshot.types = types;
      updateCurrentSnapshot(currentSnapshot.snapshot);
      setHasChanges(true);
    } catch (e) {
      // TODO: Set error
    }
  }

  function onResetClick() {
    location.reload();
  }

  function onTypeClick(type: Type, code: string) {
    setCurrentType(type);
    setCurrentTypeCode(code);
  }

  async function onTypeSave(code: string, label: string, color: string, isCreating: boolean) {
    setCurrentType(null);
    setCurrentTypeCode('');
    if (!currentSnapshot) return;
    const upperCaseCode = code.toUpperCase();
    const types = currentSnapshot.snapshot.types || {};
    if (isCreating) {
      if (types[upperCaseCode] !== undefined) {
        // TODO: Error since `code` is being used
        return;
      }
    }
    types[upperCaseCode] = { label, color };
    const snapshot = currentSnapshot.snapshot;
    snapshot.types = types;
    updateCurrentSnapshot(snapshot);
    setHasChanges(true);
  }

  async function onCreateSnapshotClick() {
    await createSnapshot();
    location.reload();
  }

  function onTypeCreateClick() {
    setCurrentType({ label: '', color: '' });
    setCurrentTypeCode('');
  }

  return (
    <div>
      <Grid container spacing={8} direction="column">
        <Grid item>
          <Title>{t('Create snapshot')}</Title>
        </Grid>
      </Grid>
      {!loading && !error && currentSnapshot && (
        <Paper style={{ padding: '1em', marginTop: '1em', marginBottom: '1em' }}>
          {mapSnapshotTypes(currentSnapshot, onTypeDeleteClick, onTypeClick)}
          <Button color="primary" size="small" variant="outlined" onClick={onTypeCreateClick}>
            {t('New')}
          </Button>
        </Paper>
      )}
      <Grid item>
        <Grid container spacing={8}>
          <Grid item>
            <Tooltip
              placement="right"
              title={
                <Typography color="inherit">
                  {hasChanges ? 'Save changes and create a new snapshot' : 'Create a new snapshot'}
                </Typography>
              }
            >
              <Button color="primary" variant="outlined" onClick={onCreateSnapshotClick}>
                {hasChanges ? t('Save') : t('Create')}
                {hasChanges && <sup>{'*'}</sup>}
              </Button>
            </Tooltip>
          </Grid>
          {hasChanges && (
            <Grid item>
              <Button color="secondary" variant="outlined" onClick={() => onResetClick()}>
                {t('Reset')}
              </Button>
            </Grid>
          )}
        </Grid>
      </Grid>
      {currentType && (
        <TypeUpsertDialog
          open={currentType != null}
          startingType={currentType}
          startingTypeCode={currentTypeCode}
          onSave={onTypeSave}
          onClose={() => setCurrentType(null)}
        />
      )}
      {codeToDelete && (
        <ConfirmActionDialog
          title={t('Delete type?')}
          content={
            t('Are you sure you want to delete the type with code {{typeCode}}?', { typeCode: codeToDelete }) as string
          }
          onClose={() => setCodeToDelete('')}
          open={codeToDelete != ''}
          onAccept={() => doDelete(codeToDelete)}
        />
      )}
    </div>
  );
};

export { ManageSnapshot };
