import { redirect } from "next/navigation";

export default function Home() {
  // Setup standard redirect to the dashboard for the demo
  redirect("/login");
}
