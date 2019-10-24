import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Scaffold } from '../scaffold/Scaffold';
import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import { MaybeUser } from '../types/optionals';
import { UsersApi, User } from '../apigen';
import { apiConfig } from '../helpers/api-config';
import Http from '../helpers/http';
import { UserProfileView } from './ProfileView';
import { SuccessSnackbar } from '../widgets/Snackbars';

const useStyles = makeStyles(
  (theme: Theme) => ({
    content: {
      marginTop: theme.spacing.unit * 2,
      marginLeft: theme.spacing.unit * 5,
      marginRight: theme.spacing.unit * 5,
    },
  }),
  { withTheme: true },
);

const MyProfile = () => {
  const [t] = useTranslation();
  const classes = useStyles();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<MaybeUser>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const fetchCurrentUser = useCallback(async () => {
    const userApi = new UsersApi(apiConfig());
    try {
      setLoading(true);
      const userResponse = await userApi.loggedUserDetails();
      return userResponse.data;
    } catch (e) {
      const errorMessage = Http.handleRequestError(e, (status, data) => {
        console.error('Error loading user', data);
        if (status === 404) {
          return t("User doesn't exist");
        }
        return t('Unknown error');
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [t, setLoading]);

  useEffect(() => {
    async function loadUser() {
      const user = await fetchCurrentUser();
      if (!user) return;
      setUser(user as User);
    }
    loadUser();
  }, [fetchCurrentUser]);

  async function onChangePassword(password: string) {
    if (!user) return;
    if (!user.id) return;
    const userApi = new UsersApi(apiConfig());
    // eslint-disable-next-line @typescript-eslint/camelcase
    await userApi.updateUser(user.id, { plain_password: password });
    setSuccessMessage(t('Password updated'));
  }

  return (
    <Scaffold title={t('My profile')} loading={loading} errorMessage={error}>
      {!loading && error.length == 0 && user ? (
        <div className={classes.content}>
          <UserProfileView user={user} onChangePassword={onChangePassword} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </div>
      )}
      <SuccessSnackbar message={successMessage} onClose={() => setSuccessMessage('')} />
    </Scaffold>
  );
};

export { MyProfile };
