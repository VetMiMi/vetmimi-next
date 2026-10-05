import { Input } from "./Input";
import type { FieldProps } from "./Field";

type DateFieldProps = FieldProps & {
  // Sydney calendar dates as "YYYY-MM-DD", the format the input reads and
  // writes. Never a Date or toISOString(): in Sydney that names the day
  // before (brief §9).
  value?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
};

export function DateField({ value, ...props }: DateFieldProps) {
  return <Input type="date" defaultValue={value} {...props} />;
}
