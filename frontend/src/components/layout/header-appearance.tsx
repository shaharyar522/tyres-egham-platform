import { createContext, useContext } from "react";

export type HeaderAppearance = {
  solid: boolean;
};

const HeaderAppearanceContext = createContext<HeaderAppearance>({ solid: true });

export function HeaderAppearanceProvider({
  solid,
  children,
}: {
  solid: boolean;
  children: React.ReactNode;
}) {
  return <HeaderAppearanceContext.Provider value={{ solid }}>{children}</HeaderAppearanceContext.Provider>;
}

export function useHeaderAppearance() {
  return useContext(HeaderAppearanceContext);
}
