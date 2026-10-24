"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import type { PatternForm } from "./pattern.types";

interface PatternFormDialogProps {
  open: boolean;
  form: PatternForm;
  onChange: Dispatch<SetStateAction<PatternForm>>;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isEditing: boolean;
}

export default function PatternFormDialog({
  open,
  form,
  onChange,
  onClose,
  onSubmit,
  isEditing,
}: PatternFormDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${isEditing ? "Cập nhật" : "Thêm"} kiểu mẫu`}
      maxWidth="600px"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form="pattern-form">
            Lưu
          </Button>
        </>
      }
    >
      <form
        id="pattern-form"
        onSubmit={onSubmit}
        className="space-y-4 px-5 py-5 sm:px-7"
      >
        <label className="block space-y-1.5">
          <span className="block text-xs font-semibold text-black">
            Tên kiểu mẫu <span className="text-[#C86F5E]">*</span>
          </span>
          <Input
            required
            maxLength={120}
            value={form.name}
            onChange={(event) =>
              onChange((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Nhập tên kiểu mẫu"
            variant="standard"
            className="h-10"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="block text-xs font-semibold text-black">Mô tả</span>
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
          />
        </label>
      </form>
    </Modal>
  );
}
