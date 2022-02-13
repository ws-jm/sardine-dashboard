import { useEffect, useRef, useState } from "react";
import { RulePerformanceKind } from "sardine-dashboard-typescript-definitions";
import { getRulesPerformanceData } from "utils/api";
import { captureException } from "utils/errorUtils";

type FetchState = "data_not_fetched" | "fetching_data" | "fetched_data";

const useRulePerformanceFetch = (clientId: string, ruleId: string): { rulePerformance: RulePerformanceKind | undefined } => {
  const cache = useRef<Array<RulePerformanceKind>>([]);
  const [status, setStatus] = useState<FetchState>("data_not_fetched");
  const [rulePerformance, setRulePerformance] = useState<RulePerformanceKind>();

  useEffect(() => {
    const fetchRulePerformanceData = async () => {
      try {
        if (status === "data_not_fetched") {
          setStatus("fetching_data");
          // eslint-disable-next-line @typescript-eslint/naming-convention
          const { rules_performance } = await getRulesPerformanceData();
          cache.current = rules_performance;
          setStatus("fetched_data");
        }
        if (status === "fetched_data") {
          const matchedRules = cache.current.filter((rp) => rp.ClientId === clientId && String(rp.RuleId) === ruleId);
          if (matchedRules.length > 0) {
            setRulePerformance(matchedRules[0]);
          }
        }
      } catch (e) {
        captureException(e);
      }
    };

    fetchRulePerformanceData()
      .then()
      .catch((e) => captureException(e));
  });

  return { rulePerformance };
};

export default useRulePerformanceFetch;
