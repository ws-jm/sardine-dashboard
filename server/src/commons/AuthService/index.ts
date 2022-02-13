import axios, { AxiosInstance } from "axios";
import config from "config";
import { assertDefined } from "../../utils/error-utils";

export class AuthService {
  axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: config.get("AUTH_SERVICE_ENDPOINT"),
    });
  }

  setAccessorKey() {
    assertDefined(process.env.AUTH_SERVICE_CREATOR, "AUTH_SERVICE_CREATOR");
    this.axiosInstance.defaults.headers.common["X-API-Key"] = process.env.AUTH_SERVICE_CREATOR;
  }

  setCreatorKey() {
    assertDefined(process.env.AUTH_SERVICE_CREATOR, "AUTH_SERVICE_CREATOR");
    this.axiosInstance.defaults.headers.common["X-API-Key"] = process.env.AUTH_SERVICE_CREATOR;
  }

  getCustomerList = async () => {
    this.setAccessorKey();
    const { data } = await this.axiosInstance.get(`/v1/customers`);
    return data;
  };

  createNewClient = async (name: string) => {
    this.setCreatorKey();
    const r = await this.axiosInstance.post(`/v1/customers`, { name });
    return r.data;
  };

  getAllKeys = async (clientId: string) => {
    this.setAccessorKey();
    const { data } = await this.axiosInstance.get(`/v1/customers/keys`, {
      data: { clientId },
    });
    return data;
  };

  generateNewCredentails = async (clientId: string) => {
    this.setCreatorKey();
    const { data } = await this.axiosInstance.post(`/v1/customers/keys`, {
      clientId,
    });
    return data;
  };

  revokeCredentials = async (clientID: string, uuid: string) => {
    this.setCreatorKey();
    const { data } = await this.axiosInstance.delete(`/v1/customers/keys`, {
      data: { clientID, uuid },
    });
    return data;
  };
}

export const authService: AuthService = new AuthService();
