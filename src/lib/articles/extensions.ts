import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";

// Shared between the client editor and server-side HTML generation so both
// sides agree on the same document schema.
export const articleExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
  }),
  Image,
  Link.configure({ openOnClick: false, autolink: true }),
];
