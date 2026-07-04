import InviteAcceptPanel from "@/components/invite/InviteAcceptPanel";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <InviteAcceptPanel token={token} />;
}
