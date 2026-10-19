"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";

import { Button } from "@/components/ui/Button";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Select } from "@/components/ui/Select";

import type { StaffForm } from "./staff.types";

type StaffCreateDialogProps = {
  open: boolean;
  form: StaffForm;
  setForm: Dispatch<SetStateAction<StaffForm>>;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

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
      title="Thêm nhân viên"
      maxWidth="600px"
      className="w-full"
      contentClassName="max-h-[70vh] overflow-y-auto"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form="create-staff-form">
            Thêm nhân viên
          </Button>
        </>
      }
    >
      <form
        id="create-staff-form"
        onSubmit={onSubmit}
        className="space-y-4 px-5 py-5 sm:px-7"
      >
        <FormField label="Mã nhân viên" required>
          <Input
            required
            value={form.employeeCode}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                employeeCode: event.target.value,
              }))
            }
            placeholder="NV-00125"
            variant="standard"
            className="h-10 w-full "
          />
        </FormField>

        <FormField label="Họ và tên" required>
          <Input
            required
            value={form.fullName}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                fullName: event.target.value,
              }))
            }
            placeholder="Ví dụ: Nguyễn Minh Anh"
            variant="standard"
            className="h-10 w-full "
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Email" required>
            <Input
              required
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              placeholder="abc@gmail.com"
              variant="standard"
              className="h-10 w-full "
            />
          </FormField>
          <FormField label="Số điện thoại" required>
            <Input
              required
              type="tel"
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
              placeholder="090 123 4567"
              variant="standard"
              className="h-10 w-full "
            />
          </FormField>
        </div>

        <FormField label="Mật khẩu" required>
          <PasswordInput
            required
            minLength={8}
            autoComplete="new-password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            placeholder="Tối thiểu 8 ký tự"
            variant="standard"
            className="h-10 w-full"
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Giới tính" required>
            <Select
              options={[
                { value: "Nam", label: "Nam" },
                { value: "Nữ", label: "Nữ" },
              ]}
              placeholder="Chọn giới tính"
              required
              value={form.gender}
              onChange={(gender) =>
                setForm((current) => ({
                  ...current,
                  gender,
                }))
              }
              className="h-10 w-full "
              popoverZIndex={110}
            />
          </FormField>
          <FormField label="Ngày sinh" required>
            <DatePickerField
              label=""
              placeholder="Chọn ngày sinh"
              value={form.dateOfBirth}
              onChange={(dateOfBirth) =>
                setForm((current) => ({
                  ...current,
                  dateOfBirth,
                }))
              }
              className="h-10 w-full "
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Ngày vào làm" required>
            <DatePickerField
              label=""
              placeholder="Chọn ngày vào làm"
              value={form.hireDate}
              onChange={(hireDate) =>
                setForm((current) => ({
                  ...current,
                  hireDate,
                }))
              }
              className="h-10 w-full "
            />
          </FormField>
          <FormField label="Vai trò tài khoản" required>
            <Input readOnly value={form.role} className="h-10 w-full " />
          </FormField>
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
