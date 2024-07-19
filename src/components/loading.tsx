import { Spinner } from 'react-bootstrap';

function Loading({ loading }: { loading: boolean }) {
  if (!loading) return null;
  return <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />;
}

export default Loading;
