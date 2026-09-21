function Spinner({ full = false, small = false }) {
  if (full) {
    return (
      <div className="spinner-wrapper full">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="spinner-wrapper">
      <div className={`spinner${small ? ' sm' : ''}`} />
    </div>
  );
}

export default Spinner;
