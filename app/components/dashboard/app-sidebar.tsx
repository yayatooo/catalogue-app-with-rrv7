import { BookCopy, CookingPot, Soup } from "lucide-react";

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
      name: "Shudaxia Phnom Penh",
      logo: Soup,
      plan: "Enterprise",
    },
    {
      name: "Shudaxia Shianoukvile",
      logo: Soup,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Platform",
      url: "/admin/catalogue",
      icon: CookingPot,
      isActive: true,
      items: [
        {
          title: "Catalogue",
          url: "/admin/catalogue",
        },
        {
          title: "Promo",
          url: "/admin/promo",
        },
      ],
    },
    {
      title: "Master Data",
      url: "/admin/categories",
      icon: BookCopy,
      items: [
        {
          title: "Categories",
          url: "/admin/categories",
        },
        {
          title: "Attributes",
          url: "/admin/attributes",
        },
        {
          title: "Accounts",
          url: "/admin/accounts",
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
