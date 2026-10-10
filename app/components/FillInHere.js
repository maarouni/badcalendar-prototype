// Temporary callout marking a spot where Cesar needs to drop in real content.
// Not meant to ship — strip these out (or search "FillInHere") once he's filled
// the real data in.

export default function FillInHere({ children }) {
  return (
    <div className="fill-in-here" role="note">
      <svg className="fih-cloud" width="30" height="20" viewBox="0 0 30 20" fill="currentColor" aria-hidden="true">
        <path d="M8 16a5.5 5.5 0 0 1-.6-10.97A6.5 6.5 0 0 1 20 6.2 5 5 0 0 1 23 16H8Z" />
      </svg>
      <div className="fih-body">
        <div className="fih-title">Cesar! Fill in here →</div>
        <div className="fih-note">{children}</div>
      </div>
    </div>
  );
}
