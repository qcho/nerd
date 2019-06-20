import { User, Text } from '../apigen/api';

const Routes = {
  home: '/',
  preview: '/preview',
  login: '/login',
  register: '/register',
  myTrainings: '/trainings/me',
  corpusAdmin: '/admin/corpus-admin',
  userAdmin: '/admin/users',
  train: '/train',
  corpus: '/admin/corpus',
  trainingsByUser: {
    route: '/admin/users/:id/trainings',
    buildRoute: (user: User) => `/admin/users/${user.id}/trainings`,
  },
  trainingsForText: {
    route: '/admin/corpus/:id/trainings',
    buildRoute: (text: Text) => `/admin/corpus/${text.id}/trainings`,
  },
};

export { Routes };
