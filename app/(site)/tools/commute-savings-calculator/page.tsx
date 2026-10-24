import { ToolPage, toolMetadata } from '@/components/tools/ToolPage';
import CommuteSavingsCalculator from '@/components/tools/CommuteSavingsCalculator';

const SLUG = 'commute-savings-calculator';

export const metadata = toolMetadata(SLUG);

export default function Page() {
  return (
    <ToolPage slug={SLUG}>
      <CommuteSavingsCalculator />
    </ToolPage>
  );
}
