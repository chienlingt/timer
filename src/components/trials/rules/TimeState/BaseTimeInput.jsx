import PropTypes from "prop-types";

const BaseTimeInput = ({
  type,
  value,
  onChange,
  className = "",
  name = "",
  placeholder = "",
}) => {
  return (
    <input
      type={type}
      className={`px-3 py-2 border rounded ml-2 ${className}`}
      value={value || ""}
      onChange={onChange}
      name={name}
      placeholder={placeholder}
    />
  );
};

BaseTimeInput.propTypes = {
  type: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  name: PropTypes.string,
  placeholder: PropTypes.string,
};

export default BaseTimeInput;
