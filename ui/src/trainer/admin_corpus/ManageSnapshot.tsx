import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Title, Subtitle } from '../widgets/Title';
import { Paper, Chip, Button, Typography, Grid, Tooltip } from '@material-ui/core';
import useCurrentSnapshot from '../hooks/useCurrentSnapshot';
import { Type } from '../apigen';
import { TypeAvatar } from './TypeAvatar';
import { TypeUpsertDialog } from './TypeUpsertDialog';
import { EntityType, MaybeEntityType } from '../types/EntityType';

const ManageSnapshot = () => {
  const [t] = useTranslation();
  const { currentSnapshot, loading, error, createSnapshot, updateCurrentSnapshot } = useCurrentSnapshot();
  const [currentType, setCurrentType] = useState<MaybeEntityType>(null);
  const [typesToAdd, setTypesToAdd] = useState<EntityType[]>([]);
  const [typesToDelete, setTypesToDelete] = useState<EntityType[]>([]);

  function mapTypesToChips(
    types: EntityType[],
    onDelete?: (type: EntityType) => void,
    onClick?: (type: EntityType) => void,
  ) {
    return types.map(entityType => {
      const { type, code } = entityType;
      return (
        <Chip
          onClick={(onClick && (() => onClick(entityType))) || undefined}
          style={{ marginRight: '1em', marginTop: '0.3em', marginBottom: '0.2em' }}
          key={code}
          avatar={<TypeAvatar code={code} color={type.color} />}
          label={<Typography>{type.label}</Typography>}
          variant="outlined"
          onDelete={(onDelete && (() => onDelete(entityType))) || undefined}
        />
      );
    });
  }

  function onTypeDeleteClick(type: EntityType) {
    typesToDelete.push(type);
    setTypesToDelete([...typesToDelete]);
  }

  function onResetClick() {
    setTypesToAdd([]);
    setTypesToDelete([]);
  }

  async function onTypeUpsert(type: EntityType, original: MaybeEntityType) {
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

  function onTypeClick(type: EntityType) {
    setCurrentType(type);
  }

  function onTypeCreateClick() {
    setCurrentType({ type: { label: '', color: '' }, code: '' });
  }

  function typesToArray(types: { [key: string]: Type }) {
    return Object.keys(types).map(code => ({ code, type: types[code] }));
  }

  function mapSnapshotTypes(types: { [key: string]: Type }, onDelete: any, onClick: any) {
    const entityTypes = typesToArray(types);
    return mapTypesToChips(
      entityTypes.filter(type => typesToDelete.findIndex(it => it.code == type.code) < 0),
      onDelete,
      onClick,
    );
  }

  function onCancelDelete(type: EntityType) {
    setTypesToDelete(typesToDelete.filter(it => it.code != type.code));
  }

  function onCancelAdd(type: EntityType) {
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
              <Subtitle>{t('Types') + ':'}</Subtitle>
              {mapSnapshotTypes(currentSnapshot.snapshot.types || {}, onTypeDeleteClick, onTypeClick)}
              <Button color="primary" size="small" variant="outlined" onClick={onTypeCreateClick}>
                {t('New')}
              </Button>
            </Grid>
            {typesToDelete.length > 0 && (
              <Grid item>
                <Subtitle>{t('To delete') + ':'}</Subtitle>
                {mapTypesToChips(typesToDelete, onCancelDelete)}
              </Grid>
            )}
            {typesToAdd.length > 0 && (
              <Grid item>
                <Subtitle>{t('To add') + ':'}</Subtitle>
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
