import PropTypes from "prop-types";

const TextInput = ({
  value,
  onChange,
  name,
  placeholder,
  maxLength,
  className,
}) => (
  <input
    type="text"
    className={`px-3 py-2 border rounded mb-2 mx-2 ${className}`}
    value={value}
    onChange={onChange}
    name={name}
    placeholder={placeholder}
    maxLength={maxLength}
  />
);

TextInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  maxLength: PropTypes.number,
  className: PropTypes.string,
};

TextInput.defaultProps = {
  maxLength: 255,
  className: "",
};

export default TextInput;
