import React, { useRef } from "react";

/** file input with the native button appearance */
export default function FileInputButton({
  children,
  className,
  style,
  onUpload,
  ...inputProps
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  onUpload: (files: File[]) => unknown;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        aria-hidden="true"
        onChange={(e) => {
          if (!e.target.files || e.target.files.length === 0) return;
          const files = Array.from(e.target.files);
          e.target.value = ""; // clear files right away
          onUpload?.(files);
        }}
        {...inputProps}
      />
      <button
        type="button"
        style={style}
        className={className}
        onClick={() => fileInputRef.current?.click()}
      >
        {children}
      </button>
    </>
  );
}
