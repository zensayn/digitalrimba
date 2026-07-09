import { InvitationStudio } from "@/components/invitation/InvitationStudio";

type EditInvitationPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditInvitationPage({ params }: EditInvitationPageProps) {
  const { id } = await params;

  return <InvitationStudio invitationId={id} />;
}
