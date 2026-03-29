export default function LockInModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="ovl">
      <div className="mdl">
        <h3>Lock In Your Picks?</h3>
        <p>
          You will not be able to make any more changes. Are you sure you want to lock in your bracket?
        </p>
        <div className="ma">
          <button className="btn" onClick={onCancel}>No, go back</button>
          <button className="btn btn-g" onClick={onConfirm}>Yes, lock it in</button>
        </div>
      </div>
    </div>
  );
}
