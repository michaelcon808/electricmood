import { ToolPage, toolMetadata } from '@/components/tools/ToolPage';
import WeightCapacityChecker from '@/components/tools/WeightCapacityChecker';

const SLUG = 'weight-capacity-calculator';

export const metadata = toolMetadata(SLUG);

export default function Page() {
  return (
    <ToolPage slug={SLUG}>
      <WeightCapacityChecker />
    </ToolPage>
  );
}
