import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Title } from '../widgets/Title';
import { Paper, Chip, Button, Typography, Grid, Tooltip } from '@material-ui/core';
import useCurrentSnapshot from '../hooks/useCurrentSnapshot';
import { Type } from '../apigen';
import { TypeAvatar } from '../widgets/TypeAvatar';
import { TypeUpsertDialog } from '../widgets/TypeUpsertDialog';
import { CompleteType, MaybeCompleteType } from '../types/CompleteType';

const ManageSnapshot = () => {
  const [t] = useTranslation();
  const { currentSnapshot, loading, error, createSnapshot, updateCurrentSnapshot } = useCurrentSnapshot();
  const [currentType, setCurrentType] = useState<MaybeCompleteType>(null);
  const [typesToAdd, setTypesToAdd] = useState<CompleteType[]>([]);
  const [typesToDelete, setTypesToDelete] = useState<CompleteType[]>([]);

  function mapTypesToChips(
    types: CompleteType[],
    onDelete?: (type: CompleteType) => void,
    onClick?: (type: CompleteType) => void,
  ) {
    return types.map(completeType => {
      const { type, code } = completeType;
      return (
        <Chip
          onClick={(onClick && (() => onClick(completeType))) || undefined}
          style={{ marginRight: '1em', marginTop: '0.3em', marginBottom: '0.2em' }}
          key={code}
          avatar={<TypeAvatar code={code} color={type.color} />}
          label={<Typography>{type.label}</Typography>}
          variant="outlined"
          onDelete={(onDelete && (() => onDelete(completeType))) || undefined}
        />
      );
    });
  }

  function onTypeDeleteClick(type: CompleteType) {
    typesToDelete.push(type);
    setTypesToDelete([...typesToDelete]);
  }

  function onResetClick() {
    setTypesToAdd([]);
    setTypesToDelete([]);
  }

  async function onTypeUpsert(type: CompleteType, original: MaybeCompleteType) {
    if (!currentSnapshot) return;
    if (original) {
      typesToDelete.push(original);
      setTypesToDelete([...typesToDelete]);
    }
    typesToAdd.push(type);
    setTypesToAdd([...typesToAdd]);
    setCurrentType(null);
  }

  async function onUpsertSnapshotClick() {
    if (!currentSnapshot) return;
    const currentTypes = currentSnapshot.snapshot.types || {};
    typesToDelete.forEach(type => delete currentTypes[type.code]);
    typesToAdd.forEach(type => (currentTypes[type.code] = type.type));
    currentSnapshot.snapshot.types = currentTypes;
    updateCurrentSnapshot(currentSnapshot.snapshot);
    await createSnapshot();
    location.reload();
  }

  function onTypeClick(type: CompleteType) {
    setCurrentType(type);
  }

  function onTypeCreateClick() {
    setCurrentType({ type: { label: '', color: '' }, code: '' });
  }

  function typesToArray(types: { [key: string]: Type }) {
    return Object.keys(types).map(code => ({ code, type: types[code] }));
  }

  function mapSnapshotTypes(types: { [key: string]: Type }, onDelete: any, onClick: any) {
    const completeTypes = typesToArray(types);
    return mapTypesToChips(
      completeTypes.filter(type => typesToDelete.findIndex(it => it.code == type.code) < 0),
      onDelete,
      onClick,
    );
  }

  function onCancelDelete(type: CompleteType) {
    setTypesToDelete(typesToDelete.filter(it => it.code != type.code));
  }

  function onCancelAdd(type: CompleteType) {
    setTypesToAdd(typesToAdd.filter(it => it.code != type.code));
  }

  const hasChanges = typesToAdd.length > 0 || typesToDelete.length > 0;

  return (
    <div>
      <Grid container spacing={8} direction="column">
        <Grid item>
          <Title>{t('Create snapshot')}</Title>
        </Grid>
      </Grid>
      {!loading && !error && currentSnapshot && (
        <Paper style={{ padding: '1em', marginTop: '1em', marginBottom: '1em' }}>
          <Grid container direction="column" spacing={8}>
            <Grid item>
              <Typography variant="subtitle1">{t('Types') + ':'}</Typography>
              {mapSnapshotTypes(currentSnapshot.snapshot.types || {}, onTypeDeleteClick, onTypeClick)}
              <Button color="primary" size="small" variant="outlined" onClick={onTypeCreateClick}>
                {t('New')}
              </Button>
            </Grid>
            {typesToDelete.length > 0 && (
              <Grid item>
                <Typography variant="subtitle1">{t('To delete') + ':'}</Typography>
                {mapTypesToChips(typesToDelete, onCancelDelete)}
              </Grid>
            )}
            {typesToAdd.length > 0 && (
              <Grid item>
                <Typography variant="subtitle1">{t('To add') + ':'}</Typography>
                {mapTypesToChips(typesToAdd, onCancelAdd)}
              </Grid>
            )}
          </Grid>
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
              <Button color="primary" variant="outlined" onClick={onUpsertSnapshotClick}>
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
          onSave={onTypeUpsert}
          onClose={() => setCurrentType(null)}
        />
      )}
      {/* TODO: {typesToDelete.length > 0 && (
        <ConfirmActionDialog
          title={t('Delete type?')}
          content={
            t('Are you sure you want to delete the following types: {{typeCode}}?', {
              typeCode: typesToDelete.join(', '),
            }) as string
          }
          onClose={() => setTypesToDelete([])}
          open={typesToDelete.length > 0}
          onAccept={() => doDelete(codeToDelete)}
        />
      )} */}
    </div>
  );
};

export { ManageSnapshot };
