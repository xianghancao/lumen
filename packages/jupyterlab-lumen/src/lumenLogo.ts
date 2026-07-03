export const LUMEN_LOGO_TEXT = "Lumen";

export const LUMEN_LOGO_CLASS = "jp-LumenLogo";

export const applyLumenLogo = (
  element: HTMLElement,
  variant: "header" | "toolbar" = "header",
): void => {
  element.classList.add(LUMEN_LOGO_CLASS, `${LUMEN_LOGO_CLASS}--${variant}`);
  element.textContent = LUMEN_LOGO_TEXT;
};
