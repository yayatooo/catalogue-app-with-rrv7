import { useEffect, useState } from "react";
import { useFetcher, useLoaderData, Link } from "react-router";
import type { loader } from "~/routes/admin/attribute";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

type Attribute = {
  id: string;
  label: Record<string, string>;
  slug: string;
  values: { id: string; label: Record<string, string>; slug: string }[];
};

function DeleteAttributeDialog({
  attribute,
  open,
  onOpenChange,
}: {
  attribute: Attribute | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const fetcher = useFetcher();
  const isDeleting = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data !== undefined) {
      onOpenChange(false);
    }
  }, [fetcher.state, fetcher.data]);

  const displayLabel =
    attribute?.label?.en ??
    attribute?.label?.km ??
    attribute?.label?.zh ??
    attribute?.label?.id ??
    "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Attribute</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{displayLabel}</span>?
            This will also delete all its values. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <fetcher.Form method="post" action="/admin/attributes">
            <input type="hidden" name="intent" value="delete" />
            <input type="hidden" name="id" value={attribute?.id ?? ""} />
            <Button
              variant="destructive"
              type="submit"
              disabled={isDeleting}
              className="w-full"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </fetcher.Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function IndexAttribute() {
  const { attributes } = useLoaderData<typeof loader>();
  const [selected, setSelected] = useState<Attribute | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  function openDeleteDialog(attribute: Attribute) {
    setSelected(attribute);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Attributes</h1>
        <Button asChild>
          <Link to="/admin/attributes/create">Create Attribute</Link>
        </Button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Label</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Values</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {attributes.map((attr) => (
              <tr
                key={attr.id}
                className="border-b last:border-0 hover:bg-muted/30"
              >
                <td className="px-4 py-3 font-medium">
                  {attr.label?.en ??
                    attr.label?.km ??
                    attr.label?.zh ??
                    attr.label?.id}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{attr.slug}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {attr.values.length} value{attr.values.length !== 1 ? "s" : ""}
                </td>
                <td className="flex gap-2 px-4 py-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/attributes/${attr.id}/update`}>Edit</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteDialog(attr as Attribute)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="flex flex-col gap-3 md:hidden">
        {attributes.map((attr) => (
          <div
            key={attr.id}
            className="rounded-md border p-4 space-y-2 text-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">
                  {attr.label?.en ??
                    attr.label?.km ??
                    attr.label?.zh ??
                    attr.label?.id}
                </p>
                <p className="text-muted-foreground text-xs">{attr.slug}</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {attr.values.length} value{attr.values.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/admin/attributes/${attr.id}/update`}>Edit</Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => openDeleteDialog(attr as Attribute)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <DeleteAttributeDialog
        attribute={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
