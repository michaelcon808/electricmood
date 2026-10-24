import { ToolPage, toolMetadata } from '@/components/tools/ToolPage';
import TyrePressureCalculator from '@/components/tools/TyrePressureCalculator';

const SLUG = 'tire-pressure-calculator';

export const metadata = toolMetadata(SLUG);

export default function Page() {
  return (
    <ToolPage slug={SLUG}>
      <TyrePressureCalculator />
    </ToolPage>
  );
}
