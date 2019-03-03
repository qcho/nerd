export type Credentials = {
  access_token: string;
  refresh_token: string;
  username: string;
  roles: string[];
};

export type MaybeCredentials = Credentials | null;
