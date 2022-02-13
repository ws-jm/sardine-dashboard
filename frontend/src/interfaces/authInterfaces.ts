export interface SignInData {
  idToken: string;
}

export interface SignInSuccessResponse {
  user_role: string;
  name: string;
  email: string;
}

export const isSignInSuccessResponse = (data: unknown): data is SignInSuccessResponse => {
  if (data === undefined) {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { user_role, name, email } = data as SignInSuccessResponse;
  return user_role !== undefined && name !== undefined && email !== undefined;
};
