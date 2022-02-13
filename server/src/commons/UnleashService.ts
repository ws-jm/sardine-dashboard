import axios, { AxiosInstance } from "axios";
import config from "config";
import { GetFeatureFlagsResponse } from "sardine-dashboard-typescript-definitions";

export class UnleashService {
  axiosInstance: AxiosInstance;

  constructor(secretKey: string) {
    this.axiosInstance = axios.create({
      baseURL: config.get("UNLEASH_SERVICE_ENDPOINT"),
    });
    this.axiosInstance.defaults.headers.common.Authorization = secretKey;
  }

  getFeatures = async (): Promise<GetFeatureFlagsResponse> => {
    const { data } = await this.axiosInstance.get("/admin/features");

    return data;
  };
}
