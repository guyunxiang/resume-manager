import { Spinner } from 'react-bootstrap';

function PageLoading() {
  return (
    <div className="loading-content">
      <div className="d-flex align-items-center gap-3">
        <Spinner animation="border" />
      </div>
    </div>
  );
}

export default PageLoading;
