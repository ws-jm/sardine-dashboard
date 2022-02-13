import styled from "styled-components";
import seperator from "../../utils/logo/seperator.svg";
import email from "../../utils/logo/email.svg";
import pwd from "../../utils/logo/pwd.svg";
import name from "../../utils/logo/name.svg";

export const StyledInput = styled.input`
  font-family: IBM Plex Sans;
  font-weight: 400;
  font-size: 14px;
  line-height: 18.2px;
  text-align: left;
  width: 100%;
  height: 40px;
  border-radius: 6px;
  background-color: #f0f3f9;
  margin: 0;
  text-align: left;
  padding-left: 40px;
  border: 1px solid transparent;
  &:hover,
  &:focus {
    border: 1px solid #2173ff;
    outline: none;
  }
  &::-webkit-input-placeholder {
    /* Edge */
    color: #b9c5e0;
    font-family: IBM Plex Sans;
    font-weight: 400;
    font-size: 14px;
    line-height: 18.2px;
    text-align: left;
  }

  &:-ms-input-placeholder {
    /* Internet Explorer 10-11 */
    color: #b9c5e0;
    font-family: IBM Plex Sans;
    font-weight: 400;
    font-size: 14px;
    line-height: 18.2px;
    text-align: left;
  }

  &::placeholder {
    color: #b9c5e0;
    font-family: IBM Plex Sans;
    font-weight: 400;
    font-size: 14px;
    line-height: 18.2px;
    text-align: left;
  }
`;

export const LoginButton = styled.button`
  width: 250px;
  height: 40px;
  max-width: 100%;
  border-radius: 4px;
  background: #2173ff;
  background-color: #2173ff;
  border: none;
  display: flex;
  margin: 0 auto 0 0;
  cursor: pointer;
  color: #ffffff;
  justify-content: center;
  &.register-btn {
    margin: 20px auto 0 0;
  }
  span {
    font-family: IBM Plex Sans;
    margin: auto;
    text-align: center;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 18.2px;
  }
`;

export const ErrorText = styled.div`
  font-size: 12px;
  text-align: left;
  color: red;
`;

export const MainDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  background-color: #ffffff;
  padding: 30px 15px;
  @media (max-width: 768.98px) {
    padding: 50px 15px;
  }
  .ready {
    font-family: IBM Plex Sans;
    width: 100%;
    max-width: 416px;
    margin: 50px auto 0;
    text-align: left;
    font-style: normal;
    font-weight: 500;
    font-size: 15px;
    line-height: 19.5px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    @media (min-width: 1400px) {
      margin: 100px auto 50px;
    }

    a {
      color: #2173ff;
      text-decoration: unset;
      text-align: left;
    }
  }
`;

export const LoginDiv = styled.div`
  width: 100%;
  max-width: 416px;
  min-height: 457px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background: #ffffff;
  border: unset;
  border-radius: 0;
  &.register {
    margin: auto;
  }

  .title {
    font-family: IBM Plex Sans;
    font-weight: 700;
    font-size: 24px;
    line-height: 31px;
    text-align: left;
    padding: 0;
    margin: 0 0 3px;
    color: #001932;
  }
  .subtitle {
    font-family: IBM Plex Sans;
    font-weight: 400;
    font-size: 14px;
    line-height: 18.2px;
    text-align: left;
    padding: 0;
    margin: 0 0 30px;
    color: #325078;
  }
  .google {
    width: 250px;
    height: 40px;
    margin: 0 auto 30px 0;
    .logo-parent {
      width: 38px;
      height: 36px;
      margin: 2px;
      img {
        margin: 8px 9px !important;
      }
    }
    .btn-text {
      font-weight: 500;
      line-height: 18.2px;
    }
  }
  .or {
    width: 100%;
    position: relative;
    margin-bottom: 30px;
    span {
      width: 56px;
      height: 18px;
      margin: 0 auto;
      font-family: IBM Plex Sans;
      font-weight: 400;
      font-size: 14px;
      line-height: 18.2px;
      text-align: center;
      padding: 0;
      color: #325078;
      display: block;
      background-color: #ffffff;
      position: relative;
    }
    &::before {
      content: "";
      display: block;
      position: absolute;
      background: url(${seperator}) center/cover no-repeat;
      width: 416px;
      height: 1px;
      max-width: 100%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
  label {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    position: relative;
    margin-bottom: 0;
    .field-wrapper {
      position: relative;
      margin-bottom: 10px;
      &.name-field::before {
        content: "";
        display: block;
        position: absolute;
        background: url(${name}) center/cover no-repeat;
        width: 15px;
        height: 15px;
        bottom: 14px;
        left: 14px;
      }
      &.email-field::before {
        content: "";
        display: block;
        position: absolute;
        background: url(${email}) center/cover no-repeat;
        width: 14px;
        height: 11px;
        bottom: 14px;
        left: 14px;
      }
      &.pwd-field {
        &::before {
          content: "";
          display: block;
          position: absolute;
          background: url(${pwd}) center/cover no-repeat;
          width: 11px;
          height: 14px;
          bottom: 14px;
          left: 14px;
        }
        .show-pwd {
          position: absolute;
          width: 15px;
          height: 10px;
          bottom: 15px;
          right: 15px;
          display: flex;
          cursor: pointer;

          img {
            width: 15px;
            height: 10px;
          }
        }
      }
    }
    &.email,
    &.name,
    &.pwd {
      margin-bottom: 10px;
    }

    .label {
      font-family: IBM Plex Sans;
      font-weight: 600;
      font-size: 16px;
      line-height: 20.8px;
      text-align: left;
      margin-bottom: 7px;
    }
  }
  .forget {
    font-family: IBM Plex Sans;
    font-weight: 400;
    font-size: 16px;
    line-height: 20.8px;
    text-align: left;
    padding: 0;
    margin: 0 0 30px;
    color: #2173ff;
    text-decoration: unset;
    display: block;
  }
`;

export const Title = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 18px;
  font-feature-settings: "ss02" on;
  color: var(--dark-14);
  margin: auto;
  padding-bottom: 24px;
`;

export const TitleWithLogo = styled.div`
  width: 87px;
  height: 48px;
  margin: 24px 0px 0px 24px;
  display: flex;
`;

export const Logo = styled.img`
  padding-bottom: 24px;
`;

export const StyledHeading = styled.div`
  max-width: 100%;
  height: 24px;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 20px;
  line-height: 26px;
  color: var(--dark-14);
  margin: 32px 24px 0 24px;
`;

export const StyledSubHeading = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 140%;
  font-feature-settings: "ss02" on;
  color: var(--dark-14);
  margin: 8px 24px 0 24px;
`;

export const StyledLoginOptions = styled.div`
  margin: 32px 24px 0px;
  @media (max-width: 760px) {
    margin: 32px 16px 0px;
  }
  label {
    margin-bottom: 0px;
  }
`;
