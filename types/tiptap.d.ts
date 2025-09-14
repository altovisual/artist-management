declare module '@tiptap/react' {
  interface ChainedCommands {
    setTextAlign: (alignment: 'left' | 'center' | 'right' | 'justify') => this;
  }
}
