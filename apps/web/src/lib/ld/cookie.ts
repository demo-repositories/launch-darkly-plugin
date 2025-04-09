import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";

export const setCookiesValue = (
  request: NextRequest,
  response: NextResponse,
) => {
  if (!request.cookies.has("ab-test")) {
    const userId = v4();
    // Setting cookies on the response using the `ResponseCookies` API
    response.cookies.set("ab-test", JSON.stringify({ userId }));
  }

  return response;
};


const getTestCookie = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("ab-test")?.value;
};

export const getUserId = async () => {
  const testCookie = await getTestCookie();
  return testCookie ? JSON.parse(testCookie)?.userId : undefined;
};