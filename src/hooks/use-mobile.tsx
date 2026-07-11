import * as React from "react";

const MOBILE_BREAKPOINT = 1024;
const TABLET_MAX_BREAKPOINT = 1280;

// SSR-safe initial value helper
const getInitialMobile = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
};

const getInitialTablet = () => {
  if (typeof window === "undefined") return false;
  const width = window.innerWidth;
  return width >= MOBILE_BREAKPOINT && width < TABLET_MAX_BREAKPOINT;
};

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(getInitialMobile);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean>(getInitialTablet);

  React.useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth;
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_MAX_BREAKPOINT);
    };
    
    const mql = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_MAX_BREAKPOINT - 1}px)`);
    mql.addEventListener("change", checkTablet);
    checkTablet();
    return () => mql.removeEventListener("change", checkTablet);
  }, []);

  return isTablet;
}
