"use client";
import { use } from "react";
import ShiftDetail from "../../components/ShiftDetail";

const ShiftDetailPage: React.FC<{ params: Promise<{ id: string }> }> = ({ params }) => {
  const { id } = use(params);
  return <ShiftDetail id={id} />;
};

export default ShiftDetailPage;
