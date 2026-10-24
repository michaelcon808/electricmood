import { ToolPage, toolMetadata } from '@/components/tools/ToolPage';
import AirlineBatteryChecker from '@/components/tools/AirlineBatteryChecker';

const SLUG = 'airline-battery-checker';

export const metadata = toolMetadata(SLUG);

export default function Page() {
  return (
    <ToolPage slug={SLUG}>
      <AirlineBatteryChecker />
    </ToolPage>
  );
}
