/* eslint-disable react/require-default-props */
/* defaultProps will be removed from memo components in a future major release */
import React, { useRef, ReactNode, useState, useEffect } from 'react';
import { InputGroup, Button, Form } from 'react-bootstrap';

// Define the props interface for the EditComponent
interface EditComponentProps {
  isEditable: boolean;
  inputType?: 'text' | 'textarea';
  children: ReactNode;
  name: string;
  appendButtonText?: string;
  deleteButtonText?: string;
  onDelete?: () => void;
  onAppend?: () => void;
}

// EditComponent: A customizable input component that can switch between editable and non-editable states
const EditComponent: React.FC<EditComponentProps> = React.memo(function EditComponent({
  isEditable,
  inputType = 'text',
  children,
  name,
  appendButtonText = '+',
  deleteButtonText = '-',
  onAppend,
  onDelete,
}: EditComponentProps) {
  // Refs for input and textarea elements
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // State to hold the current value of the input
  const [value, setValue] = useState('');

  // Effect to update the value when children prop changes
  useEffect(() => {
    // Extract text content from children prop
    const childText = React.Children.toArray(children)
      .filter(
        (child): child is string | React.ReactElement =>
          typeof child === 'string' || (typeof child === 'object' && 'props' in child),
      )
      .map((child) => (typeof child === 'string' ? child : child.props.children))
      .join('');
    setValue(childText);
  }, [children]);

  // If not editable, render as a span
  if (!isEditable) {
    return <span className="place-span">{children}</span>;
  }

  // Render textarea if inputType is 'textarea'
  if (inputType === 'textarea') {
    return (
      <Form.Control
        as="textarea"
        ref={textareaRef}
        className="form-control edit-textarea"
        rows={5}
        defaultValue={value}
        name={name}
      />
    );
  }

  // Render input field with optional append and delete buttons
  return (
    <InputGroup>
      <Form.Control ref={inputRef} className="form-control edit-input" type="text" defaultValue={value} name={name} />
      {onAppend && (
        <Button variant="outline-secondary" onClick={onAppend}>
          {appendButtonText}
        </Button>
      )}
      {onDelete && (
        <Button variant="outline-danger" onClick={onDelete}>
          {deleteButtonText}
        </Button>
      )}
    </InputGroup>
  );
});

export default EditComponent;
