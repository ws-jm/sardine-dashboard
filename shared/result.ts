export interface Failure {
  error: Error;
}

interface Success<ValueType> {
  value: ValueType;
}

export type Result<ValueType> = Failure | Success<ValueType>;
export const isFailure = (result: Result<unknown>): result is Failure => "error" in result;

export const getSuccessResult = <ReturnValueType>(result: Success<ReturnValueType>): ReturnValueType => result.value;
export const getFailureResult = (result: Failure): Error => result.error;

// eslint-disable-next-line arrow-body-style
export const createSuccess = <ValueType>(value: ValueType): Success<ValueType> => {
  return { value };
};

// eslint-disable-next-line arrow-body-style
export const createFailure = (error: Error): Failure => {
  return { error };
};
