import { ToolPage, toolMetadata } from '@/components/tools/ToolPage';
import FrameSizeCalculator from '@/components/tools/FrameSizeCalculator';

const SLUG = 'ebike-frame-size-calculator';

export const metadata = toolMetadata(SLUG);

export default function Page() {
  return (
    <ToolPage slug={SLUG}>
      <FrameSizeCalculator />
    </ToolPage>
  );
}
