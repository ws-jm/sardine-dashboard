import { Response } from "express";
import * as Sentry from "@sentry/node";
import { AnyTodo } from "sardine-dashboard-typescript-definitions";

interface ErrorWithCode {
  code: string;
}

interface ErrorWithESMetaBodyError {
  meta: {
    body: {
      error: string;
    };
  };
}

interface ErrorWithMessage {
  message: string;
}

interface ErrorWithResponse {
  response: {
    status?: string;
    data?: AnyTodo;
  };
}

export const handleClientIDNotFoundError = (e: Error, res: Response) => {
  if (e?.message === "NOT_FOUND") {
    return res.status(404).json({ error: `Invalid organisation name` });
  }

  throw e;
};

const isErrorWithCode = (error: unknown): error is ErrorWithCode =>
  error !== undefined && typeof (error as ErrorWithCode).code === "string";

const isErrorWithMessage = (error: unknown): error is ErrorWithMessage =>
  error !== undefined && typeof (error as ErrorWithMessage).message === "string";

export const isErrorWithResponse = (error: unknown): error is ErrorWithResponse =>
  error !== undefined && typeof (error as ErrorWithResponse).response === "object";

export const getErrorMessage = (error: unknown, options?: { fallbackMessage?: string }): string => {
  if (isErrorWithMessage(error)) {
    return error.message;
  }

  return options && options.fallbackMessage ? options.fallbackMessage : "Error";
};

export const isErrorWithSpecificMessage = (error: unknown, message: string): boolean =>
  isErrorWithMessage(error) && error.message === message;

export const isErrorWithESMetaBodyError = (error: unknown): error is ErrorWithESMetaBodyError =>
  error !== undefined &&
  typeof (error as ErrorWithESMetaBodyError).meta === "object" &&
  typeof (error as ErrorWithESMetaBodyError).meta.body === "object" &&
  typeof (error as ErrorWithESMetaBodyError).meta.body.error === "string";

export const isErrorWithSpecificCode = (error: unknown, code: string): boolean => isErrorWithCode(error) && error.code === code;

// Use when you don't know the error type.
// If the error is a string, it will be returned as is.
export const captureException = (e: unknown) => {
  Sentry.captureException(e);
};

// Assertion functions cannot be const func = (a: AType): assert a is BType => {}
// https://github.com/microsoft/TypeScript/pull/33622
export function assertDefined(env: string | undefined, name: string): asserts env is string {
  if (env === undefined) {
    throw new Error(`${name} is undefined`);
  }
}
