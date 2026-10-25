export const ENV = {
  // A production demo build must opt in with VITE_DEMO_MODE=true.
  DEMO_MODE:
    import.meta.env.VITE_DEMO_MODE === "false" ||
    (import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE !== "false"),
  VITE_AUTH_URL: import.meta.env.VITE_AUTH_URL as string | undefined,
};
