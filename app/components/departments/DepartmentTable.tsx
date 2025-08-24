import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from 'react';
import AddDepartmentComponent from './AddDepartmentComponent';

export function DepartmentTable() {
  const [departments, setDepartments] = useState<any[]>([])
  const [name, setName] = useState("")
  const [shortName, setShortName] = useState("")
  const [offersBSDegree, setOffersBSDegree] = useState(true)
  const [editId, setEditId] = useState<number | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchDepartments()
  }, [])

  async function fetchDepartments() {
    const res = await fetch("/api/departments")
    const data = await res.json()
    setDepartments(data)
  }

  async function handleSave() {
    const method = editId ? "PATCH" : "POST"
    const body = editId
      ? { id: editId, name, shortName, offersBSDegree }
      : { name, shortName, offersBSDegree }

    await fetch("/api/departments", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    resetForm()
    fetchDepartments()
  }

  async function handleDelete(id: string) {
    await fetch("/api/departments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    fetchDepartments()
  }

  function resetForm() {
    setName("")
    setShortName("")
    setOffersBSDegree(true)
    setEditId(null)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-2">Manage Departments</h2>
      <div className="flex flex-wrap gap-6 items-start">
        <div className="bg-blue-50 border border-blue-200 rounded-xl shadow-sm p-6 w-full max-w-xs flex flex-col items-stretch">
          <button
            className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setShowAddModal(true)}
          >
            Add Department
          </button>
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <AddDepartmentComponent onDepartmentAdded={() => { fetchDepartments(); setShowAddModal(false); }} departments={departments} fetchDepartments={fetchDepartments} />
                <button
                  className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 w-full"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Short Name</TableHead>
            <TableHead>Offers BS Degree</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.map((dept) => (
            <TableRow key={dept.id} className={dept.offersBSDegree ? 'bg-green-100' : 'bg-yellow-100'}>
              <TableCell>{dept.name}</TableCell>
              <TableCell>{dept.shortName}</TableCell>
              <TableCell>{dept.offersBSDegree ? "Yes" : "No"}</TableCell>
              <TableCell className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditId(dept.id)
                    setName(dept.name)
                    setShortName(dept.shortName)
                    setOffersBSDegree(!!dept.offersBSDegree)
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(dept.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
