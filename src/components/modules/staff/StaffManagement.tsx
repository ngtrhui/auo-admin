"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  FiBriefcase,
  FiCalendar,
  FiEye,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSearch,
  FiUserCheck,
  FiUserPlus,
  FiUserX,
  FiUsers,
} from "react-icons/fi";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import StatCard from "@/components/ui/StatCard";
import Table, { type ColumnDef } from "@/components/ui/Table";
import { showToast } from "@/components/ui/Toaster";

type StaffStatus = "active" | "inactive";
type StaffRole = "Quản trị viên" | "Quản lý" | "Nhân viên";
type StatusFilter = "all" | StaffStatus;

type StaffMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  role: StaffRole;
  status: StaffStatus;
  joinedAt: string;
  location: string;
};

type StaffForm = Pick<
  StaffMember,
  "name" | "email" | "phone" | "department" | "position" | "role"
>;

const INITIAL_STAFF: StaffMember[] = [
  {
    id: "NV-00124",
    name: "Nguyễn Minh Anh",
    email: "minhanh.nguyen@auo.vn",
    phone: "090 123 4567",
    department: "Nhân sự",
    position: "Trưởng phòng nhân sự",
    role: "Quản lý",
    status: "active",
    joinedAt: "12/03/2022",
    location: "TP. Hồ Chí Minh",
  },
  {
    id: "NV-00123",
    name: "Trần Hoàng Nam",
    email: "nam.tran@auo.vn",
    phone: "091 234 5678",
    department: "Công nghệ",
    position: "Lập trình viên",
    role: "Nhân viên",
    status: "active",
    joinedAt: "08/11/2023",
    location: "TP. Hồ Chí Minh",
  },
  {
    id: "NV-00122",
    name: "Lê Thu Hà",
    email: "ha.le@auo.vn",
    phone: "093 345 6789",
    department: "Kinh doanh",
    position: "Chuyên viên kinh doanh",
    role: "Nhân viên",
    status: "active",
    joinedAt: "21/06/2024",
    location: "Hà Nội",
  },
  {
    id: "NV-00121",
    name: "Phạm Quốc Bảo",
    email: "bao.pham@auo.vn",
    phone: "098 456 7890",
    department: "Vận hành",
    position: "Điều phối viên",
    role: "Nhân viên",
    status: "inactive",
    joinedAt: "17/01/2021",
    location: "Đà Nẵng",
  },
  {
    id: "NV-00120",
    name: "Võ Ngọc Mai",
    email: "mai.vo@auo.vn",
    phone: "097 567 8901",
    department: "Công nghệ",
    position: "Quản lý sản phẩm",
    role: "Quản lý",
    status: "active",
    joinedAt: "04/09/2022",
    location: "TP. Hồ Chí Minh",
  },
  {
    id: "NV-00119",
    name: "Đặng Gia Huy",
    email: "huy.dang@auo.vn",
    phone: "096 678 9012",
    department: "Tài chính",
    position: "Kế toán tổng hợp",
    role: "Nhân viên",
    status: "inactive",
    joinedAt: "15/04/2020",
    location: "Hà Nội",
  },
];

const EMPTY_FORM: StaffForm = {
  name: "",
  email: "",
  phone: "",
  department: "Công nghệ",
  position: "",
  role: "Nhân viên",
};

