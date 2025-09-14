'use client';

import { type Editor } from '@tiptap/react';
import { Bold, Strikethrough, Italic, List, ListOrdered, Heading2, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Link as LinkIcon, Unlink, PlusCircle } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ToolbarProps {
  editor: Editor | null;
}

export function Toolbar({ editor }: ToolbarProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [placeholderName, setPlaceholderName] = useState('');

  if (!editor) {
    return null;
  }

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
    } else {
      editor.chain().focus().unsetLink().run();
    }
  };

  const addPlaceholder = () => {
    if (placeholderName) {
      editor.chain().focus().addPlaceholder(placeholderName).run();
      setPlaceholderName('');
    }
  };

  return (
    <div className="border border-input bg-transparent rounded-md p-1 flex flex-row items-center gap-1 flex-wrap">
      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('strike')}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('underline')}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 2 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'left' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <AlignLeft className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'center' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <AlignCenter className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'right' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <AlignRight className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'justify' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()}
      >
        <AlignJustify className="h-4 w-4" />
      </Toggle>
      <div className="flex items-center gap-1">
        <Input
          type="url"
          placeholder="URL"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          className="h-8 w-32"
        />
        <Button size="sm" onClick={setLink}>
          {editor.isActive('link') ? <Unlink className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
        </Button>
      </div>
      <div className="flex items-center gap-1">
        <Input
          type="text"
          placeholder="Placeholder Name"
          value={placeholderName}
          onChange={(e) => setPlaceholderName(e.target.value)}
          className="h-8 w-32"
        />
        <Button size="sm" onClick={addPlaceholder}>
          <PlusCircle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}