import { NextRequest, NextResponse } from "next/server";
import { i18nConfig } from "@/i18n.config";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") || i18nConfig.defaultLocale;

  // Validate locale
  if (!i18nConfig.locales.includes(locale)) {
    return NextResponse.json(
      { error: "Invalid locale" },
      { status: 400 }
    );
  }

  try {
    const messages = await import(`@/messages/${locale}.json`);
    return NextResponse.json(messages.default);
  } catch (error) {
    console.error("Failed to load messages:", error);
    return NextResponse.json(
      { error: "Failed to load messages" },
      { status: 500 }
    );
  }
}
