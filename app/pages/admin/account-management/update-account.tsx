import { Form, useActionData, useLoaderData } from "react-router";
import type { loader } from "~/routes/admin/accounts/update";

type ActionData = {
  errors: { currentPassword?: string[]; newPassword?: string[]; confirmPassword?: string[] };
} | null;

export default function UpdateAccount() {
  const { user } = useLoaderData<typeof loader>();
  const data = useActionData<ActionData>();

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-xl font-semibold">Update Account</h1>

      <div className="rounded-md border p-4 space-y-1 text-sm">
        <p><span className="font-medium">Name:</span> {user.name}</p>
        <p><span className="font-medium">Email:</span> {user.email}</p>
        <p><span className="font-medium">Role:</span> {user.role}</p>
      </div>

      <Form method="post" className="space-y-4">
        <h2 className="font-medium">Change Password</h2>
        <div className="space-y-1">
          <label className="text-sm font-medium">Current Password</label>
          <input
            name="currentPassword"
            type="password"
            className="w-full rounded-md border px-3 py-2 text-sm"
            required
          />
          {data?.errors?.currentPassword && (
            <p className="text-xs text-destructive">{data.errors.currentPassword[0]}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">New Password</label>
          <input
            name="newPassword"
            type="password"
            className="w-full rounded-md border px-3 py-2 text-sm"
            required
          />
          {data?.errors?.newPassword && (
            <p className="text-xs text-destructive">{data.errors.newPassword[0]}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Confirm Password</label>
          <input
            name="confirmPassword"
            type="password"
            className="w-full rounded-md border px-3 py-2 text-sm"
            required
          />
          {data?.errors?.confirmPassword && (
            <p className="text-xs text-destructive">{data.errors.confirmPassword[0]}</p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Save
          </button>
          <a href="/admin/accounts" className="rounded-md border px-4 py-2 text-sm">
            Cancel
          </a>
        </div>
      </Form>
    </div>
  );
}
