//this one not neef

import { redirect } from "next/navigation";

export default async function Page({ params }) {
  redirect(`/dashboard/adminOrgs/${params.organisationId}`);
}