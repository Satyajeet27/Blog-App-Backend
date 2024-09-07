export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface UserSchema {
  username: string;
  fname: string;
  lname: string;
  email: string;
  password: string;
  role: Role;
  bio?: string;
}
