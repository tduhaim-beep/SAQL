import { SliceScreen } from "../../../application-ui";

export default function JourneyNotFound() {
  return <SliceScreen title="الرحلة غير متاحة" screenId="ORG-O02">
    <p role="alert">تعذر عرض رحلة التدريب.</p>
  </SliceScreen>;
}
