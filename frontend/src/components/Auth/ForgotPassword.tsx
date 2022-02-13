import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import * as Sentry from "@sentry/react";
import { Spinner } from "react-bootstrap";
import { isErrorWithStatusCode } from "utils/errorUtils";
import {
  StyledInput,
  ErrorText,
  MainDiv,
  LoginDiv,
  Title,
  TitleWithLogo,
  Logo,
  StyledHeading,
  StyledSubHeading,
  StyledLoginOptions,
  LoginButton,
} from "./styles";
import darkLogo from "../../utils/logo/Dark.svg";
import { requestResetPasswordLink } from "../../utils/api";

const ForgetPassword = (): JSX.Element => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<{ email: string; generic: string }, { a: string }>({
    defaultValues: { email: "" },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const setSpecificSuccessMessage = () => {
    setSuccessMessage("If account exists, an email will be sent to your email address with further instructions");
  };

  const onSubmit = handleSubmit(async ({ email }) => {
    setIsLoading(true);

    try {
      await requestResetPasswordLink({ email });
      setSpecificSuccessMessage();
    } catch (err) {
      if (isErrorWithStatusCode({ error: err, statusCode: 429 })) {
        setError("generic", {
          type: "manual",
          message:
            "You have reached the limit for requesting password reset link for this email. Contact support if you cannot open the email",
        });
        return;
      }

      setError("generic", {
        type: "manual",
        message: "Something went wrong while sending the reset password link to your email. Please try again later",
      });
      Sentry.addBreadcrumb({ message: "Forgot password request error" });
      Sentry.captureException(err);
    } finally {
      setIsLoading(false);
    }
  });

  const onSubmitButtonHandler = useCallback(() => {
    clearErrors();
  }, [clearErrors]);

  return (
    <MainDiv>
      <LoginDiv>
        <TitleWithLogo>
          <Logo src={darkLogo} />
          <Title>Sardine</Title>
        </TitleWithLogo>
        <StyledHeading>Forgot your password?</StyledHeading>
        <StyledSubHeading>
          Enter the email address associated with your account and we'll send you a link to reset your password
        </StyledSubHeading>
        <StyledLoginOptions>
          <form onSubmit={onSubmit}>
            <label htmlFor="emailForgot" className="email">
              <span className="label">Email address</span>
              <div className="field-wrapper email-field">
                <StyledInput
                  disabled={Boolean(successMessage)}
                  id="emailForgot"
                  placeholder="Enter your email address"
                  type="email"
                  {...register("email", { required: true })}
                />
              </div>
              {errors.email && <ErrorText>Email is required</ErrorText>}
            </label>
            {!successMessage && (
              <LoginButton onClick={onSubmitButtonHandler} disabled={isLoading} type="submit">
                <span>
                  {isLoading && <Spinner className="mr-2" animation="border" size="sm" aria-hidden="true" />}
                  Continue
                </span>
              </LoginButton>
            )}
            {errors.generic && <ErrorText>{errors.generic.message}</ErrorText>}
            {successMessage && <StyledHeading>{successMessage}</StyledHeading>}
          </form>
        </StyledLoginOptions>
      </LoginDiv>
    </MainDiv>
  );
};

export const FORGOT_PASSWORD_PATH = "/forget-password";

export default ForgetPassword;
