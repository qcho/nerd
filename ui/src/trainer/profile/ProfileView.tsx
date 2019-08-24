import React from 'react';
import { useTranslation } from 'react-i18next';
import { User } from '../apigen';
import { Title } from '../widgets/Title';
import { Grid, Typography } from '@material-ui/core';
import { UserTrainings } from './UserTrainings';
import { ChangePasswordForm } from './ChangePasswordForm';
import { useAuthentication } from '../hooks/useAuthentication';
import { Role } from '../types/role';

interface Props {
  user: User;
  onChangePassword?: (newPassword: string) => void;
}

const UserProfileView = ({ user, onChangePassword }: Props) => {
  const [t] = useTranslation();
  const { hasRole } = useAuthentication();
  const isTrainer = hasRole(Role.TRAINER);
  return (
    <Grid container direction="column">
      <Grid item>
        <Grid container direction="column">
          <Grid item>
            <Typography variant="h6" style={{ marginTop: '1em' }}>
              {t('Change Password')}
            </Typography>
          </Grid>
          {onChangePassword && (
            <Grid item>
              <ChangePasswordForm onSubmit={onChangePassword} />
            </Grid>
          )}
        </Grid>
      </Grid>
      {isTrainer && (
        <>
          <Grid item style={{ marginTop: '2em' }}>
            <Title>{t('Trainings')}</Title>
          </Grid>
          <Grid item>
            <UserTrainings user={user} />
          </Grid>
        </>
      )}
    </Grid>
  );
};

export { UserProfileView };
