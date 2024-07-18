import React, { useRef, ReactNode } from 'react';
import { InputGroup, Button, Form } from 'react-bootstrap';

interface EditComponentProps {
  status: boolean;
  type?: string;
  children: ReactNode;
  name: string;
  append?: boolean;
  appendText?: string;
  onAppend?: () => void;
}

const EditComponent: React.FC<EditComponentProps> = React.memo(function EditComponent({
  status,
  type = 'input',
  children,
  name,
  append = true,
  appendText = '+',
  onAppend = () => { },
}: EditComponentProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  if (!status) {
    return <span className="place-span">{children}</span>;
  }

  const childText = React.Children.toArray(children)
    .filter(
      (child): child is string | React.ReactElement =>
        typeof child === 'string' || (typeof child === 'object' && 'props' in child),
    )
    .map((child) => (typeof child === 'string' ? child : child.props.children))
    .join('');

  if (type === 'textarea') {
    return (
      <Form.Control
        as="textarea"
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        className="form-control edit-textarea"
        rows={5}
        defaultValue={childText}
        name={name}
      />
    );
  }
  
  if (!append) {
    return (
      <Form.Control
        ref={inputRef as React.RefObject<HTMLInputElement>}
        className="form-control edit-input"
        type="text"
        defaultValue={childText}
        name={name}
      />
    );
  }

  return (
    <InputGroup>
      <Form.Control
        ref={inputRef as React.RefObject<HTMLInputElement>}
        className="form-control edit-input"
        type="text"
        defaultValue={childText}
        name={name}
      />
      <Button variant="outline-secondary" onClick={onAppend}>
        {appendText}
      </Button>
    </InputGroup>
  );
});

EditComponent.defaultProps = {
  type: 'input',
  append: true,
  appendText: '+',
  onAppend: () => { },
};

export default EditComponent;
