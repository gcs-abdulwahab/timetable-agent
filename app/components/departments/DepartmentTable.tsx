import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react"

export function DepartmentTable() {
  const [departments, setDepartments] = useState<any[]>([])
  const [name, setName] = useState("")
  const [shortName, setShortName] = useState("")
  const [offersBSDegree, setOffersBSDegree] = useState(true)
  const [editId, setEditId] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
    setIsDialogOpen(false)
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Departments</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm()
                setIsDialogOpen(true)
              }}
            >
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Department" : "Add Department"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Department Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                placeholder="Department Short Name"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={offersBSDegree}
                  onChange={e => setOffersBSDegree(e.target.checked)}
                  id="offersBSDegree"
                />
                <label htmlFor="offersBSDegree">Offers BS Degree</label>
              </div>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
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
            <TableRow key={dept.id}>
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
                    setIsDialogOpen(true)
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
