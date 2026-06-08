import { format, isValid, parseISO } from "date-fns";
import type { Employee, LeaveRequestType } from "@/components/types/leave";

export function toIsoDateString(value: unknown): string {
  if (value == null || value === "") return "";
  if (value instanceof Date) return isValid(value) ? value.toISOString() : "";
  if (typeof value === "string") {
    const parsed = parseISO(value);
    if (isValid(parsed)) return parsed.toISOString();
    const fallback = new Date(value);
    return isValid(fallback) ? fallback.toISOString() : "";
  }
  return "";
}

function splitFullName(fullName?: string): { firstName: string; lastName: string } {
  if (!fullName?.trim()) return { firstName: "", lastName: "" };
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export function normalizeLeaveEmployee(emp: Record<string, unknown> | null | undefined): Employee {
  if (!emp) {
    return {
      _id: "",
      firstName: "",
      lastName: "",
      email: "",
      department: "",
      position: "",
      employeeId: "",
    };
  }

  const fromFullName = splitFullName(
    typeof emp.fullName === "string" ? emp.fullName : undefined
  );
  const firstName =
    (typeof emp.firstName === "string" && emp.firstName) || fromFullName.firstName;
  const lastName =
    (typeof emp.lastName === "string" && emp.lastName) || fromFullName.lastName;
  const id = emp._id ?? emp.id;

  return {
    _id: id != null ? String(id) : "",
    firstName,
    lastName,
    email: typeof emp.email === "string" ? emp.email : "",
    department: typeof emp.department === "string" ? emp.department : "",
    position: typeof emp.position === "string" ? emp.position : "",
    employeeId:
      emp.employeeId != null
        ? String(emp.employeeId)
        : id != null
          ? String(id)
          : "",
  };
}

const LEAVE_TYPES = [
  "vacation",
  "sick",
  "personal",
  "maternity",
  "paternity",
  "bereavement",
  "casual",
  "compensatory",
] as const;

type LeaveType = (typeof LEAVE_TYPES)[number];

function normalizeLeaveType(value: unknown): LeaveType {
  if (typeof value === "string" && LEAVE_TYPES.includes(value as LeaveType)) {
    return value as LeaveType;
  }
  return "personal";
}

function normalizeStatus(
  value: unknown
): LeaveRequestType["status"] {
  const statuses = ["pending", "approved", "rejected", "cancelled"] as const;
  if (typeof value === "string" && statuses.includes(value as LeaveRequestType["status"])) {
    return value as LeaveRequestType["status"];
  }
  return "pending";
}

export function normalizeLeaveRequest(raw: Record<string, unknown>): LeaveRequestType {
  const employeeRaw = (raw.employee ?? raw.Employee) as Record<string, unknown> | undefined;
  const approvedByRaw = (raw.approved_by ?? raw.approvedBy) as
    | Record<string, unknown>
    | undefined;

  const approvedBy = approvedByRaw
    ? normalizeLeaveEmployee(approvedByRaw)
    : undefined;
  const hasApprovedBy = approvedBy && approvedBy._id !== "";

  const id = raw._id ?? raw.id;

  return {
    _id: id != null ? String(id) : "",
    employee: normalizeLeaveEmployee(employeeRaw),
    leave_type: normalizeLeaveType(raw.leave_type ?? raw.leaveType),
    start_date: toIsoDateString(raw.start_date ?? raw.startDate),
    end_date: toIsoDateString(raw.end_date ?? raw.endDate),
    number_of_days: Number(raw.number_of_days ?? raw.numberOfDays ?? 0),
    reason: typeof raw.reason === "string" ? raw.reason : "",
    status: normalizeStatus(raw.status),
    approved_by: hasApprovedBy ? approvedBy : undefined,
    approved_at: toIsoDateString(raw.approved_at ?? raw.approvedAt) || undefined,
    rejection_reason:
      typeof (raw.rejection_reason ?? raw.rejectionReason) === "string"
        ? ((raw.rejection_reason ?? raw.rejectionReason) as string)
        : undefined,
    createdAt: toIsoDateString(raw.createdAt ?? raw.created_at) || "",
    updatedAt: toIsoDateString(raw.updatedAt ?? raw.updated_at) || "",
  };
}

export function normalizeLeaveList(data: unknown): LeaveRequestType[] {
  if (data == null) return [];
  if (Array.isArray(data)) {
    return data.map((item) =>
      normalizeLeaveRequest(item as Record<string, unknown>)
    );
  }
  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const list = obj.leaveRequests ?? obj.leave_requests;
    if (Array.isArray(list)) {
      return list.map((item) =>
        normalizeLeaveRequest(item as Record<string, unknown>)
      );
    }
    if (obj.id != null || obj._id != null || obj.leaveType != null || obj.leave_type != null) {
      return [normalizeLeaveRequest(obj)];
    }
  }
  return [];
}

export function formatLeaveDate(
  value: unknown,
  pattern: string,
  fallback = "—"
): string {
  const iso = toIsoDateString(value);
  if (!iso) return fallback;
  const date = parseISO(iso);
  if (!isValid(date)) return fallback;
  try {
    return format(date, pattern);
  } catch {
    return fallback;
  }
}
