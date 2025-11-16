export const APP_DIALOG_PORTAL_ID = "mobile-app-shell-dialog-root";

export const getAppDialogPortalElement = () => {
  if (typeof document === "undefined") return null;
  return document.getElementById(APP_DIALOG_PORTAL_ID);
};
