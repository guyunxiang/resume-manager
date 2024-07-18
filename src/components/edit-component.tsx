import React, { useRef, ReactNode } from 'react';

interface EditComponentProps {
  status: boolean;
  type?: string;
  children: ReactNode;
  name: string;
}

const EditComponent: React.FC<EditComponentProps> = React.memo(function EditComponent({
  status,
  type = 'input',
  children,
  name,
}: EditComponentProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  if (!status) {
    return <span className="place-span">{children}</span>;
  }

  const childText = React.Children.toArray(children)
    .filter(
      (child): child is string | React.ReactElement =>
        typeof child === 'string' || (typeof child === 'object' && 'props' in child))
    .map((child) => (typeof child === 'string' ? child : child.props.children))
    .join('');

  if (type === 'textarea') {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        className="form-control edit-textarea"
        rows={5}
        defaultValue={childText}
        name={name}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      className="form-control edit-input"
      type="text"
      defaultValue={childText}
      name={name}
    />
  );
});

EditComponent.defaultProps = {
  type: 'input',
};

export default EditComponent;
