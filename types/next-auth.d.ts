import type { DisplayCurrency } from "@/lib/currency/constants";
import type { UserRole } from "@/lib/types";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: UserRole;
    sessionId?: string;
    displayCurrency?: DisplayCurrency;
  }

  interface Session {
    user: User & {
      id: string;
      role: UserRole;
      displayCurrency?: DisplayCurrency;
    };
    forceLogout?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    sessionId?: string;
    displayCurrency?: DisplayCurrency;
  }
}
