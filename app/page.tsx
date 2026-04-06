"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div style={{ padding: "50px" }}>
      <button
        onClick={() => {
          alert("CLICKED");
          window.location.href = "/login";
        }}
        style={{
          padding: "20px",
          background: "blue",
          color: "white",
          cursor: "pointer",
          borderRadius: "10px",
        }}
      >
        Report Generator
      </button>
    </div>
  );
}
