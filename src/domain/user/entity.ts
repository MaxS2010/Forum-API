export interface User {
  id: number;
  email: string;
  name: string | null;
}

export interface UserCredentials extends User {
  password: string;
}

export interface RegisterUserInput {
  email: string;
  password: string;
}
