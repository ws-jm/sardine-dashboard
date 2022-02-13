import styled from "styled-components";

export const StylesContainer = styled.div`
  @import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap");
  /* Regular 400
Medium 500
Semi-bold 600
Bold 700 */

  a,
  button,
  input {
    transition: all ease-in-out 400ms 0s;
    text-decoration: none !important;
  }

  /* Color */
  .bg-light {
    background-color: rgba(33, 115, 255, 1);
  }

  /* Spacing */
  .pt-8 {
    padding-top: 5rem !important;
  }

  .pb-8 {
    padding-bottom: 5rem !important;
  }

  .mb-32px {
    margin-bottom: 32px;
  }

  .b-0 {
    border: 0 !important;
  }

  /* Alerts */
  .alert {
    margin-bottom: 32px;
    border-radius: 10px;
    border-bottom-left-radius: 0;
    border-top-left-radius: 0;
    border: 0;
  }

  .alert-warning {
    background-color: rgba(255, 190, 24, 0.15);
    color: rgba(50, 80, 120, 1);
  }

  .alert-warning strong {
    color: rgba(0, 45, 150, 1);
    font-weight: 500;
    margin-right: 8px;
  }

  .alert-warning:before {
    content: "";
    position: absolute;
    height: 100%;
    width: 3px;
    left: 0;
    top: 0;
    background-color: rgba(255, 190, 24, 1);
  }

  /* Modal */

  .modal-header {
    padding: 24px;
    border-color: rgba(234, 237, 242, 1);
  }

  .modal-title {
    font-style: normal;
    font-weight: bold;
    font-size: 27px;
    line-height: 40px;
    color: rgba(0, 45, 150, 1);
  }

  .modal-body {
    padding: 24px;
  }

  .modal-footer {
    padding: 24px;
    border-color: rgba(234, 237, 242, 1);
  }

  @media (min-width: 1400px) {
    .container,
    .container-lg,
    .container-md,
    .container-sm,
    .container-xl,
    .container-xxl {
      max-width: 1200px;
    }
  }

  .navbar-brand {
    white-space: normal;
  }

  .brandName {
    font-style: normal;
    font-weight: 700;
    font-size: 26px;
    line-height: 30px;
    color: rgba(0, 45, 150, 1);
  }

  label,
  .form-label {
    font-weight: 500;
  }

  .form-label small {
    color: rgba(185, 197, 224, 1);
  }

  small {
    font-size: 75%;
    font-weight: 500;
  }

  .form-check-input {
    width: 20px !important;
    height: 20px !important;
    margin: 2px 0 0 !important;
    cursor: pointer !important;
  }

  .form-check-input:checked {
    background-color: #0d6efd !important;
  }

  .btn {
    font-weight: 500;
    border-color: transparent;
    border-radius: 6px;
  }

  .btn-outline-primary {
    background-color: rgba(13, 101, 253, 0.1);
    color: rgba(33, 115, 255, 1);
  }

  .btn-outline-secondary {
    background-color: rgba(108, 117, 125, 0.1);
    color: rgba(108, 117, 125, 1);
  }

  .btn-outline-success {
    background-color: rgba(25, 135, 84, 0.1);
    color: rgba(25, 135, 84, 1);
  }

  .btn-outline-danger {
    background-color: rgba(220, 53, 69, 0.1);
    color: rgba(253, 104, 113, 1);
  }

  .btn-outline-warning {
    background-color: rgba(255, 193, 7, 0.1);
    color: rgba(255, 193, 7, 1);
  }

  .btn-outline-info {
    background-color: rgba(13, 202, 240, 0.1);
    color: rgba(13, 202, 240, 1);
  }

  /* .btn-outline-light {} */
  .btn-outline-dark {
    background-color: rgba(33, 37, 41, 0.1);
    color: rgba(33, 37, 41, 1);
  }

  .btnAdd {
    width: 48px;
    height: 48px;
    padding: 8px;
  }

  .btn-link {
    color: rgba(33, 115, 255, 1);
    font-weight: 500;
    font-size: 14px;
    line-height: 18px;
  }

  .btn-link.danger {
    color: rgba(253, 104, 113, 1);
  }

  .btnAdd svg {
    width: 24px;
    height: 24px;
  }

  .footer {
    border-top: 1px solid rgba(234, 237, 242, 1);
    padding-top: 32px;
    margin-top: 80px;
  }

  .footer .btn-lg {
    margin: 0 16px;
  }

  .btn-lg {
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 21px;
    text-align: center;
    padding: 0.782rem 1rem;
    min-width: 150px;
  }

  .btn-lg .ic {
    width: 24px;
    height: 24px;
  }

  .btn-lg.btnBack {
    margin-left: auto;
  }

  .btn-lg.btnNext {
    margin-right: auto;
  }

  .form-check-input {
    width: 24px !important;
    height: 24px !important;
    background-color: #f0f3f9 !important;
    border: 1px solid rgba(234, 237, 242, 1) !important;
    border-radius: 6px;
  }

  .form-check .form-check-input {
    margin-left: -30px !important;
    margin-top: -2px !important;
  }

  .form-check-label {
    font-weight: 500 !important;
    font-size: 14px !important;
    line-height: 18px !important;
    color: rgba(0, 45, 150, 1) !important;
  }

  .form-check {
    padding-left: 30px !important;
  }

  .nav .nav-item {
    display: inline-block;
    max-width: 18%;
    vertical-align: bottom;
  }

  .nav .nav-link {
    border-radius: 0;
    color: rgba(var(--bs-light-rgb), 0.5);
    cursor: pointer;
    border-bottom: 3px solid transparent;
    padding: 16px 24px;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 18px;
  }

  .nav .nav-link.active {
    border-bottom: 3px solid rgba(255, 190, 24, 1);
    background-color: rgba(var(--bs-light-rgb), 0.1);
    color: rgba(var(--bs-light-rgb), 1);
  }

  .stepHeader {
    display: block;
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
    margin-bottom: 8px;
    min-height: 20px;
  }

  .stepCount {
    display: inline-block;
    width: 20px;
    height: 20px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 100%;
    text-align: center;
    line-height: 19px;
    margin-left: 6px;
  }

  .nav .nav-link.active .stepCount {
    background-color: rgba(255, 255, 255, 1);
    color: rgba(33, 115, 255, 1);
  }

  .stepTitle {
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 18px;
    min-height: 36px;
    display: block;
  }

  .bb {
    margin-bottom: 32px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(234, 237, 242, 1);
  }

  .pageTitle {
    font-style: normal;
    font-weight: 700;
    font-size: 32px;
    line-height: 40px;
    color: rgba(0, 45, 150, 1);
    margin-bottom: 0;
  }

  .version {
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
  }

  .card-header {
    padding: 24px;
    font-weight: 700;
    font-size: 18px;
    line-height: 23px;
    color: rgba(0, 45, 150, 1);
    background-color: transparent;
    border-bottom: 1px solid rgba(234, 237, 242, 1);
  }

  .card-header:first-child {
    border-radius: calc(0.25rem - -6px) calc(0.25rem - -6px) 0 0;
  }

  .card {
    margin-bottom: 32px;
    border-radius: 10px;
  }

  .formCard {
    padding: 32px 24px;
    border: 1px solid #eaedf2;
    box-shadow: 0px 35px 60px -15px rgba(0, 0, 0, 0.05);
    border-radius: 16px;
  }

  .form-label {
    color: rgba(0, 45, 150, 1);
    font-weight: 700;
    font-size: 16px;
    line-height: 21px;
    margin-bottom: 8px;
  }

  .form-floating > label {
    padding: 1rem;
    font-weight: normal;
    font-size: 18px;
    line-height: 23px;
    color: rgba(0, 45, 150, 0.25);
  }

  .form-control,
  .form-floating > .form-control,
  .form-floating > .form-select,
  .form-select {
    border: 1px solid rgba(234, 237, 242, 1);
    background-color: #f0f3f9;
    height: 58px;
    padding: 1rem;
    color: rgba(50, 80, 120, 1);
  }

  .input-group-text {
    border-color: rgba(234, 237, 242, 1);
  }

  .form-control:focus,
  .form-floating > .form-control:focus,
  .form-floating > .form-select:focus,
  .form-select:focus {
    border-color: rgba(33, 115, 255, 1);
    background-color: #ffffff;
    box-shadow: 0 0 0 0.25rem rgba(33, 115, 255, 0.2);
  }

  .form-floating > .form-control:focus ~ label,
  .form-floating > .form-control:not(:placeholder-shown) ~ label,
  .form-floating > .form-select ~ label {
    transform: scale(0.85) translateY(-0.5rem) translateX(0.15rem);
    color: rgba(50, 80, 120, 1);
    font-weight: 500;
  }

  .card-body {
    padding: 24px;
  }

  .card-body .list-group-item {
    border: 0;
    padding: 0;
    margin-bottom: 16px;
    color: rgba(50, 80, 120, 1);
  }

  .card-body .list-group-item span {
    color: rgba(0, 45, 150, 1);
    font-weight: 500;
    margin-right: 8px;
  }

  .card-body .list-group-item strong {
    color: rgba(0, 45, 150, 1);
    font-weight: 600;
  }

  .bg-primary.card {
    background-color: transparent !important;
    border: 0;
  }

  .bg-primary.card .card-body {
    background-color: rgba(var(--bs-primary-rgb), 0.1) !important;
    padding: 0;
  }

  .bg-secondary.card {
    background-color: rgba(247, 249, 252, 1) !important;
    border: 0;
  }

  .bg-info.card {
    background-color: transparent !important;
    border: 0;
  }

  .bg-info.card .card-body {
    background-color: rgba(var(--bs-info-rgb), 0.1) !important;
    padding: 0;
  }

  .bg-warning.card {
    background-color: transparent !important;
    border: 0;
  }

  .bg-warning.card .card-body {
    background-color: rgba(var(--bs-warning-rgb), 0.1) !important;
    padding: 20px;
  }

  .bg-info.card .card-body .list-group-item {
    padding: 10px 20px;
    font-size: 90%;
  }

  .mandatory {
    color: rgba(253, 104, 113, 1);
    font-size: 75%;
    margin: 0 4px;
    vertical-align: top;
  }
`;
