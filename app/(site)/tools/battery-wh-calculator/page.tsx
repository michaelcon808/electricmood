import { ToolPage, toolMetadata } from '@/components/tools/ToolPage';
import BatteryConverter from '@/components/tools/BatteryConverter';

const SLUG = 'battery-wh-calculator';

export const metadata = toolMetadata(SLUG);

export default function Page() {
  return (
    <ToolPage slug={SLUG}>
      <BatteryConverter />
    </ToolPage>
  );
}
