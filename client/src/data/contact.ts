/** Single source for contact details used across the site. */
export const PHONE_DISPLAY = "+964 782 694 0781";
export const PHONE_E164 = "+9647826940781";
export const EMAIL = "sajjad.abdulhameed@gmail.com";
/** Standalone pricing app (TeBIM Seals), opened as its own page. */
export const TEBIM_PRICING_URL = "https://tebim-seals-mangement.web.app";

const WHATSAPP_NUMBER = "9647826940781";

/** WhatsApp click-to-chat link with a prefilled message in the visitor's language. */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
