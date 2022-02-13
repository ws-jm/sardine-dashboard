import { ADMIN_ROLES } from "../constants";

export const isAdminAccessRole = (role: string): boolean => (ADMIN_ROLES as string[]).includes(role);
