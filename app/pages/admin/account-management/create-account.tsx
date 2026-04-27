import { redirect, useActionData } from "react-router";
import { register } from "~/src/services/auth-services";
import { registerSchema } from "~/src/dto/auth.dto";

type ActionErrors = { email?: string[]; password?: string[]; name?: string[] };
type ActionData = { errors: ActionErrors } | null;

export async function action({ request }: { request: Request }) {
  const form = await request.formData();

  const parsed = registerSchema.safeParse({
    email: form.get("email"),
    password: form.get("password"),
    name: form.get("name"),
  });

  if (!parsed.success) {
    const errors: ActionErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof ActionErrors;
      if (!errors[field]) errors[field] = [];
      errors[field]!.push(issue.message);
    }
    return { errors };
  }

  try {
    await register(parsed.data);
    return redirect("/admin/accounts");
  } catch (err: unknown) {
    return { errors: { email: [(err as Error).message] } };
  }
}

export default function CreateAccount() {
  const data = useActionData<ActionData>();

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-xl font-semibold">Create Account</h1>
      <form method="post" className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Name</label>
          <input
            name="name"
            className="w-full rounded-md border px-3 py-2 text-sm"
            required
          />
          {data?.errors?.name && (
            <p className="text-xs text-destructive">{data.errors.name[0]}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            className="w-full rounded-md border px-3 py-2 text-sm"
            required
          />
          {data?.errors?.email && (
            <p className="text-xs text-destructive">{data.errors.email[0]}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Password</label>
          <input
            name="password"
            type="password"
            className="w-full rounded-md border px-3 py-2 text-sm"
            required
          />
          {data?.errors?.password && (
            <p className="text-xs text-destructive">{data.errors.password[0]}</p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Create
          </button>
          <a href="/admin/accounts" className="rounded-md border px-4 py-2 text-sm">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
