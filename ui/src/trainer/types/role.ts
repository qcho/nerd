enum Role {
  ADMIN = 'admin',
  USER = 'user',
  TRAINER = 'trainer',
  UNKNOWN = 'unknown',
}

function roleFromString(value: string): Role {
  if (value == Role.ADMIN) return Role.ADMIN;
  if (value == Role.USER) return Role.USER;
  if (value == Role.TRAINER) return Role.TRAINER;
  return Role.UNKNOWN;
}

export { Role, roleFromString };
