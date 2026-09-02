"use client";

import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="card p-6 max-w-lg">
      <h1 className="text-xl font-bold mb-4">Profile</h1>
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-gray-500">Name</p>
          <p className="font-medium">{session?.user?.name}</p>
        </div>
        <div>
          <p className="text-gray-500">Email</p>
          <p className="font-medium">{session?.user?.email}</p>
        </div>
        <div>
          <p className="text-gray-500">Role</p>
          <p className="font-medium capitalize">{session?.user?.role}</p>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-6">
        Profile editing (name, address, phone) can be added via a PUT /api/users/me endpoint — ask if you'd like this wired up.
      </p>
    </div>
  );
}
