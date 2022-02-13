import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { AnyTodo, getFailureResult, getSuccessResult, isFailure } from "sardine-dashboard-typescript-definitions";
import { useUserStore } from "store/user";
import SocialButton from "./Button";
import { googleSignInResult, loginUserResult } from "../../utils/api";
import firebase from "../../utils/firebase";
import { captureException } from "../../utils/errorUtils";
import EmailVerificationModal from "./EmailVerificationModal";
import { StyledInput, LoginButton, ErrorText, MainDiv, LoginDiv } from "./styles";
import { FORGOT_PASSWORD_PATH } from "./ForgotPassword";
import { useSearchQuery } from "../../hooks/useSearchQuery";
import { CUSTOMERS_PATH } from "../../modulePaths";
import { REDIRECT_URL_KEY } from "./AuthenticatedOnly";
import showPwd from "../../utils/logo/show_pwd.svg";

interface EmailAndPassword {
  email: string;
  password: string;
  generic?: string;
}

const Login = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<EmailAndPassword>();
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const setUser = useUserStore((store) => store.setUser);
  const query = useSearchQuery();
  const redirectUrl = query.get(REDIRECT_URL_KEY) || CUSTOMERS_PATH;

  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState(false);

  const onGoogleLogin = async () => {
    try {
      const idToken = await firebase.googleLogin();
      if (idToken) {
        const result = await googleSignInResult({ idToken });
        if (isFailure(result)) {
          const error = getFailureResult(result);
          setError("generic", {
            type: "Manual",
            message: error.message,
          });
          return;
        }
        const successResult = getSuccessResult(result);

        setUser({
          isAuthenticated: true,
          role: successResult.user_role,
          name: successResult.name,
          email: successResult.email,
        });
      }
      navigate(redirectUrl);
      navigate(0); // Refresh the page. TODO: Change the way to update the state.
    } catch (e) {
      captureException(e);
      setError("generic", {
        type: "Manual",
        message: "Failed to login",
      });
    }
  };

  const onPasswordLogin = (e: AnyTodo) => {
    e.preventDefault();
    clearErrors();
    handleSubmit(async (data: EmailAndPassword) => {
      try {
        setIsLoading(true);
        const idToken = await firebase.login(data);
        const result = await loginUserResult({ idToken });
        if (isFailure(result)) {
          const error = getFailureResult(result);
          setError("generic", {
            type: "Manual",
            message: error.message,
          });
          return;
        }
        const successResult = getSuccessResult(result);

        setUser({
          isAuthenticated: true,
          role: successResult.user_role,
          name: successResult.name,
          email: successResult.email,
        });

        navigate(redirectUrl);
        navigate(0); // Refresh the page. TODO: Change the way to update the state.
      } catch (err: AnyTodo) {
        let message = "Login Failed";
        switch (err.code) {
          case "auth/user-not-found":
          case "auth/wrong-password":
            message = "No such username or password";
            break;
          default:
            break;
        }
        setError("generic", {
          type: "Manual",
          message,
        });
        if (err && err.response && err.response.data && err.response.data.error === "EMAIL_NOT_VERIFIED") {
          setShowEmailVerificationModal(true);
        }
      } finally {
        setIsLoading(false);
      }
    })(e)
      .then()
      .catch((err) => captureException(err));
  };

  const hideEmailVerificationModal = () => {
    setShowEmailVerificationModal(false);
  };

  const sendVerificationEmail = async () => {
    await firebase.sendVerificationEmail();
  };

  return (
    <MainDiv>
      <LoginDiv>
        <p className="title">Sign in to Sardine</p>
        <p className="subtitle">Sign in with your business’s Google account or your password.</p>
        <SocialButton className="google" onClick={onGoogleLogin} type="google" />
        <div className="or">
          <span>Or</span>
        </div>
        <form onSubmit={onPasswordLogin}>
          <label htmlFor="emailLogin" className="email">
            <span className="label">Email address</span>
            <div className="field-wrapper email-field">
              <StyledInput
                id="emailLogin"
                placeholder="Enter your email address"
                type="email"
                {...register("email", { required: true })}
              />
            </div>
            {errors.email && <ErrorText>Email is required</ErrorText>}
          </label>
          <label htmlFor="passwordLogin" className="pwd">
            <span className="label">Password</span>
            <div className="field-wrapper pwd-field">
              <span className="show-pwd" onClick={() => setShow(!show)} onChange={() => {}} aria-hidden="true">
                <img src={showPwd} width="15" height="10" alt="show" />
              </span>
              <StyledInput
                id="passwordLogin"
                placeholder=""
                type={`${show ? "text" : "password"}`}
                {...register("password", { required: true })}
              />
            </div>
            {errors.password && <ErrorText>Password is required</ErrorText>}
            {errors.generic && <ErrorText>{errors.generic.message}</ErrorText>}
          </label>
          <Link to={FORGOT_PASSWORD_PATH} className="forget">
            Forgot your password?
          </Link>
          <LoginButton id="submitLogin" type="submit" onClick={() => clearErrors()}>
            {isLoading ? <Spinner animation="border" role="status" color="#fff" style={{ margin: 5 }} /> : <span>Sign In</span>}
          </LoginButton>
        </form>
      </LoginDiv>
      <EmailVerificationModal
        show={showEmailVerificationModal}
        sendVerificationEmail={sendVerificationEmail}
        handleClose={hideEmailVerificationModal}
      />
    </MainDiv>
  );
};

export default Login;
