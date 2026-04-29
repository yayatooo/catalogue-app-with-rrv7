import { useEffect, useState } from "react";
import { Form, useActionData, useLoaderData, useFetcher } from "react-router";
import type { loader } from "~/routes/admin/attributes/update";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

type ActionData = {
  errors?: Record<string, string>;
} | null;

const locales = [
  { key: "label_en", label: "Label (English)", required: true },
  { key: "label_km", label: "ស្លាក (Khmer)", required: false },
  { key: "label_zh", label: "标签 (Chinese)", required: false },
  { key: "label_id", label: "Label (Indonesia)", required: false },
] as const;

type LocaleKey = "label_en" | "label_km" | "label_zh" | "label_id";
const localeToField: Record<LocaleKey, string> = {
  label_en: "en",
  label_km: "km",
  label_zh: "zh",
  label_id: "id",
};

const valueLocales = [
  { key: "val_label_en", label: "Label (English)", required: true },
  { key: "val_label_km", label: "ស្លាក (Khmer)", required: false },
  { key: "val_label_zh", label: "标签 (Chinese)", required: false },
  { key: "val_label_id", label: "Label (Indonesia)", required: false },
] as const;

type AttributeValue = {
  id: string;
  label: Record<string, string>;
  slug: string;
  sortOrder: number;
};

function DeleteValueDialog({
  value,
  attributeId,
  open,
  onOpenChange,
}: {
  value: AttributeValue | null;
  attributeId: string;
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
    value?.label?.en ??
    value?.label?.km ??
    value?.label?.zh ??
    value?.label?.id ??
    "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Value</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the value{" "}
            <span className="font-medium text-foreground">{displayLabel}</span>?
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
          <fetcher.Form
            method="post"
            action={`/admin/attributes/${attributeId}/update`}
          >
            <input type="hidden" name="intent" value="delete-value" />
            <input type="hidden" name="valueId" value={value?.id ?? ""} />
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

export default function UpdateAttribute() {
  const { attribute } = useLoaderData<typeof loader>();
  const data = useActionData<ActionData>();
  const addValueFetcher = useFetcher<ActionData>();
  const [showAddValue, setShowAddValue] = useState(false);
  const [selectedValue, setSelectedValue] = useState<AttributeValue | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (
      addValueFetcher.state === "idle" &&
      addValueFetcher.data !== undefined &&
      !addValueFetcher.data?.errors
    ) {
      setShowAddValue(false);
    }
  }, [addValueFetcher.state, addValueFetcher.data]);

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-xl font-semibold">Edit Attribute</h1>

      {/* Attribute form */}
      <Form method="post" className="space-y-4">
        <input type="hidden" name="intent" value="update-attribute" />

        {locales.map(({ key, label, required }) => (
          <div key={key} className="space-y-1">
            <label className="text-sm font-medium">
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </label>
            <input
              name={key}
              defaultValue={attribute.label?.[localeToField[key]] ?? ""}
              className="w-full rounded-md border px-3 py-2 text-sm"
              required={required}
            />
            {key === "label_en" && data?.errors?.label_en && (
              <p className="text-xs text-destructive">{data.errors.label_en}</p>
            )}
          </div>
        ))}

        <div className="space-y-1">
          <label className="text-sm font-medium">
            Slug <span className="text-destructive">*</span>
          </label>
          <input
            name="slug"
            defaultValue={attribute.slug}
            className="w-full rounded-md border px-3 py-2 text-sm"
            required
          />
          {data?.errors?.slug && (
            <p className="text-xs text-destructive">{data.errors.slug}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Save
          </button>
          <a
            href="/admin/attributes"
            className="rounded-md border px-4 py-2 text-sm"
          >
            Cancel
          </a>
        </div>
      </Form>

      {/* Attribute values */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Values</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddValue((v) => !v)}
          >
            {showAddValue ? "Cancel" : "Add Value"}
          </Button>
        </div>

        {showAddValue && (
          <addValueFetcher.Form
            method="post"
            action={`/admin/attributes/${attribute.id}/update`}
            className="rounded-md border p-4 space-y-3 bg-muted/30"
          >
            <input type="hidden" name="intent" value="add-value" />

            {valueLocales.map(({ key, label, required }) => (
              <div key={key} className="space-y-1">
                <label className="text-sm font-medium">
                  {label}
                  {required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </label>
                <input
                  name={key}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  required={required}
                />
                {addValueFetcher.data?.errors?.[key] && (
                  <p className="text-xs text-destructive">
                    {addValueFetcher.data.errors[key]}
                  </p>
                )}
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Slug *</label>
                <input
                  name="val_slug"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="e.g. mild"
                  required
                />
                {addValueFetcher.data?.errors?.val_slug && (
                  <p className="text-xs text-destructive">
                    {addValueFetcher.data.errors.val_slug}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Sort Order</label>
                <input
                  name="val_sortOrder"
                  type="number"
                  min={0}
                  defaultValue={0}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={addValueFetcher.state !== "idle"}
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
            >
              {addValueFetcher.state !== "idle" ? "Adding..." : "Add"}
            </button>
          </addValueFetcher.Form>
        )}

        {attribute.values.length === 0 ? (
          <p className="text-sm text-muted-foreground">No values yet.</p>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Label</th>
                  <th className="px-4 py-2 font-medium">Slug</th>
                  <th className="px-4 py-2 font-medium">Sort</th>
                  <th className="px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {attribute.values.map((val) => (
                  <tr key={val.id} className="border-b last:border-0">
                    <td className="px-4 py-2">
                      {val.label?.en ??
                        val.label?.km ??
                        val.label?.zh ??
                        val.label?.id}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {val.slug}
                    </td>
                    <td className="px-4 py-2">{val.sortOrder}</td>
                    <td className="px-4 py-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedValue(val as AttributeValue);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DeleteValueDialog
        value={selectedValue}
        attributeId={attribute.id}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
}
