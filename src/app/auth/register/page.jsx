"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";

const getStrength = (val = "") => {
  if (val.length === 0) return null;
  if (val.length < 6) return { label: "Weak", color: "bg-red-400", text: "text-red-500", width: "33%" };
  if (val.length < 10 || !/[A-Z]/.test(val) || !/[0-9]/.test(val))
    return { label: "Medium", color: "bg-yellow-400", text: "text-yellow-600", width: "66%" };
  return { label: "Strong", color: "bg-green-500", text: "text-green-600", width: "100%" };
};
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff, BookOpen, User, Mail, Lock, ImageIcon, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    const {name, email, password, photoURL} = data;
    const { data: user, error } = await authClient.signUp.email({
    name,
    email,
    password,
    image: photoURL,
    });

  if (error) {
  toast.error(error.message || "Registration failed.");
  return;
  }

  toast.success("Account created! Welcome to Boimohol 🎉");
  };

  const handleGoogleSignIn = async () => {
    // TODO: Better Auth Google OAuth
  };

  return (
    <div className="min-h-screen bg-[#f5f5eb] flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-[#008854] px-12 py-14 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute border border-white rounded-full"
              style={{
                width: `${120 + i * 80}px`,
                height: `${120 + i * 80}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>

        <Link href="/" className="flex items-center gap-2 z-10">
          <BookOpen size={28} className="text-white" />
          <span className="font-dance text-2xl text-white font-bold">Boimohol</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="z-10"
        >
          <p className="text-white/60 text-sm uppercase tracking-widest mb-4 font-medium">
            Join the community
          </p>
          <h2 className="text-white text-4xl font-bold leading-tight mb-6">
            Every great reader<br />starts somewhere.
          </h2>
          <p className="text-white/70 text-base leading-relaxed max-w-xs">
            Discover, borrow, and get books delivered to your door. Thousands of titles waiting for you.
          </p>
        </motion.div>

        <div className="z-10 flex items-center gap-3">
          <div className="flex -space-x-2">
            {["#e9c46a", "#f4a261", "#e76f51"].map((color, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-[#008854]"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <p className="text-white/70 text-sm">2,400+ readers already joined</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <BookOpen size={24} className="text-[#008854]" />
          <span className="font-dance text-xl text-[#008854] font-bold">Boimohol</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full mx-auto"
        >
          <h1 className="text-2xl font-bold text-[#0a5c46] mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 mb-8">
            Already have one?{" "}
            <Link href="/auth/login" className="text-[#008854] font-medium hover:underline">
              Log in
            </Link>
          </p>

          {/* Google OAuth */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignIn}
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-gray-200 bg-white rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition mb-6 shadow-sm cursor-pointer"
          >
            <FcGoogle size={20} />
            Continue with Google
          </motion.button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register("name", { required: "Name is required" })}
                  type="text"
                  placeholder="Amirul Islam"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#008854] focus:ring-2 focus:ring-[#008854]/10 transition"
                />
              </div>
              <AnimatePresence>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-500 mt-1"
                  >
                    {errors.name.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                  })}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#008854] focus:ring-2 focus:ring-[#008854]/10 transition"
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-red-500 mt-1">
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Photo URL */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Photo URL</label>
              <div className="relative">
                <ImageIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register("photoURL")}
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#008854] focus:ring-2 focus:ring-[#008854]/10 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "At least 6 characters" },
                  })}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#008854] focus:ring-2 focus:ring-[#008854]/10 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Strength bar */}
              {watch("password") && (() => {
                const s = getStrength(watch("password"));
                return (
                  <div className="mt-2">
                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${s.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: s.width }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className={`text-xs mt-1 font-medium ${s.text}`}>{s.label} password</p>
                  </div>
                );
              })()}
              <AnimatePresence>
                {errors.password && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-red-500 mt-1">
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (val) => val === password || "Passwords do not match",
                  })}
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#008854] focus:ring-2 focus:ring-[#008854]/10 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <AnimatePresence>
                {errors.confirmPassword && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-red-500 mt-1">
                    {errors.confirmPassword.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-[#008854] hover:bg-[#0a5c46] text-white font-medium py-3 rounded-xl text-sm transition mt-2 disabled:opacity-60"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
              {!isSubmitting && <ChevronRight size={16} />}
            </motion.button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-6">
            By registering, you agree to our{" "}
            <span className="underline cursor-pointer">Terms</span> and{" "}
            <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}