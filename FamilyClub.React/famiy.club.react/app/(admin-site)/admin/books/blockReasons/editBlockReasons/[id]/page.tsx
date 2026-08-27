import EditBlockReasonClient from "./EditBlockReasonClient";

export default async function EditBlockReasonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EditBlockReasonClient id={id} />;
}