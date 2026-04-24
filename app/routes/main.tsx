
import type { Route } from "../+types/root";
import { Welcome } from "../pages/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "What We Serve to You" },
    { name: "description", content: "Welcome to Shu Da Xia!" },
  ];
}

export default function Home() {
  return <Welcome />;
}
