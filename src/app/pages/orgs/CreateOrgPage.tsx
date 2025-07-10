// @/app/pages/orgs/CreateOrgPage.tsx (Server Component)
import { CreateOrgClient } from "@/app/components/Organizations/CreateOrgClient";
import { type AppContext } from "@/worker";

export default function CreateOrgPage({ ctx }: { ctx: AppContext }) {
  return <CreateOrgClient initialUser={ctx.user} />;
}