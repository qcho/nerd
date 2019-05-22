import { User } from '../apigen/api';

const Routes = {
  home: '/',
  preview: '/preview',
  login: '/login',
  register: '/register',
  myTrainings: '/trainings/me',
  corpusAdmin: '/admin/corpus',
  userAdmin: '/admin/users',
  train: '/train',
  trainingsByUser: {
    route: '/admin/users/:id/trainings',
    buildRoute: (user: User) => `/admin/users/${user.id}/trainings`,
  },
};

export { Routes };
