import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StyledLabel, StyledInput, StyledSelect, StyledTextarea } from './StyledFormControls';

export const SYSTEM_FIELD_DEFS = [
  { type: 'system_full_name', label: 'Full Name', required: true },
  { type: 'system_gender', label: 'Gender', required: true },
  { type: 'system_reg_no', label: 'Registration No.', required: false },
  { type: 'system_group_name', label: 'Group Name', required: false },
  { type: 'system_group_members', label: 'Group Members', required: false },
  { type: 'system_whatsapp', label: 'WhatsApp Number', required: true },
  { type: 'system_emergency_name', label: 'Emergency Contact Name', required: true },
  { type: 'system_emergency_number', label: 'Emergency Contact Number', required: true },
  { type: 'system_medical_info', label: 'Medical Info', required: false },
  { type: 'system_waiver', label: 'Safety Waiver', required: true },
];

export function defaultFormSchema() {
  return {
    heading: '',
    introText: '',
    tags: [],
    backgroundColor: '#ffffff',
    headerImageUrl: null,
    headerHeightPercent: 25,
    styles: {
      headingColor: '',
      headingFont: '',
      paragraphColor: '',
      paragraphFont: '',
      inputTextColor: '',
      inputBackgroundColor: '',
      inputBorderColor: '',
      dividerColor: '',
    },
    pages: [
      {
        id: crypto.randomUUID(),
        title: '',
        blocks: SYSTEM_FIELD_DEFS.map((def) => ({ id: crypto.randomUUID(), type: def.type })),
      },
    ],
  };
}

