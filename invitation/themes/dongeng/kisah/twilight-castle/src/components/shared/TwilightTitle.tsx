// Judul section twilight — serif emas. API sama seperti FloralTitle (menerima
// children + opsi serif) agar section mudah menukar tanpa ubah pemakaian.
export default function TwilightTitle({
  children,
  serif = true,
}: {
  children: React.ReactNode;
  serif?: boolean;
}) {
  return (
    <h2
      className={serif ? "font-display" : "font-body"}
      style={{
        color: "var(--gold-light)",
        fontSize: "clamp(30px, 8vw, 46px)",
        fontWeight: 500,
        lineHeight: 1.1,
        margin: 0,
        textAlign: "center",
      }}
    >
      {children}
    </h2>
  );
}
