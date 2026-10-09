import IconNav from "../components/IconNav";

export default function DiscountsPage() {
  return (
    <>
      <section className="section-intro">
        <IconNav active="discounts" />
        <p className="section-intro-line">
          <strong>Coming soon.</strong> Discount &amp; Gift Certificate listings will work just like Events and Employment — filterable, with a digest you can save to.
        </p>
      </section>
      <div className="page">
        <div className="empty-state" style={{ margin: "24px" }}>
          This section isn&rsquo;t built yet — check back soon.
        </div>
      </div>
    </>
  );
}
