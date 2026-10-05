import { getCurrentUser } from "@/lib/auth";
import HomeClient from "@/components/HomeClient";

export default async function HomePage() {
  const user = await getCurrentUser();
  return <HomeClient user={user} />;
}
