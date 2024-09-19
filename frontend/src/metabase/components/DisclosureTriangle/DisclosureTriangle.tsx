import { Icon } from "metabase/ui";

const DisclosureTriangle = ({
  open,
  className,
}: {
  open: boolean;
  className?: string;
}) => (
  <Icon
    className={className}
    name="expand_arrow"
    style={{
      transition: "transform 300ms ease-out",
      transform: `rotate(${open ? 0 : -90}deg)`,
    }}
  />
);

// eslint-disable-next-line import/no-default-export -- deprecated usage
export default DisclosureTriangle;
