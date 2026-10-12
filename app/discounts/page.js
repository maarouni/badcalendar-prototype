import PageTemplate from "../components/PageTemplate";
import FillInHere from "../components/FillInHere";

export default function DiscountsPage() {
  return (
    <PageTemplate
      section="discounts"
      status="construction"
      title="Discount / Gift Certificates"
      subtitle="Certificate Digest"
      intro="Discount and gift certificate listings will work just like Events and Employment: filterable by region and industry, with a digest you can save to."
    >
      <FillInHere>
        Nothing built here yet. Send over what a Discount / Gift Certificate listing should actually contain (fields, categories, redemption flow) and this becomes a real page like Employment.
      </FillInHere>
    </PageTemplate>
  );
}
