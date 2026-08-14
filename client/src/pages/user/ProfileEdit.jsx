import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import AdminLayout from '@/components/admin/AdminLayout';
import { motion } from 'framer-motion';

export default function ProfileEdit() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const uploadAvatar = useAuthStore((state) => state.uploadAvatar);

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    regNo: user?.regNo || '',
    whatsappNumber: user?.whatsappNumber || '',
  });

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setError('');
    setMessage('');

    const result = await updateProfile(form);

    if (result.success) {
      setMessage('Profile updated successfully.');
    } else {
      setError(result.message);
    }

    setSaving(false);
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0];

    if (!file) return;

    setUploadingAvatar(true);
    setError('');
    setMessage('');

    const result = await uploadAvatar(file);

    if (result.success) {
      setMessage('Profile photo updated.');
    } else {
      setError(result.message);
    }

    setUploadingAvatar(false);
  }

  return (
    <AdminLayout>
      <main className="min-h-screen bg-[#EBF2F2]">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">

          {/* =====================================================
              TOP NAV
          ====================================================== */}

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#688BB0] transition-colors hover:text-[#1A2B48]"
            >
              <span className="text-sm">←</span>
              Back to Dashboard
            </Link>
          </motion.div>

          {/* =====================================================
              HEADER
          ====================================================== */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end"
          >
            <div>

              <div className="mb-5 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#3D6BB4]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#688BB0]">
                  GAC Member Profile
                </span>
              </div>

              <h1 className="text-5xl font-semibold leading-[0.9] tracking-[-0.055em] text-[#1A2B48] sm:text-6xl lg:text-7xl">
                Your
                <br />
                <span className="text-[#3D6BB4]">
                  Profile.
                </span>
              </h1>

            </div>

            <div className="lg:justify-self-end">

              <p className="max-w-sm text-sm leading-7 text-[#688BB0]">
                Keep your GAC information up to date so we can
                keep your registrations, tickets and adventures
                connected to you.
              </p>

            </div>
          </motion.div>

          {/* =====================================================
              MAIN GRID
          ====================================================== */}

          <div className="grid gap-7 lg:grid-cols-[340px_1fr]">

            {/* ===================================================
                PROFILE CARD
            ==================================================== */}

            <motion.section
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-[2rem] bg-[#1A2B48] p-7 sm:p-8"
            >

              {/* Decorative rings */}

              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#88B3D8]/10" />

              <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full border border-[#88B3D8]/10" />

              <div className="relative">

                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#88B3D8]">
                  Member
                </p>

                {/* Avatar */}

                <div className="mt-8">

                  <div className="relative inline-block">

                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt=""
                        className="h-28 w-28 rounded-full object-cover ring-4 ring-white/10"
                      />
                    ) : (
                      <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#88B3D8] text-4xl font-semibold text-[#1A2B48] ring-4 ring-white/10">
                        {user?.fullName?.charAt(0)?.toUpperCase()}
                      </div>
                    )}

                    <div className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1A2B48] shadow-lg">
                      <span className="text-sm">+</span>
                    </div>

                  </div>

                </div>

                {/* Name */}

                <h2 className="mt-7 text-2xl font-semibold tracking-[-0.035em] text-white">
                  {user?.fullName || 'GAC Member'}
                </h2>

                <p className="mt-2 text-sm text-white/40">
                  {user?.email}
                </p>

                {/* Divider */}

                <div className="my-7 border-t border-white/10" />

                {/* Account information */}

                <div className="space-y-5">

                  <ProfileInfo
                    label="Registration No."
                    value={user?.regNo || 'Not provided'}
                  />

                  <ProfileInfo
                    label="WhatsApp"
                    value={user?.whatsappNumber || 'Not provided'}
                  />

                </div>

                {/* Upload */}

                <label
                  className={`mt-8 flex cursor-pointer items-center justify-center rounded-full border border-white/15 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:border-[#88B3D8] hover:bg-white/5 ${
                    uploadingAvatar
                      ? 'pointer-events-none opacity-50'
                      : ''
                  }`}
                >
                  {uploadingAvatar
                    ? 'Uploading...'
                    : 'Change Profile Photo'}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>

              </div>

            </motion.section>

            {/* ===================================================
                EDIT FORM
            ==================================================== */}

            <motion.section
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-[2rem] bg-white p-7 shadow-[0_15px_50px_rgba(26,43,72,0.05)] sm:p-9 lg:p-10"
            >

              <div className="mb-9">

                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#688BB0]">
                  Personal Information
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-[#1A2B48]">
                  Edit your details
                </h2>

              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >

                {/* Full Name */}

                <Field
                  label="Full Name"
                  htmlFor="fullName"
                >
                  <input
                    id="fullName"
                    value={form.fullName}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        fullName: e.target.value,
                      }))
                    }
                    required
                    className="gac-input"
                    placeholder="Your full name"
                  />
                </Field>

                {/* Registration Number */}

                <Field
                  label="Registration Number"
                  htmlFor="regNo"
                >
                  <input
                    id="regNo"
                    value={form.regNo}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        regNo: e.target.value,
                      }))
                    }
                    className="gac-input"
                    placeholder="e.g. 2023037"
                  />
                </Field>

                {/* WhatsApp */}

                <Field
                  label="WhatsApp Number"
                  htmlFor="whatsappNumber"
                >
                  <input
                    id="whatsappNumber"
                    value={form.whatsappNumber}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        whatsappNumber: e.target.value,
                      }))
                    }
                    className="gac-input"
                    placeholder="+92 3XX XXXXXXX"
                  />
                </Field>

                {/* Email */}

                <Field
                  label="Email Address"
                  htmlFor="email"
                >
                  <input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="gac-input cursor-not-allowed bg-[#EBF2F2] text-[#688BB0]"
                  />

                  <p className="mt-2 text-[11px] leading-5 text-[#688BB0]">
                    Your email address is linked to your account
                    and cannot be changed.
                  </p>
                </Field>

                {/* Messages */}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-[#FBE7E7] px-4 py-3 text-sm text-[#A33A3A]"
                  >
                    {error}
                  </motion.div>
                )}

                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-[#E2F1EA] px-4 py-3 text-sm text-[#28704B]"
                  >
                    <span className="mr-2">✓</span>
                    {message}
                  </motion.div>
                )}

                {/* Submit */}

                <div className="border-t border-[#88B3D8]/15 pt-6">

                  <button
                    type="submit"
                    disabled={saving}
                    className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#1A2B48] px-7 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-all duration-300 hover:bg-[#3D6BB4] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {saving ? (
                      'Saving Changes...'
                    ) : (
                      <>
                        Save Changes

                        <span className="transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </>
                    )}
                  </button>

                </div>

              </form>

            </motion.section>

          </div>

          {/* =====================================================
              BOTTOM
          ====================================================== */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex items-center justify-between border-t border-[#88B3D8]/20 pt-6"
          >

            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#688BB0]">
              GIKI Adventure Club
            </p>

            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#88B3D8]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#5F97DF]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#3D6BB4]" />
            </div>

          </motion.div>

        </div>
      </main>
    </AdminLayout>
  );
}


/* ================================================================
   FIELD
================================================================ */

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#688BB0]"
      >
        {label}
      </label>

      {children}
    </div>
  );
}


/* ================================================================
   PROFILE INFO
================================================================ */

function ProfileInfo({ label, value }) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/35">
        {label}
      </p>

      <p className="mt-1 text-sm text-white/80">
        {value}
      </p>
    </div>
  );
}