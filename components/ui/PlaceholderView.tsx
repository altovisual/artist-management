'use client';

import React from 'react';

export const PlaceholderView = (props: any) => {
  const { node } = props;
  const { name } = node.attrs;

  return (
    <span>
      {`{{${name}}}`}
    </span>
  );
};