"use client";

import SubjectManagement from "../components/SubjectManagement";

import { useEffect, useState } from "react";

const Page: React.FC = () => {
	const [semesterId, setSemesterId] = useState<number | undefined>(undefined);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const params = new URLSearchParams(window.location.search);
			const id = params.get("semesterId");
			setSemesterId(id ? Number(id) : undefined);
		}
	}, []);

	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold mb-4">Manage Subjects</h1>
			<SubjectManagement semesterId={semesterId} />
		</div>
	);
};

export default Page;


