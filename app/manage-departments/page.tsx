"use client"
import { DepartmentTable } from "@/app/components/departments/DepartmentTable"

export default function ManageDepartmentsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Departments</h1>
      <DepartmentTable />
    </div>
  )
}
