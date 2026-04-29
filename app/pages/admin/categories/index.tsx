import { useEffect, useState } from "react";
import { useFetcher, useLoaderData, Link } from "react-router";
import type { loader } from "~/routes/admin/categories";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

type Category = {
  id: string;
  name: Record<string, string>;
  slug: string;
  sortOrder: number;
  isActive: boolean;
};

function DeleteCategoryDialog({
  category,
  open,
  onOpenChange,
}: {
  category: Category | null;
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

  const displayName =
    category?.name?.en ??
    category?.name?.km ??
    category?.name?.zh ??
    category?.name?.id ??
    "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{displayName}</span>?
            This action cannot be undone.
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
          <fetcher.Form method="post" action="/admin/categories">
            <input type="hidden" name="intent" value="delete" />
            <input type="hidden" name="id" value={category?.id ?? ""} />
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

export default function IndexCategories() {
  const { categories } = useLoaderData<typeof loader>();
  const [selected, setSelected] = useState<Category | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  function openDeleteDialog(category: Category) {
    setSelected(category);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Categories</h1>
        <Button asChild>
          <Link to="/admin/categories/create">Create Category</Link>
        </Button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Sort</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr
                key={category.id}
                className="border-b last:border-0 hover:bg-muted/30"
              >
                <td className="px-4 py-3 font-medium">
                  {category.name?.en ??
                    category.name?.km ??
                    category.name?.zh ??
                    category.name?.id}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {category.slug}
                </td>
                <td className="px-4 py-3">{category.sortOrder}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      category.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="flex gap-2 px-4 py-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/categories/${category.id}/update`}>
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteDialog(category)}
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
        {categories.map((category) => (
          <div
            key={category.id}
            className="rounded-md border p-4 space-y-2 text-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">
                  {category.name?.en ??
                    category.name?.km ??
                    category.name?.zh ??
                    category.name?.id}
                </p>
                <p className="text-muted-foreground text-xs">{category.slug}</p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  category.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {category.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/admin/categories/${category.id}/update`}>Edit</Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => openDeleteDialog(category)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <DeleteCategoryDialog
        category={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
