import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import FormRenderer, {
  SYSTEM_FIELD_DEFS,
  defaultFormSchema,
} from '@/components/forms/FormRenderer';
import ColorPickerInput from '@/components/forms/ColorPickerInput';
import AdminLayout from '@/components/admin/AdminLayout';

const BLOCK_TYPES = [
  { type: 'heading', label: '+ Heading' },
  { type: 'paragraph', label: '+ Paragraph' },
  { type: 'image', label: '+ Image' },
  { type: 'divider', label: '+ Divider' },
  { type: 'text', label: '+ Short Text' },
  { type: 'textarea', label: '+ Long Text' },
  { type: 'number', label: '+ Number' },
  { type: 'email', label: '+ Email' },
  { type: 'tel', label: '+ Phone' },
  { type: 'select', label: '+ Dropdown' },
];

const FONT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: "'Inter', sans-serif", label: 'Inter' },
  { value: "'DM Serif Display', serif", label: 'DM Serif Display' },
  { value: "'Playfair Display', serif", label: 'Playfair Display' },
  { value: "'Space Grotesk', sans-serif", label: 'Space Grotesk' },
  { value: "'Manrope', sans-serif", label: 'Manrope' },
  { value: "'Poppins', sans-serif", label: 'Poppins' },
  { value: "'Bebas Neue', sans-serif", label: 'Bebas Neue' },
  { value: "'JetBrains Mono', monospace", label: 'JetBrains Mono' },
  { value: "'IBM Plex Mono', monospace", label: 'IBM Plex Mono' },
];

function newBlock(type) {
  const id = crypto.randomUUID();

  if (type === 'heading' || type === 'paragraph') {
    return { id, type, content: '' };
  }

  if (type === 'image') {
    return {
      id,
      type,
      imageUrl: null,
      widthPercent: 100,
    };
  }

  if (type === 'divider') {
    return { id, type };
  }

  if (type === 'select') {
    return {
      id,
      type,
      label: '',
      placeholder: '',
      required: false,
      options: [],
    };
  }

  return {
    id,
    type,
    label: '',
    placeholder: '',
    required: false,
  };
}

function newPage() {
  return {
    id: crypto.randomUUID(),
    title: '',
    blocks: [],
  };
}

/* -------------------------------------------------------
   Reusable UI helpers
------------------------------------------------------- */