export default function FormRenderer({
  schema,
  values,
  onChange,
  readOnly = false,
  fixedValues = {},
  onFixedChange = () => {},
  groupMemberNames = [],
  onAddGroupMember = () => {},
  onUpdateGroupMember = () => {},
  onRemoveGroupMember = () => {},
}) {
  const [pageIndex, setPageIndex] = useState(0);

  if (!schema) return null;

  const styles = schema.styles || {};
  const pages = schema.pages?.length > 0 ? schema.pages : [{ id: 'default', title: '', blocks: [] }];
  const safeIndex = Math.min(pageIndex, pages.length - 1);
  const currentPage = pages[safeIndex];
  const isFirst = safeIndex === 0;
  const isLast = safeIndex === pages.length - 1;

  function updateField(id, value) {
    if (readOnly) return;
    onChange?.(id, value);
  }

  const headerHeight = schema.headerHeightPercent || 25;
  const inputStyle = {
    color: styles.inputTextColor || undefined,
    backgroundColor: styles.inputBackgroundColor || undefined,
    borderColor: styles.inputBorderColor || undefined,
  };
  const headingStyle = { color: styles.headingColor || undefined, fontFamily: styles.headingFont || undefined };
  const paragraphStyle = { color: styles.paragraphColor || undefined, fontFamily: styles.paragraphFont || undefined };

  function renderSystemBlock(block) {
    const def = SYSTEM_FIELD_DEFS.find((d) => d.type === block.type);
    const req = def?.required ? <span className="text-destructive">*</span> : null;

    switch (block.type) {
      case 'system_full_name':
        return (
          <div key={block.id} className="flex flex-col gap-2">
            <StyledLabel styles={styles}>Full Name {req}</StyledLabel>
            <StyledInput styles={styles} value={fixedValues.fullName || ''} onChange={(e) => onFixedChange('fullName', e.target.value)} disabled={readOnly} required />
          </div>
        );
      case 'system_gender':
        return (
          <div key={block.id} className="flex flex-col gap-2">
            <StyledLabel styles={styles}>Gender {req}</StyledLabel>
            <StyledSelect styles={styles} value={fixedValues.gender || ''} onChange={(e) => onFixedChange('gender', e.target.value)} disabled={readOnly} required>
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </StyledSelect>
          </div>
        );
      case 'system_reg_no':
        return (
          <div key={block.id} className="flex flex-col gap-2">
            <StyledLabel styles={styles}>Registration No. (optional)</StyledLabel>
            <StyledInput styles={styles} value={fixedValues.regNo || ''} onChange={(e) => onFixedChange('regNo', e.target.value)} disabled={readOnly} />
          </div>
        );
      case 'system_group_name':
        return (
          <div key={block.id} className="flex flex-col gap-2">
            <StyledLabel styles={styles}>Group Name (optional)</StyledLabel>
            <StyledInput styles={styles} value={fixedValues.groupName || ''} onChange={(e) => onFixedChange('groupName', e.target.value)} disabled={readOnly} />
          </div>
        );
      case 'system_group_members':
        return (
          <div key={block.id} className="flex flex-col gap-2">
            <StyledLabel styles={styles}>Group Members (optional)</StyledLabel>
            {groupMemberNames.map((name, idx) => (
              <div key={idx} className="flex gap-2">
                <StyledInput
                  styles={styles}
                  className="flex-1"
                  value={name}
                  onChange={(e) => onUpdateGroupMember(idx, e.target.value)}
                  placeholder={`Group member ${idx + 1} name`}
                  disabled={readOnly}
                />
                {!readOnly && (
                  <Button type="button" variant="ghost" onClick={() => onRemoveGroupMember(idx)}>
                    ✕
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={onAddGroupMember} disabled={readOnly}>
              + Add Group Member
            </Button>
          </div>
        );
      case 'system_whatsapp':
        return (
          <div key={block.id} className="flex flex-col gap-2">
            <StyledLabel styles={styles}>WhatsApp Number {req}</StyledLabel>
            <StyledInput styles={styles} value={fixedValues.whatsappNumber || ''} onChange={(e) => onFixedChange('whatsappNumber', e.target.value)} disabled={readOnly} required />
          </div>
        );
      case 'system_emergency_name':
        return (
          <div key={block.id} className="flex flex-col gap-2">
            <StyledLabel styles={styles}>Emergency Contact Name {req}</StyledLabel>
            <StyledInput styles={styles} value={fixedValues.emergencyContactName || ''} onChange={(e) => onFixedChange('emergencyContactName', e.target.value)} disabled={readOnly} required />
          </div>
        );
      case 'system_emergency_number':
        return (
          <div key={block.id} className="flex flex-col gap-2">
            <StyledLabel styles={styles}>Emergency Contact Number {req}</StyledLabel>
            <StyledInput styles={styles} value={fixedValues.emergencyContactNumber || ''} onChange={(e) => onFixedChange('emergencyContactNumber', e.target.value)} disabled={readOnly} required />
          </div>
        );
      case 'system_medical_info':
        return (
          <div key={block.id} className="flex flex-col gap-2">
            <StyledLabel styles={styles}>Medical Info / Allergies (optional)</StyledLabel>
            <StyledTextarea styles={styles} value={fixedValues.medicalInfo || ''} onChange={(e) => onFixedChange('medicalInfo', e.target.value)} disabled={readOnly} />
          </div>
        );
      case 'system_waiver':
        return (
          <label key={block.id} className="flex items-start gap-2 text-sm" style={paragraphStyle}>
            <input
              type="checkbox"
              checked={fixedValues.waiverAccepted || false}
              onChange={(e) => onFixedChange('waiverAccepted', e.target.checked)}
              disabled={readOnly}
              required
              className="mt-1"
            />
            <span>
              I understand this is an outdoor hiking/trekking activity with inherent risks, and I
              voluntarily accept these risks for myself. I confirm the information provided above
              is accurate.
            </span>
          </label>
        );
      default:
        return null;
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border" style={{ backgroundColor: schema.backgroundColor || undefined }}>
      {schema.headerImageUrl && (
        <div style={{ height: `${headerHeight}vh`, minHeight: '120px', maxHeight: '50vh', overflow: 'hidden' }}>
          <img src={schema.headerImageUrl} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="p-6">
        {schema.heading && (
          <h2 className="mb-1 text-xl font-semibold" style={headingStyle}>
            {schema.heading}
          </h2>
        )}
        {schema.tags?.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {schema.tags.map((tag, i) => (
              <span key={i} className="rounded-full bg-black/10 px-2 py-0.5 text-xs" style={paragraphStyle}>
                {tag}
              </span>
            ))}
          </div>
        )}
        {schema.introText && (
          <p className="mb-4 text-sm opacity-90" style={paragraphStyle}>
            {schema.introText}
          </p>
        )}

        {pages.length > 1 && (
          <div className="mb-4 flex gap-1">
            {pages.map((p, i) => (
              <div key={p.id} className="h-1 flex-1 rounded-full bg-current" style={{ opacity: i <= safeIndex ? 1 : 0.2 }} />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {currentPage.blocks.map((block) => {
            if (block.type.startsWith('system_')) return renderSystemBlock(block);

            switch (block.type) {
              case 'heading':
                return (
                  <h3 key={block.id} className="text-lg font-medium" style={headingStyle}>
                    {block.content}
                  </h3>
                );
              case 'paragraph':
                return (
                  <p key={block.id} className="text-sm opacity-90" style={paragraphStyle}>
                    {block.content}
                  </p>
                );
              case 'divider':
                return <hr key={block.id} className="my-1" style={{ borderColor: styles.dividerColor || 'currentColor', opacity: 0.4 }} />;
              case 'image':
                return block.imageUrl ? (
                  <img
                    key={block.id}
                    src={block.imageUrl}
                    alt=""
                    className="rounded-md object-cover"
                    style={{ width: `${block.widthPercent || 100}%`, margin: '0 auto', display: 'block' }}
                  />
                ) : null;
              case 'select':
                return (
                  <div key={block.id} className="flex flex-col gap-2">
                    <label className="text-sm font-medium" style={paragraphStyle}>
                      {block.label} {block.required && <span className="text-destructive">*</span>}
                    </label>
                    <select
                      className="rounded-md border px-3 py-2 text-sm"
                      style={inputStyle}
                      value={values?.[block.id] || ''}
                      onChange={(e) => updateField(block.id, e.target.value)}
                      required={block.required}
                      disabled={readOnly}
                    >
                      <option value="">Select...</option>
                      {(block.options || []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              case 'textarea':
                return (
                  <div key={block.id} className="flex flex-col gap-2">
                    <label className="text-sm font-medium" style={paragraphStyle}>
                      {block.label} {block.required && <span className="text-destructive">*</span>}
                    </label>
                    <textarea
                      className="min-h-[80px] rounded-md border px-3 py-2 text-sm"
                      style={inputStyle}
                      placeholder={block.placeholder}
                      value={values?.[block.id] || ''}
                      onChange={(e) => updateField(block.id, e.target.value)}
                      required={block.required}
                      disabled={readOnly}
                    />
                  </div>
                );
              default:
                return (
                  <div key={block.id} className="flex flex-col gap-2">
                    <label className="text-sm font-medium" style={paragraphStyle}>
                      {block.label} {block.required && <span className="text-destructive">*</span>}
                    </label>
                    <input
                      type={block.type}
                      className="rounded-md border px-3 py-2 text-sm"
                      style={inputStyle}
                      placeholder={block.placeholder}
                      value={values?.[block.id] || ''}
                      onChange={(e) => updateField(block.id, e.target.value)}
                      required={block.required}
                      disabled={readOnly}
                    />
                  </div>
                );
            }
          })}

          {isLast && (
            <Button type="submit" disabled={readOnly}>
              {readOnly ? 'Register (preview)' : 'Register'}
            </Button>
          )}
        </div>

        {pages.length > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <Button type="button" variant="outline" size="sm" disabled={isFirst} onClick={() => setPageIndex((p) => p - 1)}>
              Back
            </Button>
            {!isLast && (
              <Button type="button" size="sm" onClick={() => setPageIndex((p) => p + 1)}>
                Next
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}