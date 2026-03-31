import { getVisaBadgeColor, getVisaOrdinal } from '@/utils/visa-helpers';

type VisaType = Parameters<typeof getVisaOrdinal>[0];

export function OrdinalBadge({ visaType }: { visaType: VisaType }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded ${getVisaBadgeColor(visaType)} text-white shrink-0`}
      style={{ width: 28, height: 20, fontSize: 10, fontWeight: 700, borderRadius: 4 }}
    >
      {getVisaOrdinal(visaType)}
    </span>
  );
}
