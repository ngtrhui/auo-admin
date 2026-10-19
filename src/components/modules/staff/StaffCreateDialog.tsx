"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

import type { StaffForm } from "./staff.types";

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
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Mã nhân viên" required>
            <input
              required
              value={form.employeeCode}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  employeeCode: event.target.value,
                }))
              }
              placeholder="NV-00125"
              className={inputClassName}
            />
          </FormField>
          <FormField label="Chức vụ" required>
            <input
              required
              value={form.position}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  position: event.target.value,
                }))
              }
              placeholder="Ví dụ: Nhân viên kinh doanh"
              className={inputClassName}
            />
          </FormField>
        </div>

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
            label="Ví dụ: Nguyễn Minh Anh"
            className={inputClassName}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
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
          <FormField label="Số điện thoại" required>
            <input
              required
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

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Giới tính" required>
            <select
              required
              value={form.gender}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  gender: event.target.value,
                }))
              }
              className={inputClassName}
            >
              <option value="" disabled>
                Chọn giới tính
              </option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </FormField>
          <FormField label="Ngày sinh" required>
            <input
              required
              type="date"
              value={form.dateOfBirth}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  dateOfBirth: event.target.value,
                }))
              }
              className={inputClassName}
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Ngày vào làm" required>
            <input
              required
              type="date"
              value={form.hireDate}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  hireDate: event.target.value,
                }))
              }
              className={inputClassName}
            />
          </FormField>
          <FormField label="Vai trò tài khoản" required>
            <input
              readOnly
              value={form.role}
              className={`${inputClassName} bg-[#F8F7F6]`}
            />
          </FormField>
        </div>

        <div className="rounded-lg border border-[#E9E4DF] bg-[#FAF8F6] px-3.5 py-3 text-xs leading-5 text-gray">
          Thông tin hồ sơ lấy từ tài khoản người dùng liên kết. Vai trò hiện
          được hệ thống hỗ trợ là ADMIN.
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
