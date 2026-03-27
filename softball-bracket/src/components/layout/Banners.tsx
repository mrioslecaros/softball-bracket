interface BannersProps {
  locked: boolean;
  saveBanner: boolean;
}

export default function Banners({ locked, saveBanner }: BannersProps) {
  return (
    <>
      {locked && (
        <div className="bnr bnr-r">
          🔒 Picks are locked — tournament is underway!
        </div>
      )}
      {saveBanner && (
        <div className="bnr bnr-g">
          ✓ Picks saved
        </div>
      )}
    </>
  );
}