const STATUS_LABELS: Record<StaffStatus, string> = {
  active: "Đang hoạt động",
  inactive: "Đã vô hiệu hóa",
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getTodayLabel() {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
}

export default function StaffManagement() {
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<StaffForm>(EMPTY_FORM);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [staffToToggle, setStaffToToggle] = useState<StaffMember | null>(null);

  const activeCount = staff.filter(
    (member) => member.status === "active",
  ).length;
  const inactiveCount = staff.length - activeCount;

  const filteredStaff = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("vi");

    return staff.filter((member) => {
      const matchesSearch =
        !normalizedSearch ||
        [member.name, member.email, member.phone, member.id, member.position]
          .join(" ")
          .toLocaleLowerCase("vi")
          .includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "all" || member.status === statusFilter;
      const matchesDepartment =
        departmentFilter === "all" || member.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [departmentFilter, search, staff, statusFilter]);

  const handleCreateStaff = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const email = form.email.trim().toLocaleLowerCase("vi");
    if (
      staff.some((member) => member.email.toLocaleLowerCase("vi") === email)
    ) {
      showToast(
        "error",
        "Email này đã được sử dụng cho một tài khoản nhân viên.",
      );
      return;
    }

    const name = form.name.trim();
    const newStaff: StaffMember = {
      id: `NV-${String(Date.now()).slice(-5)}`,
      name,
      email,
      phone: form.phone.trim() || "Chưa cập nhật",
      department: form.department,
      position: form.position.trim(),
      role: form.role,
      status: "active",
      joinedAt: getTodayLabel(),
      location: "Chưa cập nhật",
    };

    setStaff((currentStaff) => [newStaff, ...currentStaff]);
    setStatusFilter("all");
    setDepartmentFilter("all");
    setSearch("");
    setForm(EMPTY_FORM);
    setIsCreateOpen(false);
    showToast("success", "Đã thêm nhân viên vào danh sách mẫu.");
  };

  const handleToggleStatus = () => {
    if (!staffToToggle) return;

    const nextStatus: StaffStatus =
      staffToToggle.status === "active" ? "inactive" : "active";
    setStaff((currentStaff) =>
      currentStaff.map((member) =>
        member.id === staffToToggle.id
          ? { ...member, status: nextStatus }
          : member,
      ),
    );
    showToast(
      "success",
      nextStatus === "active"
        ? "Đã kích hoạt tài khoản trong danh sách mẫu."
        : "Đã vô hiệu hóa tài khoản trong danh sách mẫu.",
    );
    setStaffToToggle(null);
  };

  const statusTabs: { label: string; value: StatusFilter; count: number }[] = [
    { label: "Tất cả", value: "all", count: staff.length },
    { label: "Đang hoạt động", value: "active", count: activeCount },
    { label: "Đã vô hiệu hóa", value: "inactive", count: inactiveCount },
  ];

  const staffColumns: ColumnDef<StaffMember>[] = [
    {
      key: "name",
      label: "Nhân viên",
      width: 300,
      headerClassName: "!justify-start !text-left",
      render: (member) => {
        const index = filteredStaff.findIndex((item) => item.id === member.id);
        const avatarClassName =
          index % 3 === 0
            ? "bg-[#F2E9E4] text-[#845F4E]"
            : index % 3 === 1
              ? "bg-[#E8EDF5] text-[#587094]"
              : "bg-[#E8F1EA] text-[#55785C]";

        return (
          <div className="flex items-center gap-3">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarClassName}`}
              aria-hidden
            >
              {getInitials(member.name)}
            </div>
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => setSelectedStaff(member)}
                className="max-w-full truncate text-left text-sm font-semibold text-black hover:text-primary hover:underline"
              >
                {member.name}
              </button>
              <p className="mt-0.5 truncate text-xs text-gray">
                {member.email}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "joinedAt",
      label: "Ngày vào làm",
      width: 160,
      headerClassName: "!justify-start !text-left",
      render: (member) => (
        <span className="text-sm text-gray">{member.joinedAt}</span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      width: 180,
      headerClassName: "!justify-start !text-left",
      render: (member) => <StatusBadge status={member.status} />,
    },
    {
      key: "actions",
      label: "Thao tác",
      width: 120,
      align: "right",
      headerClassName: "!justify-end !text-right",
      render: (member) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setSelectedStaff(member)}
            aria-label={`Xem hồ sơ ${member.name}`}
            title="Xem hồ sơ"
            className="inline-flex size-9 items-center justify-center rounded-lg text-gray transition hover:bg-primary-light hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <FiEye className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setStaffToToggle(member)}
            aria-label={
              member.status === "active"
                ? `Vô hiệu hóa ${member.name}`
                : `Kích hoạt ${member.name}`
            }
            title={
              member.status === "active"
                ? "Vô hiệu hóa tài khoản"
                : "Kích hoạt tài khoản"
            }
            className={`inline-flex size-9 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              member.status === "active"
                ? "text-gray hover:bg-[#FFF0ED] hover:text-[#C86F5E]"
                : "text-gray hover:bg-[#E8F5EF] hover:text-[#32845A]"
            }`}
          >
            {member.status === "active" ? (
              <FiUserX className="size-4" aria-hidden />
            ) : (
              <FiUserCheck className="size-4" aria-hidden />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-full flex-col gap-6 pb-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
          Quản lý nhân viên
        </h1>

        <Button
          leftIcon={<FiUserPlus className="size-4" />}
          onClick={() => setIsCreateOpen(true)}
          className="w-full sm:w-auto"
        >
          Cấp tài khoản mới
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Tổng nhân viên"
          value={staff.length}
          icon={FiUsers}
          variant="primary-light"
          showGrowth={false}
        />
        <StatCard
          title="Đang hoạt động"
          value={activeCount}
          icon={FiUserCheck}
          variant="green-light"
          showGrowth={false}
        />
        <StatCard
          title="Đã vô hiệu hóa"
          value={inactiveCount}
          icon={FiUserX}
          variant="coral-light"
          showGrowth={false}
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray/15 bg-white shadow-[0_4px_18px_rgba(30,24,22,0.04)]">
        <div className="flex flex-col gap-4 border-b border-gray/10 px-4 py-4 sm:px-6 sm:pt-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-bold text-black">
                Danh sách nhân viên
              </h2>
              <p className="mt-1 text-xs text-gray">
                Hiển thị {filteredStaff.length} trên {staff.length} nhân viên
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative block sm:w-64">
                <Input
                  leftIcon={<FiSearch />}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  label="Tìm tên nhân viên..."
                  aria-label="Tìm nhân viên"
                  className="h-10 w-full  bg-white pl-9 pr-3 text-sm text-black outline-none transition"
                />
              </label>
            </div>
          </div>

          <div
            role="tablist"
            aria-label="Lọc trạng thái nhân viên"
            className="flex w-full gap-1 overflow-x-auto sm:w-fit"
          >
            {statusTabs.map((tab) => {
              const isSelected = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    isSelected
                      ? "bg-primary-light text-primary"
                      : "text-gray hover:bg-[#F8F7F6] hover:text-black"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      isSelected
                        ? "bg-white text-primary"
                        : "bg-gray/10 text-gray"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {filteredStaff.length > 0 ? (
          <div className="">
            <Table columns={staffColumns} data={filteredStaff} />
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#F5F3F2] text-gray">
              <FiSearch className="size-5" aria-hidden />
            </div>
            <p className="mt-3 text-sm font-semibold text-black">
              Không tìm thấy nhân viên
            </p>
            <p className="mt-1 text-xs text-gray">
              Thử thay đổi từ khóa hoặc bộ lọc của bạn.
            </p>
          </div>
        )}
      </section>

      <Modal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Cấp tài khoản nhân viên"
        maxWidth="560px"
        className="w-full"
        contentClassName="max-h-[70vh] overflow-y-auto"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
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
          onSubmit={handleCreateStaff}
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
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
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
                  setForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
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
            Tài khoản được tạo sẽ có trạng thái hoạt động trong bản xem trước
            này.
          </div>
        </form>
      </Modal>

      <Modal
        open={selectedStaff !== null}
        onClose={() => setSelectedStaff(null)}
        title="Thông tin nhân viên"
        maxWidth="600px"
        className="w-full"
        contentClassName="max-h-[75vh] overflow-y-auto"
      >
        {selectedStaff ? <StaffProfile staff={selectedStaff} /> : null}
      </Modal>

      <ConfirmDialog
        open={staffToToggle !== null}
        title={
          staffToToggle?.status === "active"
            ? "Vô hiệu hóa tài khoản?"
            : "Kích hoạt tài khoản?"
        }
        message={
          staffToToggle?.status === "active"
            ? `Tài khoản của ${staffToToggle.name} sẽ không thể đăng nhập sau khi vô hiệu hóa.`
            : `Tài khoản của ${staffToToggle?.name} sẽ được phép đăng nhập trở lại.`
        }
        confirmText={
          staffToToggle?.status === "active" ? "Vô hiệu hóa" : "Kích hoạt"
        }
        confirmVariant={
          staffToToggle?.status === "active" ? "danger" : "primary"
        }
        onConfirm={handleToggleStatus}
        onCancel={() => setStaffToToggle(null)}
      />
    </div>
  );
}

const inputClassName =
  "h-10 w-full rounded-lg border border-gray/20 bg-white px-3 text-sm text-black outline-none transition placeholder:text-gray/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/10";

function StatusBadge({ status }: { status: StaffStatus }) {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        isActive ? "bg-[#EAF6EF] text-[#32845A]" : "bg-[#F2F2F2] text-[#727272]"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          isActive ? "bg-[#3D9A68]" : "bg-[#949494]"
        }`}
      />
      {STATUS_LABELS[status]}
    </span>
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

function StaffProfile({ staff }: { staff: StaffMember }) {
  return (
    <div className="px-5 py-5 sm:px-7">
      <div className="flex flex-col gap-4 rounded-xl bg-[#FAF8F6] p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#EDE6E1] text-base font-bold text-primary">
          {getInitials(staff.name)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-black">
            {staff.name}
          </h3>
          <p className="mt-0.5 truncate text-sm text-gray">{staff.position}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={staff.status} />
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-primary">
              {staff.role}
            </span>
          </div>
        </div>
        <span className="text-xs font-medium text-gray">{staff.id}</span>
      </div>

      <div className="mt-5">
        <h4 className="text-xs font-bold uppercase tracking-wide text-gray">
          Thông tin cá nhân
        </h4>
        <dl className="mt-2 divide-y divide-gray/10">
          <ProfileField icon={<FiMail />} label="Email" value={staff.email} />
          <ProfileField
            icon={<FiPhone />}
            label="Điện thoại"
            value={staff.phone}
          />
          <ProfileField
            icon={<FiBriefcase />}
            label="Phòng ban"
            value={staff.department}
          />
          <ProfileField
            icon={<FiMapPin />}
            label="Địa điểm"
            value={staff.location}
          />
          <ProfileField
            icon={<FiCalendar />}
            label="Ngày vào làm"
            value={staff.joinedAt}
          />
        </dl>
      </div>
    </div>
  );
}

function ProfileField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#F5F3F2] text-gray">
        {icon}
      </span>
      <dt className="w-28 shrink-0 text-xs text-gray">{label}</dt>
      <dd className="min-w-0 break-all text-sm font-medium text-black">
        {value}
      </dd>
    </div>
  );
}
