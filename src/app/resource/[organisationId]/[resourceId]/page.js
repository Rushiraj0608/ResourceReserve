//this one not neef

import { redirect } from "next/navigation";

export default async function Page({ params }) {
  redirect(`/dashboard/managerResources/${params.resourceId}`);
}
