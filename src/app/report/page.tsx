import { GanttReports } from './_components/GanttReports';
import { ProduceReports } from './_components/ProduceReports';

export async function generateStaticParams() {
  return [];
}
export const revalidate = 60;
export const dynamicParams = false;

export default async function _() {
  return (
    <div className="mx-auto mt-6 flex w-fit flex-col gap-4">
      <ProduceReports />
      <GanttReports />
    </div>
  );
}
