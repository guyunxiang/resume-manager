/* eslint-disable react/require-default-props */
/* defaultProps will be removed from memo components in a future major release */
import React, { useRef, ReactNode, useState, useEffect } from 'react';
import { InputGroup, Button, Form } from 'react-bootstrap';

interface EditComponentProps {
  status: boolean;
  type?: string;
  children: ReactNode;
  name: string;
  id?: string;
  appendBtnText?: string;
  deleteBtnText?: string;
  onDelete?: () => void;
  onAppend?: () => void;
}

const EditComponent: React.FC<EditComponentProps> = React.memo(function EditComponent({
  id,
  status,
  type = 'input',
  children,
  name,
  appendBtnText = '+',
  deleteBtnText = '-',
  onAppend,
  onDelete,
}: EditComponentProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const [value, setValue] = useState('');

  useEffect(() => {
    const childText = React.Children.toArray(children)
      .filter(
        (child): child is string | React.ReactElement =>
          typeof child === 'string' || (typeof child === 'object' && 'props' in child),
      )
      .map((child) => (typeof child === 'string' ? child : child.props.children))
      .join('');
    setValue(childText);
  }, [children]);

  if (!status) {
    return <span className="place-span">{children}</span>;
  }

  if (type === 'textarea') {
    return (
      <Form.Control
        id={id}
        as="textarea"
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        className="form-control edit-textarea"
        rows={5}
        defaultValue={value}
        name={name}
      />
    );
  }

  return (
    <InputGroup id={id}>
      <Form.Control
        ref={inputRef as React.RefObject<HTMLInputElement>}
        className="form-control edit-input"
        type="text"
        defaultValue={value}
        name={name}
      />
      {onAppend ? (
        <Button variant="outline-secondary" onClick={onAppend}>
          {appendBtnText}
        </Button>
      ) : null}
      {onDelete ? (
        <Button variant="outline-danger" onClick={onDelete}>
          {deleteBtnText}
        </Button>
      ) : null}
    </InputGroup>
  );
});

export default EditComponent;
