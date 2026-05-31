import { redirect } from "next/navigation";
import { MEMBER_LOGIN_PATH } from "@/lib/authRoutes";

type LoginRedirectPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginRedirectPage({ searchParams }: LoginRedirectPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      query.set(key, value);
    } else if (Array.isArray(value)) {
      for (const entry of value) {
        query.append(key, entry);
      }
    }
  }

  const queryString = query.toString();
  redirect(queryString ? `${MEMBER_LOGIN_PATH}?${queryString}` : MEMBER_LOGIN_PATH);
}
