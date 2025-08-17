"use client";
import { useState } from "react";

export const meta = {
  title: "Bean Translator",
  description: "Finally.. He speaks.",
};

export default function BleatDecoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const bleatMap = {
    A: "bleat.", B: "bleat..", C: "pfftt.", D: "pfftt..", E: "baah.",
    F: "baah..", G: "hrmph.", H: "hrmph..", I: "meh.", J: "meh..",
    K: "mmf.", L: "mmf..", M: "huff.", N: "huff..", O: "snort.",
    P: "snort..", Q: "bleat?", R: "bleat??", S: "pfftt?", T: "baah?",
    U: "hrmph?", V: "meh?", W: "mmf?", X: "huff?", Y: "snort?", Z: "bleat!"
  };

  const reverseBleatMap = {};
  for (const [letter, bleatWord] of Object.entries(bleatMap)) {
    reverseBleatMap[bleatWord] = letter;
  }

  const encodeBleat = () => {
    const text = input.toUpperCase();
    let result = [];
    for (let char of text) {
      if (bleatMap[char]) {
        result.push(bleatMap[char]);
      } else if (char === " ") {
        result.push("."); // space marker
      } else {
        result.push(char);
      }
    }
    setOutput(result.join(" "));
  };

  const decodeBleat = () => {
    const src = input.trim();
    if (!src) {
      setOutput("");
      return;
    }
    const tokens = src.split(/\s+/g);
    let res = "";
    for (const t of tokens) {
      if (reverseBleatMap[t]) {
        res += reverseBleatMap[t].toLowerCase();
      } else if (t === ".") {
        res += " ";
      } else {
        res += t.toLowerCase();
      }
    }
    setOutput(res);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Bleat Decoder</h1>

      <label className="block mb-2 font-medium" htmlFor="inputText">
        Enter text:
      </label>
      <textarea
        id="inputText"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Hello world!"
        className="w-full h-28 p-2 border border-gray-300 rounded mb-4"
      />

      <div className="flex gap-2 mb-4">
        <button
          onClick={encodeBleat}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
        >
          Translate to Bean Speak
        </button>
        <button
          onClick={decodeBleat}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Translate to English
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Output:</h2>
      <div className="output bg-white border border-gray-300 p-3 min-h-[100px] whitespace-pre-wrap">
        {output}
      </div>
    </div>
  );
}
