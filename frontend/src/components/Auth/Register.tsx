import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { Spinner } from "react-bootstrap";
import { AnyTodo } from "sardine-dashboard-typescript-definitions";
import { useUserStore } from "store/user";
import SocialButton from "./Button";
import { googleSignIn, registerUser, getEmailFromToken } from "../../utils/api";
import firebase from "../../utils/firebase";
import { captureException } from "../../utils/errorUtils";
import { StyledInput, LoginButton, ErrorText, MainDiv, LoginDiv, StyledHeading } from "./styles";
import showPwd from "../../utils/logo/show_pwd.svg";

const Register = (): JSX.Element => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    reset,
  } = useForm();
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [params] = useSearchParams();
  const setUser = useUserStore((store) => store.setUser);
  const invitationToken = params.get("token");

  useEffect(() => {
    async function fetchData() {
      try {
        if (invitationToken) {
          const emailResponse = await getEmailFromToken(invitationToken);
          if (emailResponse) {
            reset({ email: emailResponse.email });
          }
        }
      } catch (err) {
        setError("generic", {
          type: "manual",
          message: "Token is invalid",
        });
      }
    }
    fetchData()
      .then()
      .catch((e) => captureException(e));
  }, [invitationToken]);

  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState(false);

  const onGoogleLogin = async () => {
    try {
      const idToken = await firebase.googleLogin();
      if (idToken) {
        const result = await googleSignIn({ idToken, invitationToken });

        setUser({
          isAuthenticated: true,
          role: result.user_role,
          name: result.name,
          email: result.email,
        });
      }
    } catch (e) {
      captureException(e);
    }
  };

  const onRegister = (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    handleSubmit(async (data) => {
      try {
        setIsLoading(true);
        const idToken = await firebase.register(data as AnyTodo);
        const userData = {
          idToken,
          ...data,
          invitationToken,
        };
        const result = await registerUser(userData);
        if (!result.is_email_verified) {
          setSuccessMessage("Registration success. Please check your email for verification.");
        } else {
          setUser({ isAuthenticated: true, ...result });
          navigate("/dashboard");
          navigate(0); // Refresh the page. TODO: Change the way to update the state.
        }
      } catch (err) {
        setError("generic", {
          type: "manual",
          message: "Registation falied",
        });
        Sentry.addBreadcrumb({ message: "registration error" });
        captureException(err);
      } finally {
        setIsLoading(false);
      }
    })(e)
      .then()
      .catch((err) => captureException(err));
  };

  return (
    <MainDiv>
      <LoginDiv className="register">
        <p className="title">Sign in to Sardine</p>
        <p className="subtitle">Sign in with your business’s Google account or your password.</p>
        {!successMessage && <SocialButton className="google" onClick={onGoogleLogin} type="google" />}
        <div className="or">
          <span>Or</span>
        </div>
        <form onSubmit={onRegister}>
          <label htmlFor="nameRegister" className="name">
            <span className="label">Full Name</span>
            <div className="field-wrapper name-field">
              <StyledInput id="nameRegister" placeholder="Full Name" type="text" {...register("name", { required: true })} />
            </div>
            {errors.email && <ErrorText>Name is required</ErrorText>}
          </label>
          <label htmlFor="emailRegister" className="email">
            <span className="label">Email address</span>
            <div className="field-wrapper email-field">
              <StyledInput
                id="emailRegister"
                placeholder="Enter your email address"
                type="email"
                {...register("email", { required: true })}
              />
            </div>
            {errors.email && <ErrorText>Email is required</ErrorText>}
          </label>
          <label htmlFor="passwordRegister" className="pwd">
            <span className="label">Password</span>
            <div className="field-wrapper pwd-field">
              <span className="show-pwd" onClick={() => setShow(!show)} onChange={() => {}} aria-hidden="true">
                <img src={showPwd} width="15" height="10" alt="show" />
              </span>
              <StyledInput
                id="passwordRegister"
                placeholder=""
                type={`${show ? "text" : "password"}`}
                {...register("password", { required: true })}
              />
            </div>
            {errors.password && <ErrorText>Password is required</ErrorText>}
          </label>
          {!successMessage && (
            <LoginButton className="register-btn" id="submitRegister" type="submit" onClick={() => clearErrors()}>
              {isLoading ? (
                <Spinner animation="border" role="status" color="#fff" style={{ margin: 5 }} />
              ) : (
                <span>Register</span>
              )}
            </LoginButton>
          )}
          {successMessage && <StyledHeading>{successMessage}</StyledHeading>}
          {errors.organisation && <ErrorText>{errors.organisation.message}</ErrorText>}
          {errors.generic && <ErrorText>{errors.generic.message}</ErrorText>}
        </form>
      </LoginDiv>
      <p className="ready">
        Are you already a member?&nbsp;<Link to="/login">Sign In</Link>
      </p>
    </MainDiv>
  );
};
export default Register;
