import { User, Text } from '../apigen/api';

const Routes = {
  home: '/',
  preview: '/preview',
  login: '/login',
  register: '/register',
  myProfile: '/me',
  corpusAdmin: '/admin/corpus-admin',
  userAdmin: '/admin/users',
  train: '/train',
  corpus: '/admin/corpus',
  userProfile: {
    route: '/admin/users/:id',
    buildRoute: (user: User) => `/admin/users/${user.id}`,
  },
  trainingsForText: {
    route: '/admin/corpus/:id/trainings',
    buildRoute: (text: Text) => `/admin/corpus/${text.id}/trainings`,
  },
};

export { Routes };
