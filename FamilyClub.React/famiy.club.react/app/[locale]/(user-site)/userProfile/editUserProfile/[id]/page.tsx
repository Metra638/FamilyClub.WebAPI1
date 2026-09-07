import EditUserClient from "./EditUserClient";

export default async function EditUserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EditUserClient id={id} />;
}