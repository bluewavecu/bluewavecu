import { redirect } from "next/navigation";
import { MEMBER_LOGIN_PATH } from "@/lib/authRoutes";

export default function AuthIndexPage() {
  redirect(MEMBER_LOGIN_PATH);
}
