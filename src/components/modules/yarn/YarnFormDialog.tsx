"use client";

import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import type { YarnForm } from "./yarn.types";

interface YarnFormDialogProps {
  open: boolean;
  form: YarnForm;
  onChange: Dispatch<SetStateAction<YarnForm>>;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isEditing: boolean;
}

export default function YarnFormDialog({
  open,
  form,
  onChange,
  onClose,
  onSubmit,
  isEditing,
}: YarnFormDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${isEditing ? "Cập nhật" : "Thêm"} chất liệu`}
      maxWidth="600px"
      contentClassName="max-h-[70vh] overflow-y-auto"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form="yarn-form">
            Lưu
          </Button>
        </>
      }
    >
      <form
        id="yarn-form"
        onSubmit={onSubmit}
        className="space-y-4 px-5 py-5 sm:px-7"
      >
        <FormField label="Tên chất liệu" required>
          <Input
            required
            maxLength={120}
            value={form.name}
            onChange={(event) =>
              onChange((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Nhập tên chất liệu"
            variant="standard"
            className="h-10"
          />
        </FormField>
        <FormField label="Mô tả">
          <Textarea
            value={form.description}
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            maxLength={500}
            rows={3}
            placeholder="Nhập mô tả (không bắt buộc)"
            className="w-full resize-y rounded-lg border border-gray/20 px-4 py-3 text-sm text-black outline-none placeholder:text-gray focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </FormField>
      </form>
    </Modal>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-semibold text-black">
        {label}
        {required ? <span className="ml-0.5 text-[#C86F5E]">*</span> : null}
      </span>
      {children}
    </label>
  );
}
