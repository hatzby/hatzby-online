"use client";

export const meta = {
  title: "Test Entry #1",
  description: "A short personal test entry",
  date: "2025-08-17",
  tags: ["test"],
};

export default function ItExists() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="mb-1">Hey there!</h1>
      &nbsp;
      <p>
        I'm writing this a day after the website got deployed, I didn't expect to get this far into this project. With all honesty I thought I would've given up by now but with the power of friendship and four cups of coffee a day — here we are.
      </p>
      &nbsp;
      <p>
        Whoever's reading this, it's a chilly night and the day has been decent, I hope your day has been good too.
      </p>
    </div>
  );
}