import { ToolPage, toolMetadata } from '@/components/tools/ToolPage';
import HillClimbCalculator from '@/components/tools/HillClimbCalculator';

const SLUG = 'hill-climb-calculator';

export const metadata = toolMetadata(SLUG);

export default function Page() {
  return (
    <ToolPage slug={SLUG}>
      <HillClimbCalculator />
    </ToolPage>
  );
}
