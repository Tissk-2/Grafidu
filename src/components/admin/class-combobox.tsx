"use client";

import CustomSelect from "@/components/ui/custom-select";

type Option = { id: string; name: string };

/**
 * Pemilih kelas pada form akun — kini tipis di atas CustomSelect (dropdown
 * custom app-wide) dengan pencarian selalu aktif. API lama dipertahankan agar
 * pemanggil (account-form) tidak berubah.
 */
export default function ClassCombobox({
  id,
  value,
  options,
  onChange,
  placeholder = "Pilih kelas…",
  invalid = false,
}: {
  id: string;
  value: string;
  options: Option[];
  onChange: (classId: string) => void;
  placeholder?: string;
  invalid?: boolean;
}) {
  return (
    <CustomSelect
      id={id}
      value={value}
      options={options.map((o) => ({ value: o.id, label: o.name }))}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="Cari kelas…"
      searchable
      invalid={invalid}
    />
  );
}
