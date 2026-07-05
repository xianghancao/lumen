export const KUUSI_LOGO_TEXT = "Kuusi";

export const KUUSI_LOGO_CLASS = "jp-KuusiLogo";

export const applyKuusiLogo = (
  element: HTMLElement,
  variant: "header" | "toolbar" = "header",
): void => {
  element.classList.add(KUUSI_LOGO_CLASS, `${KUUSI_LOGO_CLASS}--${variant}`);
  element.textContent = KUUSI_LOGO_TEXT;
};
