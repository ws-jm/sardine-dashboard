import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import { Transaction as TransactionResponse } from "sardine-dashboard-typescript-definitions";
import { PAYMENT_METHOD_DETAILS_PATH, TRANSACTIONS_PATH } from "modulePaths";
import Loader from "components/Common/Loader";
import { DatesProps } from "utils/store/interface";
import { StyledDropdownDiv } from "styles/Layout";
import DaysDropdown from "components/Dropdown/DaysDropdown";
import { captureException } from "utils/errorUtils";
import Layout from "../Layout/Main";
import { StyledNavTitle, StyledStickyNav, StyledTitleName } from "../Dashboard/styles";
import { StyledMainDiv, StyledContainer, HorizontalContainer, StyledChildren, PinContainer, TitleContainer } from "./styles";
import back_blue from "../../utils/logo/back_blue.svg";
import { fetchTransactionDetails } from "../../utils/api";
import PaymentMethodCard from "./Components/PaymentMethodCard";
import PaymentMethodChart from "./Components/PaymentMethodChart";
import RecentTransaction from "./Components/RecentTransaction";
import { getDatesFromQueryParams } from ".";

const PaymentMethodDetails = (): JSX.Element => {
  const navigate = useNavigate();

  const [transactionData, setTransactionData] = useState<TransactionResponse>();
  const [transactionList, setTransactionList] = useState<TransactionResponse[]>([]);
  const [isTransactionDataLoaded, setIsTransactionDataLoaded] = useState(false);

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const { addToast } = useToasts();

  const { search } = useLocation();

  const [params] = useSearchParams();

  const transactionId = params.get("transactionId") || "";
  const clientId = params.get("clientId") || "";
  const organization = params.get("client") || "";

  const dates = getDatesFromQueryParams(search);
  const { startDate, endDate } = dates;

  const fetchTransactionData = useCallback(async () => {
    if (clientId.length > 0 && transactionId.length > 0) {
      try {
        setIsTransactionDataLoaded(false);
        const { data, transactions } = await fetchTransactionDetails(clientId, {
          transaction_id: transactionId,
          load_transactions: true,
          startDate,
          endDate,
        });

        if (data !== null) {
          setTransactionData(data);
          setTransactionList(transactions || []);
        } else {
          addToast("Failed to load details!", {
            appearance: "error",
            autoDismiss: true,
          });
        }
      } catch (error) {
        captureException(error);
        addToast(`Failed to load details: ${error}`, {
          appearance: "error",
          autoDismiss: true,
        });
      } finally {
        setIsDataLoaded(true);
        setIsTransactionDataLoaded(true);
      }
    }
  }, [addToast, transactionId, clientId, startDate, endDate]);

  useEffect(() => {
    if (!isDataLoaded) {
      setIsDataLoaded(true);
      fetchTransactionData().then().catch(captureException);
    }
  }, [isDataLoaded, fetchTransactionData]);

  const onDateChange = (index: number, dateData: DatesProps) => {
    const pathSearch = `clientId=${encodeURIComponent(clientId)}&transactionId=${encodeURIComponent(
      transactionId
    )}&client=${encodeURIComponent(organization)}&start_date=${encodeURIComponent(
      dateData.startDate
    )}&end_date=${encodeURIComponent(dateData.endDate)}`;
    navigate(`${PAYMENT_METHOD_DETAILS_PATH}?${pathSearch}`);
    navigate(0); // Refresh the page. TODO: Change the way to update the filter.
  };

  const transactionAmount = transactionList.length > 0 ? transactionList.map((t) => t.amount).reduce((sum, a) => sum + a, 0) : 0;

  return (
    <Layout>
      <StyledStickyNav style={{ width: "100%", marginBottom: 0, backgroundColor: "white" }}>
        <HorizontalContainer
          id="back_button"
          style={{
            color: "#2173FF",
            fontSize: 16,
            padding: 20,
            justifyContent: "start",
          }}
          onClick={() => {
            navigate(`${TRANSACTIONS_PATH}?client=${organization}`);
            navigate(0); // Refresh the page. TODO: Change the way to update the filter.
          }}
        >
          <img alt="back" src={back_blue} style={{ width: 20, marginLeft: 30 }} />
          Back to Transaction Intelligence?
        </HorizontalContainer>
      </StyledStickyNav>

      <StyledChildren>
        {isDataLoaded && isTransactionDataLoaded ? (
          <StyledMainDiv
            style={{
              backgroundColor: "#FFF",
              width: "100%",
              height: "90vh",
              margin: 0,
              overflowY: "scroll",
            }}
          >
            <TitleContainer>
              <StyledNavTitle style={{ width: "100%", marginLeft: 30 }}>
                <StyledTitleName
                  id="page_title"
                  style={{
                    fontSize: 32,
                    fontWeight: "normal",
                    paddingTop: 20,
                  }}
                >
                  {transactionData?.customer_id || ""}
                  <StyledTitleName
                    id="page_subtitle"
                    style={{
                      fontSize: 14,
                      fontWeight: "normal",
                      color: "#B9C5E0",
                      marginTop: 10,
                    }}
                  >
                    Customer Id
                  </StyledTitleName>
                </StyledTitleName>
              </StyledNavTitle>
              <StyledDropdownDiv className="mb-3" style={{ flex: "None", zIndex: 20 }}>
                Duration:
                <DaysDropdown handleUpdateDate={onDateChange} startDateString={startDate} endDateString={endDate} />
              </StyledDropdownDiv>
            </TitleContainer>
            <StyledContainer>
              <PinContainer style={{ marginBottom: 30 }}>
                <HorizontalContainer>
                  <PaymentMethodCard
                    data={transactionData}
                    transactionAmount={transactionAmount}
                    transactionCount={transactionList.length}
                  />
                  <PaymentMethodChart data={transactionList} />
                </HorizontalContainer>
                <RecentTransaction isLoading={!isTransactionDataLoaded} transactions={transactionList} />
              </PinContainer>
            </StyledContainer>
          </StyledMainDiv>
        ) : (
          <Loader />
        )}
      </StyledChildren>
    </Layout>
  );
};

export default PaymentMethodDetails;
