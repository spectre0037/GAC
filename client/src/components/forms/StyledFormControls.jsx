export function StyledLabel({ children, styles }) {
  return (
    <label
      className="text-sm font-medium"
      style={{ color: styles?.paragraphColor || undefined, fontFamily: styles?.paragraphFont || undefined }}
    >
      {children}
    </label>
  );
}

export function StyledInput({ styles, className = '', ...props }) {
  return (
    <input
      {...props}
      className={`rounded-md border px-3 py-2 text-sm ${className}`}
      style={{
        color: styles?.inputTextColor || undefined,
        backgroundColor: styles?.inputBackgroundColor || undefined,
        borderColor: styles?.inputBorderColor || undefined,
      }}
    />
  );
}

export function StyledSelect({ styles, children, className = '', ...props }) {
  return (
    <select
      {...props}
      className={`rounded-md border px-3 py-2 text-sm ${className}`}
      style={{
        color: styles?.inputTextColor || undefined,
        backgroundColor: styles?.inputBackgroundColor || undefined,
        borderColor: styles?.inputBorderColor || undefined,
      }}
    >
      {children}
    </select>
  );
}

export function StyledTextarea({ styles, className = '', ...props }) {
  return (
    <textarea
      {...props}
      className={`min-h-[70px] rounded-md border px-3 py-2 text-sm ${className}`}
      style={{
        color: styles?.inputTextColor || undefined,
        backgroundColor: styles?.inputBackgroundColor || undefined,
        borderColor: styles?.inputBorderColor || undefined,
      }}
    />
  );
}