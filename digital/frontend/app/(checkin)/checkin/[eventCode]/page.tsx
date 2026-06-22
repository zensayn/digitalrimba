import { OperatorCheckIn } from "@/components/checkin/OperatorCheckIn";

type CheckInPageProps = {
  params: Promise<{
    eventCode: string;
  }>;
};

export default async function CheckInPage({ params }: CheckInPageProps) {
  const { eventCode } = await params;

  return <OperatorCheckIn eventCode={eventCode} />;
}
