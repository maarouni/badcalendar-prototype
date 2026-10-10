import IconNav from "../components/IconNav";
import FillInHere from "../components/FillInHere";

export default function DiscountsPage() {
  return (
    <>
      <section className="section-intro">
        <IconNav active="discounts" />
        <p className="section-intro-line">
          <strong>Coming soon.</strong> Discount &amp; Gift Certificate listings will work just like Events and Employment — filterable, with a digest you can save to.
        </p>
      </section>
      <div className="page" style={{ padding: "24px" }}>
        <FillInHere>
          Nothing built here yet. Send over what a Discount / Gift Certificate listing should actually contain (fields, categories, redemption flow) and this becomes a real page like Employment.
        </FillInHere>
      </div>
    </>
  );
}
