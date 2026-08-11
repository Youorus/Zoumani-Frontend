import { env } from "@/lib/env/env";

export function buildWhatsAppUrl(message: string) {
  const phoneNumber = env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  const baseUrl = phoneNumber ? `https://wa.me/${phoneNumber}` : "https://wa.me/";
  const query = new URLSearchParams({ text: message });

  return `${baseUrl}?${query.toString()}`;
}
