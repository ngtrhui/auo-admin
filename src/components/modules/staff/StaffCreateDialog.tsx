"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

import type { StaffForm, StaffRole } from "./staff.types";

type StaffCreateDialogProps = {
  open: boolean;
  form: StaffForm;
  setForm: Dispatch<SetStateAction<StaffForm>>;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const inputClassName =
  "h-10 w-full rounded-lg border border-gray/20 bg-white px-3 text-sm text-black outline-none transition placeholder:text-gray/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/10";

export default function StaffCreateDialog({
  open,
  form,
  setForm,
  onClose,
  onSubmit,
}: StaffCreateDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cấp tài khoản nhân viên"
      maxWidth="560px"
      className="w-full"
      contentClassName="max-h-[70vh] overflow-y-auto"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form="create-staff-form">
            Tạo tài khoản
          </Button>
        </>
      }
    >
      <form
        id="create-staff-form"
        onSubmit={onSubmit}
        className="space-y-4 px-5 py-5 sm:px-7"
      >
        <FormField label="Họ và tên" required>
          <Input
            required
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            label="Ví dụ: Nguyễn Minh Anh"
            className={inputClassName}
          />
        </FormField>
        <FormField label="Email" required>
          <Input
            required
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            label="ten@congty.vn"
            className={inputClassName}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Số điện thoại">
            <input
              type="tel"
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({ ...current, phone: event.target.value }))
              }
              placeholder="090 123 4567"
              className={inputClassName}
            />
          </FormField>
        </div>
        <FormField label="Vai trò tài khoản" required>
          <select
            required
            value={form.role}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                role: event.target.value as StaffRole,
              }))
            }
            className={inputClassName}
          >
            <option value="Nhân viên">Nhân viên</option>
            <option value="Quản lý">Quản lý</option>
            <option value="Quản trị viên">Quản trị viên</option>
          </select>
        </FormField>
        <div className="rounded-lg border border-[#E9E4DF] bg-[#FAF8F6] px-3.5 py-3 text-xs leading-5 text-gray">
          Tài khoản được tạo sẽ có trạng thái hoạt động trong bản xem trước này.
        </div>
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
  children: React.ReactNode;
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
