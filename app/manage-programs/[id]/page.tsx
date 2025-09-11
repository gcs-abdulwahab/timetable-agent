import ProgramManager from '../../components/ProgramManager';

interface PageProps {
  params: { id: string };
}

export default function ManageProgramsPage({ params }: PageProps) {
  return (
    <div className="max-w-2xl mx-auto mt-8">
      <ProgramManager id={params.id} />
    </div>
  );
}
