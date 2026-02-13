"use client";

import dynamicLoader from "next/dynamic";
import { AdminUserListItem } from "app-types/admin";

const UserMapComponent = dynamicLoader(
  () => import("@/components/admin/user-map").then((mod) => mod.UserMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full bg-muted animate-pulse rounded-lg" />
    ),
  },
);

interface AdminUserMapWrapperProps {
  users: AdminUserListItem[];
}

export function AdminUserMapWrapper({ users }: AdminUserMapWrapperProps) {
  return <UserMapComponent users={users} />;
}
