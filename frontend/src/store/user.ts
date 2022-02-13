import { logout } from "utils/api";
import create from "zustand";
import { devtools } from "zustand/middleware";
import { mountStoreDevtool } from "simple-zustand-devtools";
import { SARDINE_ADMIN, AnyTodo } from "sardine-dashboard-typescript-definitions";
import { createSetWithReplaceParamLast, immer } from "./utils";
import { ADMIN_ROLES } from "../constants";

interface UseUserStore {
  isAuthenticated: boolean;
  role?: string;
  organisation: string;
  id?: string;
  name?: string;
  email?: string;
  setUser: (user: SetUserProps) => void;
  setUserStoreOrganisation: (organisation: string) => void;
  logout: () => void;
}

type SetUserProps = Partial<Pick<UseUserStore, "isAuthenticated" | "role" | "organisation" | "id" | "name" | "email">>;

const name = "Sardine - User Store";

// selectors
export const selectIsSuperAdmin = (state: UseUserStore): boolean => state.role === SARDINE_ADMIN;
export const selectIsAdmin = (state: UseUserStore): boolean =>
  Boolean(state.role && (ADMIN_ROLES as string[]).includes(state.role));

export const useUserStore = create<UseUserStore>(
  immer(
    devtools((set) => {
      const setWithReplaceParamLast = createSetWithReplaceParamLast<UseUserStore>(set);

      return {
        // statew
        isAuthenticated: false,
        organisation: "",
        // setters
        setUser: (user) => setWithReplaceParamLast(user, "setUser"),
        setUserStoreOrganisation: (organisation) => setWithReplaceParamLast({ organisation }, "setOrganisation"),
        logout: async () => {
          await logout();
          setWithReplaceParamLast((state) => {
            state.isAuthenticated = false;
          }, "logout");
        },
      };
    }, name)
  )
);

mountStoreDevtool(name, useUserStore as AnyTodo);
