import { ToolPage, toolMetadata } from '@/components/tools/ToolPage';
import BatteryLifespanCalculator from '@/components/tools/BatteryLifespanCalculator';

const SLUG = 'battery-lifespan-calculator';

export const metadata = toolMetadata(SLUG);

export default function Page() {
  return (
    <ToolPage slug={SLUG}>
      <BatteryLifespanCalculator />
    </ToolPage>
  );
}
