import { NextResponse } from "next/server";
import { COUNTRIES } from "@/lib/countries";

export async function GET(request: Request) {
  try {
    const headerCountry =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-country-code");

    if (
      headerCountry &&
      COUNTRIES.some((c) => c.code === headerCountry.toUpperCase())
    ) {
      return NextResponse.json({ country: headerCountry.toUpperCase() });
    }
  } catch (err) {
    console.error("Geo error:", err);
  }

  return NextResponse.json({ country: null });
}
