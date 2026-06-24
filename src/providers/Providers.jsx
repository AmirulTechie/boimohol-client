// app/providers.jsx
"use client";

import { Toaster } from "react-hot-toast";

export default function Providers({ children }) {
  return (
    <>
      {children}
      <Toaster
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1a5c3f",
            color: "#ffffff",
            fontFamily: "inherit",
            fontSize: "14px",
            borderRadius: "8px",
            padding: "12px 16px",
          },
          success: {
            iconTheme: {
              primary: "#ffffff",
              secondary: "#1a5c3f",
            },
          },
          error: {
            style: {
              background: "#c0392b",
              color: "#ffffff",
            },
          },
        }}
      />
    </>
  );
}