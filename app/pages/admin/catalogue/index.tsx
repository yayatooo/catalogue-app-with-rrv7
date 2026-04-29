import { useEffect, useState } from "react";
import { Link, useFetcher, useLoaderData } from "react-router";
import type { loader } from "~/routes/admin/catalogue";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

type MenuItem = {
  id: string;
  name: Record<string, string>;
  slug: string;
  basePrice: string | null;
  isActive: boolean;
  sortOrder: number;
  categoryName: Record<string, string> | null;
};

function DeleteDialog({
  item,
  open,
  onOpenChange,
}: {
  item: MenuItem | null;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Menu Item</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              {item?.name?.en ?? item?.slug}
            </span>
            ? This action cannot be undone.
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
          <fetcher.Form method="post" action="/admin/catalogue">
            <input type="hidden" name="intent" value="delete" />
            <input type="hidden" name="id" value={item?.id ?? ""} />
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

export default function IndexCatalogue() {
  const { items } = useLoaderData<typeof loader>();
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  function openDeleteDialog(item: MenuItem) {
    setSelected(item);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Catalogue</h1>
        <Button asChild>
          <Link to="/admin/catalogue/create">Create Item</Link>
        </Button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Sort</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No items yet.{" "}
                  <Link
                    to="/admin/catalogue/create"
                    className="underline hover:text-foreground"
                  >
                    Create one
                  </Link>
                  .
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b last:border-0 hover:bg-muted/30"
              >
                <td className="px-4 py-3 font-medium">
                  {item.name?.en ?? item.slug}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {item.categoryName?.en ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {item.basePrice != null ? `$${item.basePrice}` : "—"}
                </td>
                <td className="px-4 py-3">{item.sortOrder}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      item.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="flex gap-2 px-4 py-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/catalogue/${item.id}/update`}>Edit</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteDialog(item as MenuItem)}
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
        {items.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No items yet.{" "}
            <Link to="/admin/catalogue/create" className="underline">
              Create one
            </Link>
            .
          </p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-md border p-4 space-y-2 text-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{item.name?.en ?? item.slug}</p>
                <p className="text-muted-foreground text-xs">
                  {item.categoryName?.en ?? "No category"} · {item.slug}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs shrink-0 ${
                  item.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {item.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-muted-foreground">
              {item.basePrice != null ? `$${item.basePrice}` : "No price"}
            </p>
            <div className="flex gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/admin/catalogue/${item.id}/update`}>Edit</Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => openDeleteDialog(item as MenuItem)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <DeleteDialog
        item={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
