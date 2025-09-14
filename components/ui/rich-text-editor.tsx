'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Toolbar } from './editor-toolbar';
import { Placeholder as CustomPlaceholder } from './placeholder'; // Updated import

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable default extensions that might conflict or are not needed
        // For example, if you want to handle links manually, disable the default Link extension
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        // Add a custom HTML attribute to links to make them open in a new tab
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start typing your template content...',
      }),
      CustomPlaceholder, // Add the custom placeholder extension
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        // Re-added prose classes to help with default styling of HTML content
        class: 'prose dark:prose-invert min-h-[200px] p-4 border border-input rounded-md focus:outline-none',
      },
    },
    immediatelyRender: false,
  });

  return (
    <div className="flex flex-col justify-stretch min-h-[250px]">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}