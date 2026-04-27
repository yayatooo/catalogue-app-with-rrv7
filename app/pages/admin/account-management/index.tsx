import { redirect, useLoaderData, useFetcher } from "react-router";
import { getAllUsers, deleteUser } from "~/src/services/auth-services";

export async function loader() {
  const allUsers = await getAllUsers();
  return { users: allUsers };
}

export async function action({ request }: { request: Request }) {
  const form = await request.formData();
  const id = form.get("id") as string;
  const intent = form.get("intent") as string;

  if (intent === "delete" && id) {
    await deleteUser(id);
  }

  return redirect("/admin/accounts");
}

export default function IndexAccountManagement() {
  const { users } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Account Management</h1>
        <a
          href="/admin/accounts/create"
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Create Account
        </a>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 font-medium">Name</th>
            <th className="pb-2 font-medium">Email</th>
            <th className="pb-2 font-medium">Role</th>
            <th className="pb-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="py-2">{user.name}</td>
              <td className="py-2">{user.email}</td>
              <td className="py-2 capitalize">{user.role}</td>
              <td className="flex gap-2 py-2">
                <a
                  href={`/admin/accounts/${user.id}/update`}
                  className="text-primary hover:underline"
                >
                  Edit
                </a>
                <fetcher.Form method="post">
                  <input type="hidden" name="intent" value="delete" />
                  <input type="hidden" name="id" value={user.id} />
                  <button
                    type="submit"
                    className="text-destructive hover:underline"
                    onClick={(e) => {
                      if (!confirm("Delete this account?")) e.preventDefault();
                    }}
                  >
                    Delete
                  </button>
                </fetcher.Form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