function SectionEyebrow({ children, color = 'blue' }) {
  const colorClass =
    color === 'emerald'
      ? 'text-emerald-600'
      : color === 'amber'
        ? 'text-amber-600'
        : 'text-[#3D6BB4]';

  const dotClass =
    color === 'emerald'
      ? 'bg-emerald-500'
      : color === 'amber'
        ? 'bg-amber-500'
        : 'bg-[#3D6BB4]';

  return (
    <div
      className={`mb-2 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] ${colorClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {children}
    </div>
  );
}

function Panel({ children, className = '' }) {
  return (
    <div
      className={`rounded-[24px] bg-white shadow-sm ring-1 ring-slate-200/70 ${className}`}
    >
      {children}
    </div>
  );
}

function PanelHeader({ eyebrow, title, description, children }) {
  return (
    <div className="border-b border-slate-100 px-5 py-5 md:px-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {eyebrow && <SectionEyebrow>{eyebrow}</SectionEyebrow>}

          <h2 className="text-base font-semibold tracking-tight text-[#1A2B48]">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {description}
            </p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <Label className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
      {children}
    </Label>
  );
}

const controlClass =
  'rounded-xl border-0 bg-[#F4F7F7] py-2.5 text-xs font-medium text-[#1A2B48] outline-none ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:bg-white focus:ring-[#3D6BB4]';

const selectClass =
  'w-full appearance-none rounded-xl border-0 bg-[#F4F7F7] px-3 py-2.5 text-xs font-medium text-[#1A2B48] outline-none ring-1 ring-slate-200 transition-all focus:bg-white focus:ring-[#3D6BB4]';

function StatusPill({ children, variant = 'blue' }) {
  const styles = {
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    slate: 'bg-slate-100 text-slate-600',
    navy: 'bg-[#1A2B48] text-white',
  };

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

export default function FormBuilder() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [schema, setSchema] = useState(defaultFormSchema());
  const [activePageIdx, setActivePageIdx] = useState(0);
  const [tagsInput, setTagsInput] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [formExists, setFormExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [eventId]);

  async function fetchAll() {
    setLoading(true);

    try {
      const [formRes, eventRes] = await Promise.all([
        api.get(`/forms/events/${eventId}`),
        api.get(`/events/${eventId}`),
      ]);

      setEvent(eventRes.data.event);

      if (formRes.data.form) {
        setSchema(formRes.data.form.schema);
        setTagsInput((formRes.data.form.schema.tags || []).join(', '));
        setIsPublished(formRes.data.form.isPublished);
        setIsClosed(formRes.data.form.isClosed);
        setFormExists(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load form.');
    } finally {
      setLoading(false);
    }
  }

  const activePage = schema.pages[activePageIdx];

  const placedSystemTypes = new Set(
    schema.pages.flatMap((p) => p.blocks.map((b) => b.type))
  );

  function updatePage(pageIdx, updates) {
    setSchema((prev) => ({
      ...prev,
      pages: prev.pages.map((p, i) =>
        i === pageIdx ? { ...p, ...updates } : p
      ),
    }));
  }

  function updateStyle(key, value) {
    setSchema((prev) => ({
      ...prev,
      styles: {
        ...prev.styles,
        [key]: value,
      },
    }));
  }

  function addPage() {
    setSchema((prev) => ({
      ...prev,
      pages: [...prev.pages, newPage()],
    }));

    setActivePageIdx(schema.pages.length);
  }

  function removePage(idx) {
    if (schema.pages.length === 1) return;

    setSchema((prev) => ({
      ...prev,
      pages: prev.pages.filter((_, i) => i !== idx),
    }));

    setActivePageIdx((prev) =>
      Math.max(0, prev - (idx <= prev ? 1 : 0))
    );
  }

  function addBlock(type) {
    const block = type.startsWith('system_')
      ? {
          id: crypto.randomUUID(),
          type,
        }
      : newBlock(type);

    updatePage(activePageIdx, {
      blocks: [...activePage.blocks, block],
    });
  }

  function updateBlock(id, updates) {
    updatePage(activePageIdx, {
      blocks: activePage.blocks.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      ),
    });
  }

  function removeBlock(id) {
    const block = activePage.blocks.find((b) => b.id === id);

    const def = SYSTEM_FIELD_DEFS.find(
      (d) => d.type === block?.type
    );

    if (def?.required) {
      alert(
        `"${def.label}" is required to collect for every registration and can't be removed — you can still move it anywhere.`
      );
      return;
    }

    updatePage(activePageIdx, {
      blocks: activePage.blocks.filter((b) => b.id !== id),
    });
  }

  function moveBlock(id, direction) {
    const idx = activePage.blocks.findIndex((b) => b.id === id);

    const swapWith =
      direction === 'up'
        ? idx - 1
        : idx + 1;

    if (
      swapWith < 0 ||
      swapWith >= activePage.blocks.length
    ) {
      return;
    }

    const blocks = [...activePage.blocks];

    [blocks[idx], blocks[swapWith]] = [
      blocks[swapWith],
      blocks[idx],
    ];

    updatePage(activePageIdx, { blocks });
  }

  function moveBlockToPage(blockId, targetPageIdx) {
    if (targetPageIdx === activePageIdx) return;

    const block = activePage.blocks.find(
      (b) => b.id === blockId
    );

    if (!block) return;

    setSchema((prev) => ({
      ...prev,
      pages: prev.pages.map((p, i) => {
        if (i === activePageIdx) {
          return {
            ...p,
            blocks: p.blocks.filter(
              (b) => b.id !== blockId
            ),
          };
        }

        if (i === targetPageIdx) {
          return {
            ...p,
            blocks: [...p.blocks, block],
          };
        }

        return p;
      }),
    }));
  }

  async function uploadImage(file) {
    const formData = new FormData();

    formData.append('image', file);

    const { data } = await api.post(
      `/forms/events/${eventId}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return data.url;
  }

  async function handleBlockImageUpload(id, file) {
    try {
      updateBlock(id, {
        imageUrl: await uploadImage(file),
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Image upload failed.'
      );
    }
  }

  async function handleHeaderImageUpload(file) {
    try {
      const url = await uploadImage(file);

      setSchema((prev) => ({
        ...prev,
        headerImageUrl: url,
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Image upload failed.'
      );
    }
  }

  function handleTagsBlur() {
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    setSchema((prev) => ({
      ...prev,
      tags,
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await api.put(`/forms/events/${eventId}`, {
        schema,
      });

      setFormExists(true);
      setMessage('Form saved.');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to save form.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublish() {
    setError('');

    if (!isPublished) {
      const missing = SYSTEM_FIELD_DEFS.filter(
        (d) =>
          d.required &&
          !placedSystemTypes.has(d.type)
      );

      if (missing.length > 0) {
        setError(
          `Can't publish — these required fields are missing from the form: ${missing
            .map((d) => d.label)
            .join(', ')}.`
        );
        return;
      }
    }

    try {
      const { data } = await api.patch(
        `/forms/events/${eventId}/publish`,
        {
          isPublished: !isPublished,
        }
      );

      setIsPublished(data.form.isPublished);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to update publish status.'
      );
    }
  }

  async function handleToggleClosed() {
    setError('');

    try {
      const { data } = await api.patch(
        `/forms/events/${eventId}/close`,
        {
          isClosed: !isClosed,
        }
      );

      setIsClosed(data.form.isClosed);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to update closed status.'
      );
    }
  }

  async function handleDeleteForm() {
    if (
      !window.confirm(
        'Permanently delete this form? This cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await api.delete(`/forms/events/${eventId}`);

      navigate('/admin/events');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to delete form.'
      );
    }
  }

  function copyPublicLink() {
    if (!event) return;

    navigator.clipboard.writeText(
      `${window.location.origin}/events/${event.slug}`
    );

    setLinkCopied(true);

    setTimeout(
      () => setLinkCopied(false),
      1500
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen px-5 py-8 md:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex min-h-[50vh] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#3D6BB4]" />
                <p className="text-xs text-slate-400">
                  Loading form...
                </p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen px-5 py-8 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">

          {/* ------------------------------------------------
              HEADER
          ------------------------------------------------ */}

          <div className="mb-7">
            <Link
              to="/admin/events"
              className="mb-5 inline-flex items-center gap-2 text-[10px] font-medium text-slate-400 transition-colors hover:text-[#3D6BB4]"
            >
              ← Back to Events
            </Link>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

              <div>
                <SectionEyebrow>
                  Registration Management
                </SectionEyebrow>

                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#1A2B48] md:text-4xl">
                  Registration Form Builder
                </h1>

                {event && (
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Customize the registration experience for{' '}
                    <span className="font-medium text-[#1A2B48]">
                      {event.title}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">

                {formExists && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteForm}
                    className="rounded-xl px-3 text-[10px] font-medium text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    Delete Form
                  </Button>
                )}

                {isPublished && (
                  <Button
                    variant="outline"
                    onClick={handleToggleClosed}
                    className="rounded-xl border-0 bg-[#F4F7F7] text-[10px] font-medium text-[#1A2B48] ring-1 ring-slate-200 hover:bg-white hover:ring-[#3D6BB4]"
                  >
                    {isClosed
                      ? 'Reopen Registration'
                      : 'Close Registration'}
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={handleTogglePublish}
                  className="rounded-xl border-0 bg-white text-[10px] font-medium text-[#1A2B48] ring-1 ring-slate-200 hover:bg-[#F4F7F7]"
                >
                  {isPublished
                    ? 'Unpublish'
                    : 'Publish'}
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-[#1A2B48] px-4 text-[10px] font-semibold text-white shadow-sm hover:bg-[#243a5d]"
                >
                  {saving ? 'Saving...' : 'Save Form'}
                </Button>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------
              STATUS
          ------------------------------------------------ */}

          {(isPublished || error || message) && (
            <div className="mb-6 flex flex-col gap-3">

              {isPublished && event && (
                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/70">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="flex items-center gap-2">
                      <StatusPill variant="emerald">
                        Published
                      </StatusPill>

                      {isClosed && (
                        <StatusPill variant="amber">
                          Closed
                        </StatusPill>
                      )}
                    </div>

                    <span className="hidden text-slate-200 md:block">
                      /
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Public Link
                      </p>

                      <code className="block truncate text-xs text-[#1A2B48]">
                        {`${window.location.origin}/events/${event.slug}`}
                      </code>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyPublicLink}
                      className="rounded-xl text-[10px] font-medium text-[#3D6BB4] hover:bg-[#EBF2F2]"
                    >
                      {linkCopied
                        ? 'Copied'
                        : 'Copy Link'}
                    </Button>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold">
                    !
                  </div>
                  <span className="text-xs">
                    {error}
                  </span>
                </div>
              )}

              {message && (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold">
                    ✓
                  </div>
                  <span className="text-xs">
                    {message}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------
              MAIN GRID
          ------------------------------------------------ */}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.8fr)]">

            {/* ================================================
                LEFT BUILDER
            ================================================ */}

            <div className="flex min-w-0 flex-col gap-5">

              {/* HEADER BANNER */}

              <Panel>
                <PanelHeader
                  eyebrow="Appearance"
                  title="Header Banner"
                  description="Full-width image with adjustable height."
                />

                <div className="flex flex-col gap-6 p-5 md:p-7">

                  <div className="flex flex-col gap-3">
                    <FieldLabel>
                      Banner Image
                    </FieldLabel>

                    {schema.headerImageUrl ? (
                      <div className="overflow-hidden rounded-2xl bg-[#F4F7F7] ring-1 ring-slate-200">
                        <img
                          src={schema.headerImageUrl}
                          alt=""
                          className="h-40 w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-32 items-center justify-center rounded-2xl bg-[#F4F7F7] ring-1 ring-dashed ring-slate-200">
                        <div className="text-center">
                          <p className="text-xs font-medium text-[#1A2B48]">
                            No banner image
                          </p>
                          <p className="mt-1 text-[10px] text-slate-400">
                            Upload an image below
                          </p>
                        </div>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files[0] &&
                        handleHeaderImageUpload(
                          e.target.files[0]
                        )
                      }
                      className="w-full rounded-xl bg-[#F4F7F7] px-3 py-2.5 text-xs text-slate-500 ring-1 ring-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-[#EBF2F2] file:px-3 file:py-1.5 file:text-[10px] file:font-medium file:text-[#3D6BB4]"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <FieldLabel>
                        Banner Height
                      </FieldLabel>

                      <span className="rounded-full bg-[#EBF2F2] px-2.5 py-1 text-[9px] font-semibold text-[#3D6BB4]">
                        {schema.headerHeightPercent}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min={10}
                      max={50}
                      value={schema.headerHeightPercent}
                      onChange={(e) =>
                        setSchema((prev) => ({
                          ...prev,
                          headerHeightPercent:
                            Number(e.target.value),
                        }))
                      }
                      className="h-1.5 w-full cursor-pointer accent-[#3D6BB4]"
                    />

                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>10%</span>
                      <span>50%</span>
                    </div>
                  </div>
                </div>
              </Panel>

              {/* HEADING & TAGS */}

              <Panel>
                <PanelHeader
                  eyebrow="Content"
                  title="Heading & Tags"
                  description="Control the primary information displayed on the registration page."
                />

                <div className="flex flex-col gap-5 p-5 md:p-7">

                  <div className="flex flex-col gap-2">
                    <FieldLabel>
                      Event Heading
                    </FieldLabel>

                    <Input
                      value={schema.heading}
                      onChange={(e) =>
                        setSchema((prev) => ({
                          ...prev,
                          heading: e.target.value,
                        }))
                      }
                      className={controlClass}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <FieldLabel>
                      Tags
                    </FieldLabel>

                    <Input
                      value={tagsInput}
                      onChange={(e) =>
                        setTagsInput(e.target.value)
                      }
                      onBlur={handleTagsBlur}
                      placeholder="Beginner Friendly, Overnight, Northern Areas"
                      className={controlClass}
                    />

                    <p className="text-[9px] text-slate-400">
                      Separate tags with commas.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <FieldLabel>
                      Intro Text
                    </FieldLabel>

                    <Textarea
                      value={schema.introText}
                      onChange={(e) =>
                        setSchema((prev) => ({
                          ...prev,
                          introText: e.target.value,
                        }))
                      }
                      className={`${controlClass} min-h-[110px] resize-none`}
                    />
                  </div>

                  <div className="border-t border-slate-100 pt-5">
                    <ColorPickerInput
                      label="Page Background Color"
                      value={schema.backgroundColor}
                      onChange={(v) =>
                        setSchema((prev) => ({
                          ...prev,
                          backgroundColor: v,
                        }))
                      }
                    />
                  </div>
                </div>
              </Panel>

              {/* TYPOGRAPHY */}

              <Panel>
                <PanelHeader
                  eyebrow="Design System"
                  title="Typography & Element Colors"
                  description="Customize fonts and colors used throughout the public registration form."
                />

                <div className="flex flex-col gap-6 p-5 md:p-7">

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    <div className="flex flex-col gap-2">
                      <FieldLabel>
                        Heading Font
                      </FieldLabel>

                      <select
                        className={selectClass}
                        value={schema.styles.headingFont}
                        onChange={(e) =>
                          updateStyle(
                            'headingFont',
                            e.target.value
                          )
                        }
                      >
                        {FONT_OPTIONS.map((f) => (
                          <option
                            key={f.value}
                            value={f.value}
                          >
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <ColorPickerInput
                      label="Heading Color"
                      value={
                        schema.styles.headingColor
                      }
                      onChange={(v) =>
                        updateStyle(
                          'headingColor',
                          v
                        )
                      }
                    />

                    <div className="flex flex-col gap-2">
                      <FieldLabel>
                        Paragraph Font
                      </FieldLabel>

                      <select
                        className={selectClass}
                        value={
                          schema.styles.paragraphFont
                        }
                        onChange={(e) =>
                          updateStyle(
                            'paragraphFont',
                            e.target.value
                          )
                        }
                      >
                        {FONT_OPTIONS.map((f) => (
                          <option
                            key={f.value}
                            value={f.value}
                          >
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <ColorPickerInput
                      label="Paragraph Color"
                      value={
                        schema.styles.paragraphColor
                      }
                      onChange={(v) =>
                        updateStyle(
                          'paragraphColor',
                          v
                        )
                      }
                    />
                  </div>

                  <div className="border-t border-slate-100 pt-5">
                    <SectionEyebrow>
                      Input Fields
                    </SectionEyebrow>

                    <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
                      <ColorPickerInput
                        label="Text Color"
                        value={
                          schema.styles.inputTextColor
                        }
                        onChange={(v) =>
                          updateStyle(
                            'inputTextColor',
                            v
                          )
                        }
                      />

                      <ColorPickerInput
                        label="Background"
                        value={
                          schema.styles
                            .inputBackgroundColor
                        }
                        onChange={(v) =>
                          updateStyle(
                            'inputBackgroundColor',
                            v
                          )
                        }
                      />

                      <ColorPickerInput
                        label="Border"
                        value={
                          schema.styles.inputBorderColor
                        }
                        onChange={(v) =>
                          updateStyle(
                            'inputBorderColor',
                            v
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-5">
                    <ColorPickerInput
                      label="Divider Color"
                      value={
                        schema.styles.dividerColor
                      }
                      onChange={(v) =>
                        updateStyle(
                          'dividerColor',
                          v
                        )
                      }
                    />
                  </div>
                </div>
              </Panel>

              {/* PAGES */}

              <Panel>
                <PanelHeader
                  eyebrow="Structure"
                  title="Pages"
                  description="Organize registration fields into multiple pages."
                />

                <div className="p-5 md:p-7">

                  <div className="mb-5 flex flex-wrap items-center gap-2">
                    {schema.pages.map(
                      (page, idx) => (
                        <div
                          key={page.id}
                          className="flex items-center gap-1"
                        >
                          <Button
                            type="button"
                            size="sm"
                            variant={
                              idx === activePageIdx
                                ? 'default'
                                : 'outline'
                            }
                            onClick={() =>
                              setActivePageIdx(idx)
                            }
                            className={
                              idx === activePageIdx
                                ? 'rounded-xl bg-[#1A2B48] text-[10px] hover:bg-[#243a5d]'
                                : 'rounded-xl border-0 bg-[#F4F7F7] text-[10px] text-slate-500 ring-1 ring-slate-200 hover:bg-white hover:text-[#1A2B48]'
                            }
                          >
                            {page.title ||
                              `Page ${idx + 1}`}
                          </Button>

                          {schema.pages.length >
                            1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removePage(idx)
                              }
                              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] text-slate-400 hover:bg-red-50 hover:text-red-600"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      )
                    )}

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addPage}
                      className="rounded-xl border-dashed border-slate-200 bg-white text-[10px] text-[#3D6BB4] hover:bg-[#EBF2F2]"
                    >
                      + Add Page
                    </Button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <FieldLabel>
                      Page Title
                    </FieldLabel>

                    <Input
                      placeholder="Page title (optional, shown as tab label)"
                      value={activePage.title}
                      onChange={(e) =>
                        updatePage(
                          activePageIdx,
                          {
                            title: e.target.value,
                          }
                        )
                      }
                      className={controlClass}
                    />
                  </div>
                </div>
              </Panel>

              {/* FIXED FIELDS */}

              <Panel>
                <PanelHeader
                  eyebrow="Required Fields"
                  title="Fixed Registration Fields"
                  description="Required system fields can be moved but cannot be removed."
                />

                <div className="flex flex-wrap gap-2 p-5 md:p-7">
                  {SYSTEM_FIELD_DEFS.map(
                    (def) => {
                      const placed =
                        placedSystemTypes.has(
                          def.type
                        );

                      return (
                        <Button
                          key={def.type}
                          variant="outline"
                          size="sm"
                          disabled={placed}
                          onClick={() =>
                            addBlock(def.type)
                          }
                          className={`rounded-xl border-0 text-[10px] font-medium ring-1 ${
                            placed
                              ? 'bg-slate-50 text-slate-300 ring-slate-100'
                              : 'bg-[#F4F7F7] text-[#1A2B48] ring-slate-200 hover:bg-[#EBF2F2] hover:text-[#3D6BB4]'
                          }`}
                        >
                          {placed
                            ? '✓ '
                            : '+ '}
                          {def.label}
                        </Button>
                      );
                    }
                  )}
                </div>
              </Panel>

              {/* ADD CONTENT */}

              <Panel>
                <PanelHeader
                  eyebrow="Content Blocks"
                  title="Add Content to This Page"
                  description="Build the registration page using reusable content and input blocks."
                />

                <div className="flex flex-wrap gap-2 p-5 md:p-7">
                  {BLOCK_TYPES.map(
                    (bt) => (
                      <Button
                        key={bt.type}
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          addBlock(bt.type)
                        }
                        className="rounded-xl border-0 bg-[#F4F7F7] text-[10px] font-medium text-[#1A2B48] ring-1 ring-slate-200 hover:bg-[#EBF2F2] hover:text-[#3D6BB4]"
                      >
                        {bt.label}
                      </Button>
                    )
                  )}
                </div>
              </Panel>

              {/* BLOCKS */}

              <div>
                <div className="mb-3 flex items-center justify-between px-1">
                  <div>
                    <SectionEyebrow>
                      Page Layout
                    </SectionEyebrow>

                    <h2 className="text-base font-semibold text-[#1A2B48]">
                      {activePage.title ||
                        `Page ${activePageIdx + 1}`}
                    </h2>
                  </div>

                  <span className="rounded-full bg-[#EBF2F2] px-3 py-1.5 text-[9px] font-medium text-slate-500">
                    {activePage.blocks.length}{' '}
                    blocks
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {activePage.blocks.length ===
                  0 ? (
                    <Panel>
                      <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF2F2] text-[#3D6BB4]">
                          +
                        </div>

                        <p className="text-sm font-medium text-[#1A2B48]">
                          This page is empty
                        </p>

                        <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                          Add a fixed registration field
                          or content block above to start
                          building the page.
                        </p>
                      </div>
                    </Panel>
                  ) : (
                    activePage.blocks.map(
                      (block, idx) => {
                        const sysDef =
                          SYSTEM_FIELD_DEFS.find(
                            (d) =>
                              d.type === block.type
                          );

                        return (
                          <Panel key={block.id}>
                            <div className="border-b border-slate-100 px-5 py-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">

                                <div className="flex items-center gap-3">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EBF2F2] text-[9px] font-semibold text-[#3D6BB4]">
                                    {idx + 1}
                                  </div>

                                  <div>
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                      {sysDef
                                        ? `Fixed: ${sysDef.label}`
                                        : block.type}
                                    </p>

                                    {sysDef && (
                                      <p className="mt-1 text-[10px] text-slate-400">
                                        {sysDef.required
                                          ? 'Required for registration.'
                                          : 'Optional field.'}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1">

                                  {schema.pages.length >
                                    1 && (
                                    <select
                                      className="max-w-[120px] rounded-xl border-0 bg-[#F4F7F7] px-2 py-2 text-[9px] text-[#1A2B48] ring-1 ring-slate-200 outline-none focus:ring-[#3D6BB4]"
                                      value={
                                        activePageIdx
                                      }
                                      onChange={(e) =>
                                        moveBlockToPage(
                                          block.id,
                                          Number(
                                            e.target
                                              .value
                                          )
                                        )
                                      }
                                    >
                                      {schema.pages.map(
                                        (
                                          p,
                                          i
                                        ) => (
                                          <option
                                            key={
                                              p.id
                                            }
                                            value={
                                              i
                                            }
                                          >
                                            {p.title ||
                                              `Page ${
                                                i +
                                                1
                                              }`}
                                          </option>
                                        )
                                      )}
                                    </select>
                                  )}

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      moveBlock(
                                        block.id,
                                        'up'
                                      )
                                    }
                                    disabled={
                                      idx === 0
                                    }
                                    className="h-8 w-8 rounded-lg p-0 text-slate-400 hover:bg-[#EBF2F2] hover:text-[#3D6BB4]"
                                  >
                                    ↑
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      moveBlock(
                                        block.id,
                                        'down'
                                      )
                                    }
                                    disabled={
                                      idx ===
                                      activePage
                                        .blocks
                                        .length -
                                        1
                                    }
                                    className="h-8 w-8 rounded-lg p-0 text-slate-400 hover:bg-[#EBF2F2] hover:text-[#3D6BB4]"
                                  >
                                    ↓
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      removeBlock(
                                        block.id
                                      )
                                    }
                                    className="h-8 w-8 rounded-lg p-0 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                  >
                                    ✕
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-4 p-5 md:p-6">

                              {!sysDef &&
                                (block.type ===
                                  'heading' ||
                                  block.type ===
                                    'paragraph') && (
                                  <div className="flex flex-col gap-2">
                                    <FieldLabel>
                                      Content
                                    </FieldLabel>

                                    <Textarea
                                      placeholder="Content..."
                                      value={
                                        block.content
                                      }
                                      onChange={(e) =>
                                        updateBlock(
                                          block.id,
                                          {
                                            content:
                                              e
                                                .target
                                                .value,
                                          }
                                        )
                                      }
                                      className={`${controlClass} min-h-[100px] resize-none`}
                                    />
                                  </div>
                                )}

                              {!sysDef &&
                                block.type ===
                                  'divider' && (
                                  <div className="rounded-2xl bg-[#F4F7F7] p-4">
                                    <div className="mb-3 h-px bg-slate-200" />

                                    <p className="text-[10px] leading-5 text-slate-400">
                                      A horizontal divider
                                      using the Divider
                                      Color set above.
                                    </p>
                                  </div>
                                )}

                              {!sysDef &&
                                block.type ===
                                  'image' && (
                                  <div className="flex flex-col gap-4">

                                    {block.imageUrl ? (
                                      <div className="overflow-hidden rounded-2xl bg-[#F4F7F7] ring-1 ring-slate-200">
                                        <img
                                          src={
                                            block.imageUrl
                                          }
                                          alt=""
                                          className="h-40 w-full object-cover"
                                        />
                                      </div>
                                    ) : (
                                      <div className="flex h-28 items-center justify-center rounded-2xl bg-[#F4F7F7] ring-1 ring-dashed ring-slate-200">
                                        <span className="text-[10px] text-slate-400">
                                          No image
                                          uploaded
                                        </span>
                                      </div>
                                    )}

                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) =>
                                        e
                                          .target
                                          .files[0] &&
                                        handleBlockImageUpload(
                                          block.id,
                                          e
                                            .target
                                            .files[0]
                                        )
                                      }
                                      className="w-full rounded-xl bg-[#F4F7F7] px-3 py-2.5 text-xs text-slate-500 ring-1 ring-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-[#EBF2F2] file:px-3 file:py-1.5 file:text-[10px] file:font-medium file:text-[#3D6BB4]"
                                    />

                                    <div className="flex flex-col gap-3">
                                      <div className="flex items-center justify-between">
                                        <FieldLabel>
                                          Width
                                        </FieldLabel>

                                        <span className="rounded-full bg-[#EBF2F2] px-2.5 py-1 text-[9px] font-semibold text-[#3D6BB4]">
                                          {block.widthPercent ||
                                            100}
                                          %
                                        </span>
                                      </div>

                                      <input
                                        type="range"
                                        min={10}
                                        max={100}
                                        value={
                                          block.widthPercent ||
                                          100
                                        }
                                        onChange={(e) =>
                                          updateBlock(
                                            block.id,
                                            {
                                              widthPercent:
                                                Number(
                                                  e
                                                    .target
                                                    .value
                                                ),
                                            }
                                          )
                                        }
                                        className="h-1.5 w-full accent-[#3D6BB4]"
                                      />
                                    </div>
                                  </div>
                                )}

                              {!sysDef &&
                                [
                                  'text',
                                  'textarea',
                                  'number',
                                  'email',
                                  'tel',
                                  'select',
                                ].includes(
                                  block.type
                                ) && (
                                  <div className="flex flex-col gap-4">

                                    <div className="flex flex-col gap-2">
                                      <FieldLabel>
                                        Field Label
                                      </FieldLabel>

                                      <Input
                                        placeholder="Field label"
                                        value={
                                          block.label
                                        }
                                        onChange={(e) =>
                                          updateBlock(
                                            block.id,
                                            {
                                              label:
                                                e
                                                  .target
                                                  .value,
                                            }
                                          )
                                        }
                                        className={controlClass}
                                      />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                      <FieldLabel>
                                        Placeholder
                                      </FieldLabel>

                                      <Input
                                        placeholder="Placeholder text (optional)"
                                        value={
                                          block.placeholder
                                        }
                                        onChange={(e) =>
                                          updateBlock(
                                            block.id,
                                            {
                                              placeholder:
                                                e
                                                  .target
                                                  .value,
                                            }
                                          )
                                        }
                                        className={controlClass}
                                      />
                                    </div>

                                    {block.type ===
                                      'select' && (
                                      <div className="flex flex-col gap-2">
                                        <FieldLabel>
                                          Options
                                        </FieldLabel>

                                        <Input
                                          placeholder="Options, comma separated"
                                          value={(
                                            block.options ||
                                            []
                                          ).join(
                                            ', '
                                          )}
                                          onChange={(e) =>
                                            updateBlock(
                                              block.id,
                                              {
                                                options:
                                                  e.target.value
                                                    .split(
                                                      ','
                                                    )
                                                    .map(
                                                      (
                                                        o
                                                      ) =>
                                                        o.trim()
                                                    )
                                                    .filter(
                                                      Boolean
                                                    ),
                                              }
                                            )
                                          }
                                          className={controlClass}
                                        />
                                      </div>
                                    )}

                                    <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#F4F7F7] px-3 py-3 ring-1 ring-slate-200">
                                      <input
                                        type="checkbox"
                                        checked={
                                          block.required
                                        }
                                        onChange={(e) =>
                                          updateBlock(
                                            block.id,
                                            {
                                              required:
                                                e
                                                  .target
                                                  .checked,
                                            }
                                          )
                                        }
                                        className="h-4 w-4 rounded border-slate-300 accent-[#3D6BB4]"
                                      />

                                      <div>
                                        <p className="text-[10px] font-semibold text-[#1A2B48]">
                                          Required field
                                        </p>

                                        <p className="text-[9px] text-slate-400">
                                          Users must complete
                                          this field before
                                          submitting.
                                        </p>
                                      </div>
                                    </label>
                                  </div>
                                )}
                            </div>
                          </Panel>
                        );
                      }
                    )
                  )}
                </div>
              </div>
            </div>

            {/* ================================================
                LIVE PREVIEW
            ================================================ */}

            <div className="min-w-0 xl:sticky xl:top-6 xl:self-start">

              <div className="mb-3 flex items-center justify-between px-1">
                <div>
                  <SectionEyebrow>
                    Preview
                  </SectionEyebrow>

                  <h2 className="text-base font-semibold text-[#1A2B48]">
                    Live Preview
                  </h2>
                </div>

                <StatusPill variant="blue">
                  Live
                </StatusPill>
              </div>

              <Panel className="overflow-hidden">

                <div className="border-b border-slate-100 bg-[#F4F7F7] px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />

                    <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Registration Preview
                    </span>
                  </div>
                </div>

                <div className="max-h-[calc(100vh-180px)] overflow-y-auto bg-slate-50/50 p-3 md:p-5">
                  <FormRenderer
                    schema={schema}
                    values={{}}
                    readOnly
                  />
                </div>
              </Panel>

              <div className="mt-4 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/70">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Current Page
                  </span>

                  <span className="text-xs font-medium text-[#1A2B48]">
                    {activePageIdx + 1} /{' '}
                    {schema.pages.length}
                  </span>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#3D6BB4] transition-all"
                    style={{
                      width: `${
                        ((activePageIdx + 1) /
                          schema.pages.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* ------------------------------------------------
              FOOTER
          ------------------------------------------------ */}

          <div className="mt-6 flex flex-col gap-2 px-2 text-[9px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Changes are saved only when you select
              "Save Form".
            </span>

            <span>
              GIKI Adventure Club · Registration
              Management
            </span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}