import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import AdminLayout from '@/components/admin/AdminLayout';

const emptyForm = {
  termLabel: '',
  name: '',
  role: '',
  displayOrder: 0,
};

export default function HistoryManager() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    try {
      const { data } = await api.get('/history');
      setMembers(data.members);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load.'
      );
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setIsAdding(true);

    try {
      await api.post('/history', form);

      setForm(emptyForm);
      await fetchMembers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to add.'
      );
    } finally {
      setIsAdding(false);
    }
  }

  async function handlePhotoUpload(id, file) {
    if (!file) return;

    setUploadingId(id);
    setError('');

    const formData = new FormData();
    formData.append('photo', file);

    try {
      await api.post(
        `/history/${id}/photo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      await fetchMembers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Upload failed.'
      );
    } finally {
      setUploadingId(null);
    }
  }

  async function handleDelete(id, name) {
    if (
      !window.confirm(
        `Remove ${name} from the executive council archive?`
      )
    ) {
      return;
    }

    setError('');

    try {
      await api.delete(`/history/${id}`);
      await fetchMembers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to delete.'
      );
    }
  }

  const grouped = members.reduce((acc, member) => {
    (acc[member.termLabel] ||= []).push(member);
    return acc;
  }, {});

  const terms = Object.entries(grouped);

  return (
    <AdminLayout>
      <div className="min-h-screen px-5 py-8 md:px-8 lg:px-12">

        <div className="mx-auto max-w-7xl">

          {/* =====================================================
              HEADER
          ====================================================== */}

          <div className="mb-8">

            <div className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#3D6BB4]">

              <span className="h-1.5 w-1.5 rounded-full bg-[#3D6BB4]" />

              Organization

            </div>

            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

              <div>

                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#1A2B48] md:text-4xl">
                  Executive Council Archive
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Preserve the history of GAC by maintaining
                  the executive councils that shaped the club.
                </p>

              </div>

              <div className="flex items-center gap-3">

                <div className="rounded-2xl bg-white px-5 py-3 shadow-sm ring-1 ring-slate-200/70">

                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Archived Members
                  </p>

                  <p className="mt-1 text-2xl font-semibold tracking-tight text-[#1A2B48]">
                    {members.length}
                  </p>

                </div>

                <div className="rounded-2xl bg-white px-5 py-3 shadow-sm ring-1 ring-slate-200/70">

                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Terms
                  </p>

                  <p className="mt-1 text-2xl font-semibold tracking-tight text-[#1A2B48]">
                    {terms.length}
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* =====================================================
              ERROR
          ====================================================== */}

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">

              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100">
                !
              </span>

              {error}

            </div>
          )}

          {/* =====================================================
              ADD MEMBER
          ====================================================== */}

          <section className="mb-10 overflow-hidden rounded-[24px] bg-[#1A2B48] shadow-sm">

            <div className="relative overflow-hidden px-6 py-6 md:px-8">

              {/* Decorative circles */}

              <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-white/5" />

              <div className="pointer-events-none absolute -right-4 -top-8 h-32 w-32 rounded-full border border-white/5" />

              <div className="relative">

                <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#88B3D8]">
                  Archive
                </div>

                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Add Council Member
                </h2>

                <p className="mt-1 max-w-lg text-xs leading-5 text-white/40">
                  Add a member to an executive council term.
                  Their profile photo can be uploaded afterwards.
                </p>

              </div>

            </div>

            <div className="bg-white px-6 py-6 md:px-8">

              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 gap-4 md:grid-cols-2"
              >

                {/* TERM */}

                <div>

                  <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Council Term
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. 2024–25"
                    value={form.termLabel}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        termLabel: e.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-xl border-0 bg-[#F4F7F7] px-4 py-3 text-sm text-[#1A2B48] outline-none ring-1 ring-slate-200 transition-all placeholder:text-slate-300 focus:bg-white focus:ring-[#3D6BB4]"
                  />

                </div>

                {/* ROLE */}

                <div>

                  <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Position
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. President"
                    value={form.role}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        role: e.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-xl border-0 bg-[#F4F7F7] px-4 py-3 text-sm text-[#1A2B48] outline-none ring-1 ring-slate-200 transition-all placeholder:text-slate-300 focus:bg-white focus:ring-[#3D6BB4]"
                  />

                </div>

                {/* NAME */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="Council member name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-xl border-0 bg-[#F4F7F7] px-4 py-3 text-sm text-[#1A2B48] outline-none ring-1 ring-slate-200 transition-all placeholder:text-slate-300 focus:bg-white focus:ring-[#3D6BB4]"
                  />

                </div>

                {/* SUBMIT */}

                <div className="md:col-span-2 md:flex md:justify-end">

                  <button
                    type="submit"
                    disabled={isAdding}
                    className="w-full rounded-xl bg-[#3D6BB4] px-6 py-3 text-xs font-semibold text-white transition-all hover:bg-[#315B9B] disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
                  >
                    {isAdding
                      ? 'Adding member...'
                      : 'Add Council Member →'}
                  </button>

                </div>

              </form>

            </div>

          </section>

          {/* =====================================================
              ARCHIVE
          ====================================================== */}

          <div>

            <div className="mb-5 flex items-end justify-between">

              <div>

                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#3D6BB4]">
                  GAC History
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#1A2B48]">
                  Past Executive Councils
                </h2>

              </div>

              <p className="hidden text-xs text-slate-400 sm:block">
                {members.length} archived members
              </p>

            </div>

            {terms.length === 0 ? (

              <div className="rounded-[24px] bg-white px-6 py-20 text-center shadow-sm ring-1 ring-slate-200/70">

                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EBF2F2] text-xl text-slate-400">
                  ◌
                </div>

                <p className="text-sm font-medium text-[#1A2B48]">
                  No council members yet
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Add your first executive council member above.
                </p>

              </div>

            ) : (

              <div className="space-y-8">

                {terms.map(([term, list], termIndex) => (

                  <section key={term}>

                    {/* TERM HEADER */}

                    <div className="mb-4 flex items-center gap-4">

                      <div className="flex items-center gap-3">

                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A2B48] text-[9px] font-semibold text-white">
                          {String(
                            termIndex + 1
                          ).padStart(2, '0')}
                        </span>

                        <div>

                          <h3 className="text-sm font-semibold text-[#1A2B48]">
                            {term}
                          </h3>

                          <p className="text-[9px] uppercase tracking-[0.15em] text-slate-400">
                            Executive Council
                          </p>

                        </div>

                      </div>

                      <div className="h-px flex-1 bg-slate-200" />

                      <span className="text-[9px] font-medium text-slate-400">
                        {list.length}{' '}
                        {list.length === 1
                          ? 'member'
                          : 'members'}
                      </span>

                    </div>

                    {/* MEMBERS */}

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">

                      {list.map((member) => {

                        const initials =
                          member.name
                            ?.split(' ')
                            .map((n) =>
                              n.charAt(0)
                            )
                            .slice(0, 2)
                            .join('')
                            .toUpperCase() || '?';

                        return (

                          <div
                            key={member.id}
                            className="group relative overflow-hidden rounded-[20px] bg-white p-4 shadow-sm ring-1 ring-slate-200/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                          >

                            <div className="flex items-center gap-4">

                              {/* PHOTO */}

                              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-[#EBF2F2]">

                                {member.photoUrl ? (

                                  <img
                                    src={member.photoUrl}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />

                                ) : (

                                  <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#3D6BB4]">
                                    {initials}
                                  </div>

                                )}

                              </div>

                              {/* INFO */}

                              <div className="min-w-0 flex-1">

                                <p className="truncate text-sm font-semibold text-[#1A2B48]">
                                  {member.name}
                                </p>

                                <p className="mt-1 truncate text-[10px] font-medium uppercase tracking-[0.08em] text-[#3D6BB4]">
                                  {member.role}
                                </p>

                              </div>

                            </div>

                            {/* ACTIONS */}

                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">

                              <label className="cursor-pointer">

                                <span className="rounded-lg bg-[#F4F7F7] px-3 py-2 text-[9px] font-semibold text-slate-500 transition-colors hover:bg-[#EBF2F2] hover:text-[#1A2B48]">

                                  {uploadingId === member.id
                                    ? 'Uploading...'
                                    : member.photoUrl
                                      ? 'Change Photo'
                                      : 'Add Photo'}

                                </span>

                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={
                                    uploadingId ===
                                    member.id
                                  }
                                  onChange={(e) => {
                                    const file =
                                      e.target.files?.[0];

                                    if (file) {
                                      handlePhotoUpload(
                                        member.id,
                                        file
                                      );
                                    }

                                    e.target.value = '';
                                  }}
                                />

                              </label>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    member.id,
                                    member.name
                                  )
                                }
                                className="rounded-lg px-3 py-2 text-[9px] font-medium text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                              >
                                Remove
                              </button>

                            </div>

                          </div>

                        );

                      })}

                    </div>

                  </section>

                ))}

              </div>

            )}

          </div>

          {/* =====================================================
              FOOTER
          ====================================================== */}

          <div className="mt-10 flex flex-col justify-between gap-2 border-t border-slate-200 px-2 pt-5 text-[9px] text-slate-400 sm:flex-row">

            <p>
              Executive Council Archive · GIKI Adventure Club
            </p>

            <p>
              Preserve the people behind the journey.
            </p>

          </div>

        </div>

      </div>
    </AdminLayout>
  );
}