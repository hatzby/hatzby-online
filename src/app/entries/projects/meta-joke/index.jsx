"use client";

export const meta = {
  title: "This Website",
  description: "Hey look it deployed.",
  date: "2025-08-17",
  tags: ["meta", "changelog", "ship-it"],
};

export default function ItExists() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="mb-1">How did we get here</h1>
      <p className="mt-0 opacity-80">
        I did not think this website would ever deploy, but here we are at{" "}
        <a href="https://hatzby.online" target="_blank" rel="noopener noreferrer">
          hatzby.online
        </a>.
      </p>
      <br></br>

      <h2>Release Notes</h2>
      <ul>
        <li>- Found out that PupNetx WAS real.</li>
        <li>- Please hit panic button if images start taking over the world.</li>
        <li>- Stopped the robot uprising.</li>
        <li>- Is PupNetx real? I cant remember.</li>
        <li>- Removed Herobrine.</li>
      </ul>

      <h3 className="mt-6">Tech bits:</h3>
      <p className="text-sm opacity-80">
        Next.js + Tailwind
      </p>
    </div>
  );
}
