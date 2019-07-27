import React, { useEffect, useState, useCallback } from 'react';
import { UsersApi, User } from '../apigen';
import { apiConfig } from '../helpers/api-config';
import Http from '../helpers/http';
import { Theme, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { MaybeUser } from '../types/optionals';
import { useTranslation } from 'react-i18next';
import { Scaffold } from '../widgets/Scaffold';
import { UserProfileView } from './ProfileView';

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

const UserProfile = ({ match }: { match: any }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<MaybeUser>(null);
  const [t] = useTranslation();

  const fetchUser = useCallback(async () => {
    const { id } = match.params;
    const userApi = new UsersApi(apiConfig());
    try {
      setLoading(true);
      const userResponse = await userApi.userDetails(id);
      return userResponse.data;
    } catch (e) {
      // TODO: Correct error message
      const errorMessage = Http.handleRequestError(e, (status, data) => {
        console.log('Error loading user', data);
        if (status === 404) {
          return t("User doesn't exist");
        }
        return t('Unknown error');
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [match.params, t]);

  useEffect(() => {
    async function loadUser() {
      const user = await fetchUser();
      if (!user) return;
      setUser(user as User);
    }
    loadUser();
  }, [fetchUser]);

  async function onChangePassword(password: string) {
    // TODO
  }

  return (
    <Scaffold
      title={(user && t('{{userName}} profile', { userName: user.name })) || ''}
      subtitle={(user && user.email) || ''}
      loading={loading}
      errorMessage={error}
    >
      {!loading && error.length == 0 && user ? (
        <div className={classes.content}>
          <UserProfileView user={user} onChangePassword={onChangePassword} isSelf={false} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </div>
      )}
    </Scaffold>
  );
};

export { UserProfile };
