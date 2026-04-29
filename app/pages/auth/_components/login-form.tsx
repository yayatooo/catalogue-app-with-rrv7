import { useActionData } from "react-router";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";

type ActionData = { error?: string } | null;

export function LoginForm({ className }: { className?: string }) {
  const data = useActionData<ActionData>();

  return (
    <form method="post" className={cn("flex flex-col gap-6", className)}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-3 text-center">
          <img src="/logo.png" alt="logo" className="h-16 w-auto object-contain" />
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>

        {data?.error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
            {data.error}
          </p>
        )}

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
          </div>
          <Input id="password" name="password" type="password" required />
        </Field>
        <Field>
          <Button type="submit" className="w-full">Login</Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
