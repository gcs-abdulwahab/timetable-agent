
import * as React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "./shadcn-table";

export interface Department {
  id: string;
  name: string;
  shortName: string;
  offersBSDegree?: boolean;
}

interface DepartmentTableProps {
  departments: Department[];
}

export const DepartmentTable: React.FC<DepartmentTableProps> = ({ departments }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Short Name</TableCell>
          <TableCell>BS Degree</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {departments.map((dept) => (
          <TableRow key={dept.id}>
            <TableCell>{dept.id}</TableCell>
            <TableCell>{dept.name}</TableCell>
            <TableCell>{dept.shortName}</TableCell>
            <TableCell>{dept.offersBSDegree ? "Yes" : "No"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
