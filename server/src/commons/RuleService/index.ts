import axios, { AxiosInstance } from "axios";
import { RulePayload, AnyTodo, RuleDetails } from "sardine-dashboard-typescript-definitions";
import config from "config";
import { assertDefined } from "../../utils/error-utils";

export class RuleService {
  axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: config.get("RULE_ENGINE_ENDPOINT"),
    });
  }

  getRulesList = async (payload: { clientID: string; checkpoint?: string }) => {
    assertDefined(process.env.RULE_ENGINE_ACCESSOR, "RULE_ENGINE_ACCESSOR");
    const { data } = await this.axiosInstance.get(`/v1/rule`, {
      data: payload,
      headers: { "X-API-Key": process.env.RULE_ENGINE_ACCESSOR },
    });
    return data;
  };

  getRuleDetails = async (payload: { ruleID: string }): Promise<RuleDetails> => {
    assertDefined(process.env.RULE_ENGINE_ACCESSOR, "RULE_ENGINE_ACCESSOR");
    const { data } = await this.axiosInstance.get(`/v1/rule/details`, {
      data: payload,
      headers: { "X-API-Key": process.env.RULE_ENGINE_ACCESSOR },
    });
    return data;
  };

  createNewRule = async (payload: AnyTodo) => {
    assertDefined(process.env.RULE_ENGINE_CREATOR, "RULE_ENGINE_CREATOR");
    const { data } = await this.axiosInstance.post(`/v1/rule`, JSON.stringify(payload), {
      headers: { "X-API-Key": process.env.RULE_ENGINE_CREATOR },
    });
    return data;
  };

  createRuleDisabling = async (payload: { clientId: string; ruleId: number }) => {
    assertDefined(process.env.RULE_ENGINE_CREATOR, "RULE_ENGINE_CREATOR");
    const { data } = await this.axiosInstance.post(`/v1/rule/disabling`, JSON.stringify(payload), {
      headers: { "X-API-Key": process.env.RULE_ENGINE_CREATOR },
    });
    return data;
  };

  orderRule = async (payload: AnyTodo) => {
    assertDefined(process.env.RULE_ENGINE_CREATOR, "RULE_ENGINE_CREATOR");
    const { data } = await this.axiosInstance.post(`/v1/rule/order`, JSON.stringify(payload), {
      headers: { "X-API-Key": process.env.RULE_ENGINE_CREATOR },
    });
    return data;
  };

  updateRule = async (payload: RulePayload) => {
    assertDefined(process.env.RULE_ENGINE_CREATOR, "RULE_ENGINE_CREATOR");
    const { data } = await this.axiosInstance.put(`/v1/rule`, JSON.stringify(payload), {
      headers: { "X-API-Key": process.env.RULE_ENGINE_CREATOR },
    });
    return data;
  };

  getRuleStats = async (payload: AnyTodo) => {
    assertDefined(process.env.RULE_ENGINE_ACCESSOR, "RULE_ENGINE_ACCESSOR");
    const { data } = await this.axiosInstance.get(`/v1/rule/stats`, {
      data: payload,
      headers: { "X-API-Key": process.env.RULE_ENGINE_ACCESSOR },
    });
    return data;
  };

  getRulesExecution = async (payload: AnyTodo) => {
    assertDefined(process.env.RULE_ENGINE_ACCESSOR, "RULE_ENGINE_ACCESSOR");
    const { data } = await this.axiosInstance.get(`/v1/rule/executions`, {
      data: payload,
      headers: { "X-API-Key": process.env.RULE_ENGINE_ACCESSOR },
    });
    return data;
  };

  deleteQueueFromRules = async (queueId: string) => {
    assertDefined(process.env.RULE_ENGINE_CREATOR, "RULE_ENGINE_CREATOR");
    const { data } = await this.axiosInstance.delete(`/v1/rule/delete-queue?queueId=${queueId}`, {
      headers: { "X-API-Key": process.env.RULE_ENGINE_CREATOR },
    });
    return data;
  };
}

export const ruleService: RuleService = new RuleService();
