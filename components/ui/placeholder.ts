'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { PlaceholderView } from './PlaceholderView'; // Already correct, no change needed

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    placeholder: {
      /**
       * Add a placeholder
       */
      addPlaceholder: (name: string) => ReturnType;
    };
  }
}

export const Placeholder = Node.create({
  name: 'placeholder',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      name: {
        default: null,
        parseHTML: element => element.getAttribute('data-name'),
        renderHTML: attributes => ({
          'data-name': attributes.name,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="placeholder"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { 'data-type': 'placeholder' }),
      `{{${HTMLAttributes.name}}}`,
    ];
  },

  addCommands() {
    return {
      addPlaceholder: name => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { name },
        });
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(PlaceholderView);
  },
});
