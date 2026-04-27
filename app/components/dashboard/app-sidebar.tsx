import { Bot, Soup, SquareTerminal } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

// This is sample data.
const data = {
  user: {
    name: "Bun Theara",
    email: "theara@shudaxiakh.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Shudaxia Dashboard",
      logo: Soup,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Platform",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Products",
          url: "#",
        },
        {
          title: "Promo",
          url: "#",
        },
      ],
    },
    {
      title: "Master Data",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Categories",
          url: "#",
        },
        {
          title: "Attributes",
          url: "#",
        },
        {
          title: "Account management",
          url: "#",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
