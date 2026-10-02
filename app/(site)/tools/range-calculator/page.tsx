import { ToolPage, toolMetadata } from '@/components/tools/ToolPage';
import RangeCalculator from '@/components/tools/RangeCalculator';

const SLUG = 'range-calculator';

export const metadata = toolMetadata(SLUG);

export default function Page() {
  return (
    <ToolPage slug={SLUG}>
      <RangeCalculator />
    </ToolPage>
  );
}
