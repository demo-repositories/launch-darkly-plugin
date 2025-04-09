import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { setCookiesValue } from "./lib/ld/cookie";

export async function middleware(request: NextRequest) {
  if (request.headers.get("sec-fetch-dest") !== "document") {
    return;
  }
  let response = NextResponse.next();

  const cookie = request.cookies.get("ab-test")?.value;
  if (!cookie) {
    response = setCookiesValue(request, response);
  }
  return response;
}
