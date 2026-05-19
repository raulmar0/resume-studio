import { GuestEditorPage } from "@/components/guest/GuestEditorPage";

export const metadata = { title: "Guest editor · Resume Studio" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GuestEditorPage id={id} />;
}
